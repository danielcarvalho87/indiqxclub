import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IsPublic } from "../auth/decorators/is-public.decorator";

@ApiTags("configuracoes")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("configuracoes")
export class ConfiguracoesController {
  constructor(private readonly configuracoesService: ConfiguracoesService) {}

  @Post()
  @ApiOperation({ summary: "Criar nova configuração" })
  @ApiResponse({
    status: 201,
    description: "Configuração criada com sucesso",
    type: Configuracao,
  })
  create(
    @Body() createConfiguracaoDto: CreateConfiguracaoDto,
  ): Promise<Configuracao> {
    return this.configuracoesService.create(createConfiguracaoDto);
  }

  @Get()
  @ApiOperation({ summary: "Listar todas as configurações" })
  @ApiResponse({
    status: 200,
    description: "Lista de configurações",
    type: [Configuracao],
  })
  findAll(): Promise<Configuracao[]> {
    return this.configuracoesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar configuração por ID" })
  @ApiResponse({
    status: 200,
    description: "Configuração encontrada",
    type: Configuracao,
  })
  @ApiResponse({ status: 404, description: "Configuração não encontrada" })
  findOne(@Param("id") id: string): Promise<Configuracao> {
    return this.configuracoesService.findOne(+id);
  }

  @Get("master/:masterId")
  @IsPublic()
  @ApiOperation({ summary: "Buscar configurações por master ID" })
  @ApiResponse({
    status: 200,
    description: "Lista de configurações do master",
    type: [Configuracao],
  })
  findByMasterId(@Param("masterId") masterId: string): Promise<Configuracao[]> {
    return this.configuracoesService.findByMasterId(+masterId);
  }

  @Patch(":id")
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
  ): Promise<Configuracao> {
    return this.configuracoesService.update(+id, updateConfiguracaoDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remover configuração" })
  @ApiResponse({
    status: 204,
    description: "Configuração removida com sucesso",
  })
  @ApiResponse({ status: 404, description: "Configuração não encontrada" })
  remove(@Param("id") id: string): Promise<void> {
    return this.configuracoesService.remove(+id);
  }
}
