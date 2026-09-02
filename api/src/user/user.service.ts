// user.service.ts (COMPLETO ATUALIZADO)
// Service de usuário com métodos para status online, último login, validação de e-mail e tipo de pessoa
// Localização: src/user/user.service.ts

import {
  Inject,
  Injectable,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreatePublicUserDto } from "./dto/create-public-user.dto";
import { Brackets, Repository } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { EmailService } from "../email/email.service";
import { isAdmin, isFullAdmin } from "../auth/roles/level.util";
import {
  buildPaginated,
  escapeLike,
  PaginationQueryDto,
  resolvePaging,
} from "../common/dto/pagination-query.dto";

/**
 * Campos que nunca devem sair da API: hash de senha e tokens de
 * verificação/reset (que permitiriam assumir a conta).
 */
const SENSITIVE_FIELDS = [
  "password",
  "resetPasswordToken",
  "resetPasswordExpires",
  "email_verification_token",
  "email_verification_expires",
] as const;

/** Remove campos sensíveis de um usuário (ou de uma lista deles). */
export function sanitizeUser<T>(user: T): T;
export function sanitizeUser<T>(user: T[]): T[];
export function sanitizeUser(user: any): any {
  if (!user) return user;
  if (Array.isArray(user)) return user.map((item) => sanitizeUser(item));

  const clean = { ...user };
  for (const field of SENSITIVE_FIELDS) {
    delete clean[field];
  }
  return clean;
}

@Injectable()
export class UserService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const email = (createUserDto.email || "").trim().toLowerCase();

    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException("E-mail já cadastrado");
    }

    // As colunas de endereço são NOT NULL sem default no banco: omitir
    // qualquer uma delas fazia o INSERT falhar com erro 500.
    const enderecoPadrao = {
      cep: createUserDto.cep ?? "",
      logradouro: createUserDto.logradouro ?? "",
      bairro: createUserDto.bairro ?? "",
      complemento: createUserDto.complemento ?? "",
      numero: createUserDto.numero ?? "",
      localidade: createUserDto.localidade ?? "",
      uf: createUserDto.uf ?? "",
    };

    const data = {
      ...createUserDto,
      ...enderecoPadrao,
      email,
      password: await bcrypt.hash(createUserDto.password, 10),
      level: createUserDto.level || "Parceiro",
      status: createUserDto.status || "Inativo",
      is_online: false,
      last_login: null,
      last_activity: null,
      tipo_pessoa: createUserDto.tipo_pessoa || "fisica",
    };
    const createdUser = await this.userRepository.save({ ...data });
    return sanitizeUser(createdUser);
  }

  async findAll(user?: UserFromJwt, query?: PaginationQueryDto) {
    const qb = this.userRepository.createQueryBuilder("user");

    // Recorte de visibilidade
    if (user && !isFullAdmin(user.level)) {
      if (isAdmin(user.level)) {
        qb.andWhere(
          new Brackets((w) => {
            w.where("user.master_id = :scopeId", { scopeId: user.id }).orWhere(
              "user.id = :scopeId",
              { scopeId: user.id },
            );
          }),
        );
      } else {
        qb.andWhere("user.id = :scopeId", { scopeId: user.id });
      }
    }

    const termo = query?.search?.trim();
    if (termo) {
      const padrao = `%${escapeLike(termo)}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where("user.name LIKE :termo", { termo: padrao })
            .orWhere("user.sobrenome LIKE :termo", { termo: padrao })
            .orWhere("user.email LIKE :termo", { termo: padrao })
            .orWhere("user.cpf LIKE :termo", { termo: padrao });
        }),
      );
    }

    qb.orderBy("user.id", "DESC");

    // Sem `page` a resposta continua sendo o array completo.
    if (query?.page === undefined) {
      return sanitizeUser(await qb.getMany());
    }

    const { page, limit, skip } = resolvePaging(query);
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return buildPaginated(sanitizeUser(data), total, page, limit);
  }

  /** Uso interno: retorna a entidade completa, incluindo campos sensíveis. */
  findOneRaw(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOne(id: number) {
    return sanitizeUser(await this.userRepository.findOne({ where: { id } }));
  }

  /**
   * Verifica se `actor` pode ler/alterar o usuário `targetId`.
   * FullAdmin: todos. Administrador: ele mesmo e seus parceiros.
   * Parceiro: apenas ele mesmo.
   */
  async assertCanManage(actor: UserFromJwt, targetId: number): Promise<User> {
    const target = await this.userRepository.findOne({
      where: { id: targetId },
    });

    if (!target) {
      return null;
    }

    if (isFullAdmin(actor.level)) {
      return target;
    }

    if (Number(target.id) === Number(actor.id)) {
      return target;
    }

    if (isAdmin(actor.level) && Number(target.master_id) === Number(actor.id)) {
      return target;
    }

    throw new ForbiddenException(
      "Você não tem permissão para acessar este usuário.",
    );
  }

  async findOnePublic(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: ["id", "name", "sobrenome", "nconselho", "foto_perfil"],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Buscar o usuário atual antes da atualização
    const currentUser = await this.userRepository.findOne({ where: { id } });

    // Preparar dados para atualização
    const data = { ...updateUserDto };

    // Só faz hash da senha se ela foi fornecida
    if (updateUserDto.password && updateUserDto.password.trim() !== "") {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      // Remove o campo password se não foi fornecido ou está vazio
      delete data.password;
    }

    // Tratar campos únicos - converter strings vazias em null
    if (data.cnpj !== undefined) {
      if (data.cnpj === "" || data.cnpj === null || data.cnpj === "null") {
        data.cnpj = null;
      }
    }

    // Tratar outros campos que podem vir vazios
    if (data.cpf !== undefined && data.cpf === "") {
      data.cpf = null;
    }

    // Atualizar o usuário existente
    await this.userRepository.update(id, data);

    // Buscar o usuário atualizado para retornar
    const updatedUser = await this.userRepository.findOne({ where: { id } });

    // Enviar e-mail de ativação se o status mudou para Ativo
    if (
      currentUser &&
      currentUser.status !== "Ativo" &&
      updatedUser.status === "Ativo"
    ) {
      try {
        await this.emailService.sendPartnerActivationEmail(
          updatedUser.email,
          updatedUser.name,
        );
      } catch (error) {
        console.error("Erro ao enviar e-mail de ativação de parceiro:", error);
      }
    }

    return sanitizeUser(updatedUser);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email: (email || "").trim().toLowerCase(),
      },
    });
  }

  // ============================================
  // MÉTODOS ADICIONADOS - Validação de E-mail e CNPJ
  // ============================================

  /**
   * Busca usuário pelo CNPJ
   * @param cnpj CNPJ sem formatação
   */
  async findByCnpj(cnpj: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        cnpj,
      },
    });
  }

  /**
   * Busca usuário pelo token de verificação de e-mail
   * @param token Token de verificação
   */
  async findByEmailToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: {
        email_verification_token: token,
      },
    });
  }

  /**
   * Busca usuário pelo hash do token de reset de senha.
   * O banco guarda o sha256 do token: o valor em claro só existe no link
   * enviado por e-mail, então um vazamento da tabela não permite o reset.
   */
  async findByResetTokenHash(tokenHash: string): Promise<User | null> {
    if (!tokenHash) return null;

    return this.userRepository.findOne({
      where: {
        resetPasswordToken: tokenHash,
      },
    });
  }

  /** Grava o hash do token de reset e sua expiração. */
  async setResetToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      resetPasswordToken: tokenHash,
      resetPasswordExpires: expiresAt,
    });
  }

  /** Define uma nova senha e invalida o token de reset. */
  async resetPassword(userId: number, plainPassword: string): Promise<void> {
    await this.userRepository.update(userId, {
      password: await bcrypt.hash(plainPassword, 10),
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  /**
   * Verifica o e-mail do usuário (marca como verificado)
   * @param userId ID do usuário
   */
  async verifyEmail(userId: number): Promise<User> {
    await this.userRepository.update(userId, {
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
      // status: "Ativo", // Removido: O status só deve mudar para Ativo após o pagamento
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    return sanitizeUser(user) as User;
  }

  /**
   * Atualiza o token de verificação de e-mail
   * @param userId ID do usuário
   * @param token Novo token
   * @param expiresAt Data de expiração
   */
  async updateEmailVerificationToken(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      email_verification_token: token,
      email_verification_expires: expiresAt,
    });
  }

  // ============================================
  // MÉTODOS EXISTENTES - Level e Usuários
  // ============================================

  async findLevel(level: string) {
    return sanitizeUser(
      await this.userRepository.find({
        where: {
          level: level,
        },
      }),
    );
  }

  async getUsuarios(userId: number) {
    return sanitizeUser(
      await this.userRepository.find({
        where: {
          id: userId,
        },
      }),
    );
  }

  // Função para buscar os parceiros vinculados a um master
  async getUsuariosByMaster(masterId: number) {
    return sanitizeUser(
      await this.userRepository.find({
        where: { master_id: masterId, level: "Parceiro" },
      }),
    );
  }

  // ============================================
  // MÉTODOS - Status Online e Último Login
  // ============================================

  /**
   * Registra o login do usuário
   * Atualiza is_online para true, last_login e last_activity
   */
  async registerLogin(userId: number): Promise<User> {
    const now = new Date();

    await this.userRepository.update(userId, {
      is_online: true,
      last_login: now,
      last_activity: now,
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    return sanitizeUser(user) as User;
  }

  /**
   * Registra o logout do usuário
   * Atualiza is_online para false
   */
  async registerLogout(userId: number): Promise<User> {
    await this.userRepository.update(userId, {
      is_online: false,
      last_activity: new Date(),
    });

    const user = await this.userRepository.findOne({ where: { id: userId } });
    return sanitizeUser(user) as User;
  }

  /**
   * Atualiza a última atividade do usuário (heartbeat)
   * Usado para manter o status online atualizado
   */
  async updateLastActivity(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      last_activity: new Date(),
      is_online: true,
    });
  }

  /**
   * Define o status online do usuário
   */
  async setOnlineStatus(userId: number, isOnline: boolean): Promise<User> {
    const updateData: any = {
      is_online: isOnline,
    };

    if (isOnline) {
      updateData.last_activity = new Date();
    }

    await this.userRepository.update(userId, updateData);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    return sanitizeUser(user) as User;
  }

  /**
   * Busca todos os usuários online
   */
  async getOnlineUsers(): Promise<User[]> {
    const users = await this.userRepository.find({
      where: {
        is_online: true,
      },
      select: [
        "id",
        "name",
        "sobrenome",
        "email",
        "level",
        "last_activity",
        "last_login",
        "foto_perfil",
        "is_online",
      ],
    });

    return sanitizeUser(users) as User[];
  }

  /**
   * Marca usuários como offline se não tiveram atividade nos últimos X minutos
   * Útil para executar via cron job
   * @param inactiveMinutes - Minutos de inatividade para considerar offline (padrão: 5)
   */
  async markInactiveUsersOffline(inactiveMinutes: number = 5): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - inactiveMinutes);

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ is_online: false })
      .where("is_online = :isOnline", { isOnline: true })
      .andWhere("last_activity < :cutoffTime", { cutoffTime })
      .execute();

    return result.affected || 0;
  }

  /**
   * Obtém estatísticas de usuários online/offline
   */
  async getOnlineStats(): Promise<{
    online: number;
    offline: number;
    total: number;
  }> {
    const [online, total] = await Promise.all([
      this.userRepository.count({ where: { is_online: true } }),
      this.userRepository.count(),
    ]);

    return {
      online,
      offline: total - online,
      total,
    };
  }

  /**
   * Busca o status online de um usuário específico
   */
  async getUserOnlineStatus(userId: number): Promise<{
    is_online: boolean;
    last_login: Date | null;
    last_activity: Date | null;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["is_online", "last_login", "last_activity"],
    });

    if (!user) {
      return {
        is_online: false,
        last_login: null,
        last_activity: null,
      };
    }

    return {
      is_online: user.is_online,
      last_login: user.last_login,
      last_activity: user.last_activity,
    };
  }

  /**
   * Busca usuários online em tempo real com informações completas
   * Usado pelo dashboard do admin para monitoramento
   */
  async getOnlineUsersRealtime(): Promise<{
    users: Partial<User>[];
    stats: { online: number; offline: number; total: number };
  }> {
    // Primeiro, marca usuários inativos como offline (5 minutos de inatividade)
    await this.markInactiveUsersOffline(5);

    // Busca usuários online
    const onlineUsers = await this.userRepository.find({
      where: { is_online: true },
      select: [
        "id",
        "name",
        "sobrenome",
        "email",
        "level",
        "foto_perfil",
        "is_online",
        "last_login",
        "last_activity",
      ],
      order: { last_activity: "DESC" },
    });

    // Busca estatísticas
    const stats = await this.getOnlineStats();

    return {
      users: sanitizeUser(onlineUsers),
      stats,
    };
  }

  // ============================================
  // Registro Público (existente)
  // ============================================

  /**
   * Cria o usuário do cadastro público.
   * Nível, status e flags de verificação são definidos aqui, nunca pelo
   * corpo da requisição.
   */
  async createPublicUser(
    userData: CreatePublicUserDto & {
      emailVerificationToken?: string;
      emailVerificationExpires?: Date;
    },
  ): Promise<User> {
    const user = this.userRepository.create({
      name: userData.name,
      sobrenome: userData.sobrenome || "",
      email: (userData.email || "").trim().toLowerCase(),
      password: await bcrypt.hash(userData.password, 10),
      cpf: userData.cpf || "",
      telefone: userData.telefone || "",
      plano_id: userData.plano_id || 0,
      master_id: userData.master_id || 0,
      nascimento: userData.nascimento || "",
      sexo: userData.sexo || "",
      ecivil: userData.ecivil || "",
      especialidade: userData.especialidade || "",
      nconselho: userData.nconselho || "",
      // Definidos pelo servidor: o parceiro entra inativo e só é liberado
      // após confirmar o e-mail e ser aprovado pelo administrador.
      level: "Parceiro",
      status: "Inativo",
      email_verified: false,
      email_verification_token: userData.emailVerificationToken || null,
      email_verification_expires: userData.emailVerificationExpires || null,
      tipo_pessoa: userData.tipo_pessoa || "fisica",
      razao_social: userData.razao_social || null,
      cnpj: userData.cnpj || null,
      cep: userData.cep || "",
      logradouro: userData.logradouro || "",
      bairro: userData.bairro || "",
      complemento: userData.complemento || "",
      numero: userData.numero || "",
      localidade: userData.localidade || "",
      uf: userData.uf || "",
      plano_expired: null,
      foto_perfil: null,
      foto_perfil_firebase_path: null,
      is_online: false,
      last_login: null,
      last_activity: null,
    });

    return this.userRepository.save(user);
  }

  // ============================================
  // Métodos para foto de perfil (existentes)
  // ============================================

  /**
   * Atualiza apenas a foto de perfil do usuário
   */
  async updateProfilePhoto(
    id: number,
    fotoUrl: string,
    firebasePath: string,
  ): Promise<User> {
    await this.userRepository.update(id, {
      foto_perfil: fotoUrl,
      foto_perfil_firebase_path: firebasePath,
    });

    return this.findOne(id);
  }

  /**
   * Remove a foto de perfil do usuário
   */
  async removeProfilePhoto(id: number): Promise<User> {
    await this.userRepository.update(id, {
      foto_perfil: null,
      foto_perfil_firebase_path: null,
    });

    return this.findOne(id);
  }

  /**
   * Busca informações da foto de perfil
   */
  async getProfilePhotoInfo(
    id: number,
  ): Promise<{ foto_perfil: string; foto_perfil_firebase_path: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ["foto_perfil", "foto_perfil_firebase_path"],
    });

    return {
      foto_perfil: user?.foto_perfil || null,
      foto_perfil_firebase_path: user?.foto_perfil_firebase_path || null,
    };
  }
}
