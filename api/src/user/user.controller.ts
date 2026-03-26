// user.controller.ts (ATUALIZADO)
// Controller de usuário com endpoints para status online e último login
// Localização: src/user/user.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpException,
  HttpStatus,
  HttpCode,
  UseGuards,
  Request,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"; // Ajuste o path conforme sua estrutura

// Configuração do multer para memória (necessário para Firebase)
const multerConfig = {
  storage: memoryStorage(),
  fileFilter: (req: any, file: any, cb: any) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(
        new HttpException(
          "Apenas arquivos de imagem são permitidos!",
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
};

import { IsPublic } from "../auth/decorators/is-public.decorator";

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
   * Acesso público para visualização de profissional em prontuários
   */
  @Get("publico/:id")
  @IsPublic()
  async findOnePublic(@Param("id") id: string) {
    try {
      const user = await this.userService.findOnePublic(+id);
      if (!user) {
        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Erro ao buscar usuário: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Busca os dados do usuário autenticado
   * GET /user/me
   * Requer autenticação JWT
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    try {
      // O JwtAuthGuard adiciona o usuário decodificado em req.user
      const userId = req.user?.id || req.user?.sub || req.user?.userId;

      if (!userId) {
        throw new HttpException(
          "Usuário não identificado no token",
          HttpStatus.UNAUTHORIZED,
        );
      }

      const user = await this.userService.findOne(+userId);

      if (!user) {
        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
      }

      // Retornar dados do usuário (sem informações sensíveis como senha)
      const { senha, ...userWithoutPassword } = user as any;

      return userWithoutPassword;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        `Erro ao buscar dados do usuário: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca todos os usuários online
   * GET /user/online/all
   */
  @Get("online/all")
  async getOnlineUsers() {
    try {
      const users = await this.userService.getOnlineUsers();
      return {
        count: users.length,
        users,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar usuários online: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtém estatísticas de usuários online/offline
   * GET /user/online/stats
   */
  @Get("online/stats")
  async getOnlineStats() {
    try {
      return await this.userService.getOnlineStats();
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar estatísticas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca usuários online em tempo real (com limpeza de inativos)
   * GET /user/online/realtime
   * Ideal para dashboard de admin
   */
  @Get("online/realtime")
  async getOnlineUsersRealtime() {
    try {
      return await this.userService.getOnlineUsersRealtime();
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar usuários em tempo real: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Marca usuários inativos como offline
   * POST /user/online/cleanup
   * Pode ser usado manualmente ou via cron job
   */
  @Post("online/cleanup")
  @HttpCode(HttpStatus.OK)
  async cleanupInactiveUsers(@Body() body?: { inactiveMinutes?: number }) {
    try {
      const inactiveMinutes = body?.inactiveMinutes || 5;
      const affected =
        await this.userService.markInactiveUsersOffline(inactiveMinutes);
      return {
        message: `${affected} usuário(s) marcado(s) como offline`,
        affected,
        inactiveMinutes,
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao limpar usuários inativos: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get("filterlevel/:level")
  findLevel(@Param() params: any) {
    return this.userService.findLevel(params.level);
  }

  @Get("/user/:userId")
  getUsuarios(@Param() params: any) {
    return this.userService.getUsuarios(params.userId);
  }

  // Nova rota específica para buscar usuários por master
  @Get("master/:masterId")
  getUsuariosByMaster(@Param("masterId") masterId: string) {
    return this.userService.getUsuariosByMaster(+masterId);
  }

  // ============================================
  // Rotas com parâmetros dinâmicos (:id)
  // Devem vir DEPOIS das rotas estáticas
  // ============================================

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.create(createUserDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        `Erro ao criar usuário: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  findAll(
    @Query("userId") userId?: string,
    @Query("userLevel") userLevel?: string,
  ) {
    // Se userId e userLevel foram fornecidos, usar a nova lógica
    if (userId && userLevel) {
      return this.userService.getUsuariosByUserLevel(+userId, +userLevel);
    }
    // Caso contrário, manter comportamento original
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(+id, updateUserDto);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        `Erro ao atualizar usuário: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    try {
      // Buscar usuário para deletar imagem do Firebase
      const user = await this.userService.findOne(+id);

      return await this.userService.remove(+id);
    } catch (error) {
      throw new HttpException(
        `Erro ao remover usuário: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Nova rota para remover apenas a foto de perfil
  @Delete(":id/foto-perfil")
  async removeProfilePhoto(@Param("id") id: string) {
    try {
      const user = await this.userService.findOne(+id);

      if (!user) {
        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
      }

      // Deletar imagem do Firebase

      // Atualizar usuário removendo a foto
      await this.userService.update(+id, {
        foto_perfil: null,
        foto_perfil_firebase_path: null,
      } as UpdateUserDto);

      return { message: "Foto de perfil removida com sucesso" };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        `Erro ao remover foto de perfil: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  async registerLogin(@Param("id") id: string) {
    try {
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
    } catch (error) {
      throw new HttpException(
        `Erro ao registrar login: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Registra o logout do usuário
   * POST /user/:id/logout
   * Aceita requisições com ou sem autenticação para garantir que o logout seja registrado
   */
  @Post(":id/logout")
  @HttpCode(HttpStatus.OK)
  async registerLogout(
    @Param("id") id: string,
    @Body() body?: { userId?: number },
  ) {
    try {
      // Usar o ID da URL ou do body como fallback
      const userId = parseInt(id) || body?.userId;

      if (!userId || isNaN(userId)) {
        console.log("Logout: ID do usuário inválido", { id, body });
        return {
          message: "ID do usuário não fornecido ou inválido",
          success: false,
        };
      }

      console.log("Processando logout para usuário:", userId);

      const user = await this.userService.registerLogout(userId);

      console.log(
        "Logout registrado com sucesso para usuário:",
        userId,
        "is_online:",
        user?.is_online,
      );

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
    } catch (error) {
      console.error("Erro ao registrar logout:", error);
      // Retorna sucesso parcial para não quebrar o fluxo do frontend
      return {
        message: "Erro ao registrar logout, mas continuando...",
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Atualiza a última atividade do usuário (heartbeat)
   * POST /user/:id/heartbeat
   * Deve ser chamado periodicamente pelo frontend (ex: a cada 1-2 minutos)
   */
  @Post(":id/heartbeat")
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Param("id") id: string) {
    try {
      await this.userService.updateLastActivity(+id);
      return {
        message: "Atividade atualizada",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao atualizar atividade: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Define o status online do usuário
   * PATCH /user/:id/online-status
   */
  @Patch(":id/online-status")
  async setOnlineStatus(
    @Param("id") id: string,
    @Body() body: { is_online: boolean },
  ) {
    try {
      const user = await this.userService.setOnlineStatus(+id, body.is_online);
      return {
        message: `Status atualizado para ${body.is_online ? "online" : "offline"}`,
        user: {
          id: user.id,
          is_online: user.is_online,
          last_activity: user.last_activity,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Erro ao atualizar status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca o status online de um usuário específico
   * GET /user/:id/online-status
   */
  @Get(":id/online-status")
  async getUserOnlineStatus(@Param("id") id: string) {
    try {
      return await this.userService.getUserOnlineStatus(+id);
    } catch (error) {
      throw new HttpException(
        `Erro ao buscar status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export { UserService };
