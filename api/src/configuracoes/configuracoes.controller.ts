import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ConfiguracoesService } from "./configuracoes.service";
import { CreateConfiguracaoDto } from "./dto/create-configuracao.dto";
import { UpdateConfiguracaoDto } from "./dto/update-configuracao.dto";
import { Configuracao } from "./entities/configuracao.entity";
import { IsPublic } from "../auth/decorators/is-public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { Roles } from "../auth/roles/roles.decorator";
import {
  AccessLevel,
  isFullAdmin,
  isParceiro,
} from "../auth/roles/level.util";

@ApiTags("configuracoes")
@ApiBearerAuth()
@Controller("configuracoes")
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Post()
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  @ApiOperation({ summary: "Criar nova configuração" })
  @ApiResponse({
    status: 201,
    description: "Configuração criada com sucesso",
    type: Configuracao,
  })
  create(
    @Body() createConfiguracaoDto: CreateConfiguracaoDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<Configuracao> {
    return this.configuracoesService.create(createConfiguracaoDto, user);
  }

  @Get()
  @Roles(AccessLevel.FullAdmin)
  @ApiOperation({ summary: "Listar todas as configurações" })
  @ApiResponse({
    status: 200,
    description: "Lista de configurações",
    type: [Configuracao],
  })
  findAll(): Promise<Configuracao[]> {
    return this.configuracoesService.findAll();
  }

  /**
   * Dados públicos da empresa, usados na tela de cadastro de parceiros
   * (/register?ref=:masterId). Expõe apenas o nome da empresa.
   */
  @Get("publica/:masterId")
  @IsPublic()
  @ApiOperation({ summary: "Dados públicos de exibição da empresa" })
  findPublicByMasterId(@Param("masterId") masterId: string) {
    return this.configuracoesService.findPublicByMasterId(+masterId);
  }

  @Get("master/:masterId")
  @ApiOperation({ summary: "Buscar configurações por master ID" })
  @ApiResponse({
    status: 200,
    description: "Lista de configurações do master",
    type: [Configuracao],
  })
  findByMasterId(
    @Param("masterId") masterId: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<Configuracao[]> {
    // Administrador vê a própria empresa; parceiro, a empresa a que pertence.
    const escopo = isParceiro(user.level) ? user.master_id : user.id;

    if (!isFullAdmin(user.level) && Number(masterId) !== Number(escopo)) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar estas configurações.",
      );
    }

    return this.configuracoesService.findByMasterId(+masterId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar configuração por ID" })
  @ApiResponse({
    status: 200,
    description: "Configuração encontrada",
    type: Configuracao,
  })
  @ApiResponse({ status: 404, description: "Configuração não encontrada" })
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<Configuracao> {
    return this.configuracoesService.findOne(+id, user);
  }

  @Patch(":id")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  @ApiOperation({ summary: "Atualizar configuração" })
  @ApiResponse({
    status: 200,
    description: "Configuração atualizada com sucesso",
    type: Configuracao,
  })
  @ApiResponse({ status: 404, description: "Configuração não encontrada" })
  update(
    @Param("id") id: string,
    @Body() updateConfiguracaoDto: UpdateConfiguracaoDto,
    @CurrentUser() user: UserFromJwt,
  ): Promise<Configuracao> {
    return this.configuracoesService.update(+id, updateConfiguracaoDto, user);
  }

  @Delete(":id")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  @ApiOperation({ summary: "Remover configuração" })
  @ApiResponse({
    status: 204,
    description: "Configuração removida com sucesso",
  })
  @ApiResponse({ status: 404, description: "Configuração não encontrada" })
  remove(
    @Param("id") id: string,
    @CurrentUser() user: UserFromJwt,
  ): Promise<void> {
    return this.configuracoesService.remove(+id, user);
  }
}
