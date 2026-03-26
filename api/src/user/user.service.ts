// user.service.ts (COMPLETO ATUALIZADO)
// Service de usuário com métodos para status online, último login, validação de e-mail e tipo de pessoa
// Localização: src/user/user.service.ts

import { Inject, Injectable, ConflictException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Repository, LessThan } from "typeorm";
import { User } from "./entities/user.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 8),
      is_online: false,
      last_login: null,
      last_activity: null,
      tipo_pessoa: createUserDto.tipo_pessoa || "fisica",
    };
    const createdUser = await this.userRepository.save({ ...data });
    return {
      ...createdUser,
      password: undefined,
    };
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }

  async findOnePublic(id: number) {
    return this.userRepository.findOne({
      where: { id },
      select: ["id", "name", "sobrenome", "nconselho", "foto_perfil"],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Preparar dados para atualização
    const data = { ...updateUserDto };

    // Só faz hash da senha se ela foi fornecida
    if (updateUserDto.password && updateUserDto.password.trim() !== "") {
      data.password = await bcrypt.hash(updateUserDto.password, 8);
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

    return {
      ...updatedUser,
      password: undefined,
    };
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
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
    return {
      ...user,
      password: undefined,
    } as User;
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
    return this.userRepository.find({
      where: {
        level: level,
      },
    });
  }

  async getUsuarios(userId: number) {
    return this.userRepository.find({
      where: {
        id: userId,
      },
    });
  }

  // Função para buscar usuários com níveis abaixo do master
  async getUsuariosByMaster(masterId: number) {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.level > :level", { level: 2 })
      .andWhere("user.master_id = :masterId", { masterId })
      .getMany();
  }

  // Função para listar usuários baseado no nível do usuário logado
  async getUsuariosByUserLevel(userId: number, userLevel: number) {
    if (userLevel === 1) {
      // Admin vê todos os usuários
      return this.userRepository.find();
    } else if (userLevel === 2) {
      // Level 2 vê:
      // 1. Seu próprio perfil (level 2)
      // 2. Usuários level 3 que ele gerencia (master_id = userId)
      return this.userRepository
        .createQueryBuilder("user")
        .where(
          "(user.id = :userId) OR (user.master_id = :userId AND user.level >= 3)",
          { userId },
        )
        .getMany();
    } else {
      // Level 3 e outros veem apenas seu próprio usuário
      return this.userRepository.find({
        where: {
          id: userId,
        },
      });
    }
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
    return {
      ...user,
      password: undefined,
    } as User;
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
    return {
      ...user,
      password: undefined,
    } as User;
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
    return {
      ...user,
      password: undefined,
    } as User;
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

    return users.map((user) => ({
      ...user,
      password: undefined,
    })) as User[];
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
      users: onlineUsers.map((user) => ({
        ...user,
        password: undefined,
      })),
      stats,
    };
  }

  // ============================================
  // Registro Público (existente)
  // ============================================

  /**
   * Método específico para criar usuário através do registro público
   */
  async createPublicUser(userData: {
    name: string;
    sobrenome?: string;
    email: string;
    password: string;
    cpf?: string;
    telefone?: string;
    plano_id: number;
    level?: string;
    status?: string;
    master_id?: number;
    nascimento?: string;
    sexo?: string;
    ecivil?: string;
    especialidade?: string;
    nconselho?: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      name: userData.name,
      sobrenome: userData.sobrenome || "",
      email: userData.email,
      password: userData.password,
      cpf: userData.cpf || "",
      telefone: userData.telefone || "",
      plano_id: userData.plano_id,
      level: userData.level || "2",
      status: userData.status || "Inativo",
      master_id: userData.master_id || 0,
      nascimento: userData.nascimento || "",
      sexo: userData.sexo || "",
      ecivil: userData.ecivil || "",
      especialidade: userData.especialidade || "",
      nconselho: userData.nconselho || "",
      plano_expired: null,
      foto_perfil: null,
      foto_perfil_firebase_path: null,
      // Novos campos
      is_online: false,
      last_login: null,
      last_activity: null,
    });

    return await this.userRepository.save(user);
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
