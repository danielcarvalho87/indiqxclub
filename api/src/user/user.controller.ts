// user.controller.ts
// Controller de usuário com autorização por nível e escopo de master
// Localização: src/user/user.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  HttpCode,
  ForbiddenException,
  NotFoundException,
  Query,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService, sanitizeUser } from "./user.service";

import { IsPublic } from "../auth/decorators/is-public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { Roles } from "../auth/roles/roles.decorator";
import { AccessLevel, isAnyAdmin, isFullAdmin } from "../auth/roles/level.util";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";

/**
 * Campos que só um administrador pode definir. Enviados por um parceiro,
 * permitiriam elevar o próprio nível ou trocar de empresa.
 */
const PRIVILEGED_FIELDS = [
  "level",
  "status",
  "master_id",
  "plano_id",
  "plano_expired",
  "email_verified",
];

/** Campos que nenhum cliente pode gravar via API. */
const NEVER_WRITABLE_FIELDS = [
  "id",
  "resetPasswordToken",
  "resetPasswordExpires",
  "email_verification_token",
  "email_verification_expires",
  "is_online",
  "last_login",
  "last_activity",
];

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ============================================
  // IMPORTANTE: Rotas estáticas ANTES de rotas com :id
  // O NestJS processa rotas na ordem em que são declaradas
  // ============================================

  /**
   * Busca dados públicos de um usuário
   * GET /user/publico/:id
   * Retorna apenas os campos de exibição pública.
   */
  @Get("publico/:id")
  @IsPublic()
  async findOnePublic(@Param("id") id: string) {
    const user = await this.userService.findOnePublic(+id);
    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }
    return user;
  }

  /**
   * Busca os dados do usuário autenticado
   * GET /user/me
   */
  @Get("me")
  async getMe(@CurrentUser() currentUser: UserFromJwt) {
    const user = await this.userService.findOne(currentUser.id);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return user;
  }

  /**
   * Busca todos os usuários online
   * GET /user/online/all
   */
  @Get("online/all")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  async getOnlineUsers() {
    const users = await this.userService.getOnlineUsers();
    return {
      count: users.length,
      users,
    };
  }

  /**
   * Obtém estatísticas de usuários online/offline
   * GET /user/online/stats
   */
  @Get("online/stats")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  async getOnlineStats() {
    return this.userService.getOnlineStats();
  }

  /**
   * Busca usuários online em tempo real (com limpeza de inativos)
   * GET /user/online/realtime
   */
  @Get("online/realtime")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  async getOnlineUsersRealtime() {
    return this.userService.getOnlineUsersRealtime();
  }

  /**
   * Marca usuários inativos como offline
   * POST /user/online/cleanup
   */
  @Post("online/cleanup")
  @Roles(AccessLevel.FullAdmin)
  @HttpCode(HttpStatus.OK)
  async cleanupInactiveUsers(@Body() body?: { inactiveMinutes?: number }) {
    const inactiveMinutes = body?.inactiveMinutes || 5;
    const affected =
      await this.userService.markInactiveUsersOffline(inactiveMinutes);
    return {
      message: `${affected} usuário(s) marcado(s) como offline`,
      affected,
      inactiveMinutes,
    };
  }

  @Get("filterlevel/:level")
  @Roles(AccessLevel.FullAdmin)
  findLevel(@Param("level") level: string) {
    return this.userService.findLevel(level);
  }

  /** Parceiros vinculados a um master. */
  @Get("master/:masterId")
  getUsuariosByMaster(
    @Param("masterId") masterId: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    if (
      !isFullAdmin(currentUser.level) &&
      Number(masterId) !== Number(currentUser.id)
    ) {
      throw new ForbiddenException(
        "Você só pode listar os parceiros vinculados a você.",
      );
    }

    return this.userService.getUsuariosByMaster(+masterId);
  }

  // ============================================
  // Rotas com parâmetros dinâmicos (:id)
  // Devem vir DEPOIS das rotas estáticas
  // ============================================

  @Post()
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    const data = { ...createUserDto };

    for (const field of NEVER_WRITABLE_FIELDS) {
      delete data[field];
    }

    // Administrador só cria parceiros dentro da própria empresa.
    if (!isFullAdmin(currentUser.level)) {
      data.level = "Parceiro";
      data.master_id = currentUser.id;
    }

    return this.userService.create(data);
  }

  @Get()
  findAll(
    @CurrentUser() currentUser: UserFromJwt,
    @Query() query: PaginationQueryDto,
  ) {
    return this.userService.findAll(currentUser, query);
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    const user = await this.userService.assertCanManage(currentUser, +id);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return sanitizeUser(user);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    const target = await this.userService.assertCanManage(currentUser, +id);

    if (!target) {
      throw new NotFoundException("Usuário não encontrado");
    }

    const data = { ...updateUserDto };

    for (const field of NEVER_WRITABLE_FIELDS) {
      delete data[field];
    }

    // Quem não é administrador não altera nível, status nem vínculo —
    // nem no próprio cadastro.
    if (!isAnyAdmin(currentUser.level)) {
      for (const field of PRIVILEGED_FIELDS) {
        delete data[field];
      }
    }

    // Administrador não promove ninguém (inclusive a si mesmo) acima do
    // próprio nível, e não move usuários para outra empresa.
    if (!isFullAdmin(currentUser.level)) {
      if (data.level && data.level !== target.level) {
        delete data.level;
      }
      if (
        data.master_id !== undefined &&
        Number(data.master_id) !== Number(target.master_id)
      ) {
        delete data.master_id;
      }
    }

    // Troca de e-mail exige que o novo endereço esteja livre.
    if (data.email) {
      data.email = data.email.trim().toLowerCase();
      if (data.email !== target.email) {
        const existing = await this.userService.findByEmail(data.email);
        if (existing && existing.id !== target.id) {
          throw new HttpException(
            "E-mail já cadastrado",
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    return this.userService.update(+id, data);
  }

  @Delete(":id")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  async remove(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    if (Number(id) === Number(currentUser.id)) {
      throw new ForbiddenException(
        "Não é possível excluir o próprio usuário.",
      );
    }

    const target = await this.userService.assertCanManage(currentUser, +id);

    if (!target) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return this.userService.remove(+id);
  }

  // Remove apenas a foto de perfil
  @Delete(":id/foto-perfil")
  async removeProfilePhoto(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    const user = await this.userService.assertCanManage(currentUser, +id);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    await this.userService.removeProfilePhoto(+id);

    return { message: "Foto de perfil removida com sucesso" };
  }

  // ============================================
  // ROTAS - Status Online e Último Login
  // ============================================

  /**
   * Registra o login do usuário
   * POST /user/:id/login
   */
  @Post(":id/login")
  @HttpCode(HttpStatus.OK)
  async registerLogin(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    await this.userService.assertCanManage(currentUser, +id);

    const user = await this.userService.registerLogin(+id);
    return {
      message: "Login registrado com sucesso",
      user: {
        id: user.id,
        name: user.name,
        sobrenome: user.sobrenome,
        is_online: user.is_online,
        last_login: user.last_login,
        last_activity: user.last_activity,
      },
    };
  }

  /**
   * Registra o logout do usuário
   * POST /user/:id/logout
   */
  @Post(":id/logout")
  @HttpCode(HttpStatus.OK)
  async registerLogout(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    const userId = parseInt(id, 10);

    if (!userId || isNaN(userId)) {
      return {
        message: "ID do usuário não fornecido ou inválido",
        success: false,
      };
    }

    await this.userService.assertCanManage(currentUser, userId);

    const user = await this.userService.registerLogout(userId);

    return {
      message: "Logout registrado com sucesso",
      success: true,
      user: user
        ? {
            id: user.id,
            is_online: user.is_online,
            last_activity: user.last_activity,
          }
        : null,
    };
  }

  /**
   * Atualiza a última atividade do usuário (heartbeat)
   * POST /user/:id/heartbeat
   */
  @Post(":id/heartbeat")
  @HttpCode(HttpStatus.OK)
  async heartbeat(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    if (Number(id) !== Number(currentUser.id)) {
      throw new ForbiddenException(
        "Só é possível atualizar a própria atividade.",
      );
    }

    await this.userService.updateLastActivity(+id);
    return {
      message: "Atividade atualizada",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Define o status online do usuário
   * PATCH /user/:id/online-status
   */
  @Patch(":id/online-status")
  async setOnlineStatus(
    @Param("id") id: string,
    @Body() body: { is_online: boolean },
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    await this.userService.assertCanManage(currentUser, +id);

    const user = await this.userService.setOnlineStatus(+id, body.is_online);
    return {
      message: `Status atualizado para ${body.is_online ? "online" : "offline"}`,
      user: {
        id: user.id,
        is_online: user.is_online,
        last_activity: user.last_activity,
      },
    };
  }

  /**
   * Busca o status online de um usuário específico
   * GET /user/:id/online-status
   */
  @Get(":id/online-status")
  async getUserOnlineStatus(
    @Param("id") id: string,
    @CurrentUser() currentUser: UserFromJwt,
  ) {
    await this.userService.assertCanManage(currentUser, +id);

    return this.userService.getUserOnlineStatus(+id);
  }
}

export { UserService };
