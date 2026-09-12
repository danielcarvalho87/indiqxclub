import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PlanosService } from "./planos.service";
import { CreatePlanoDto } from "./dto/create-plano.dto";
import { UpdatePlanoDto } from "./dto/update-plano.dto";
import { Roles } from "../auth/roles/roles.decorator";
import { AccessLevel } from "../auth/roles/level.util";

/**
 * Catálogo de planos: exclusivo do FullAdmin.
 * O administrador não lista planos — ele vê apenas o seu, embutido na
 * resposta de /assinaturas/me.
 */
@ApiTags("planos")
@ApiBearerAuth()
@Controller("planos")
@Roles(AccessLevel.FullAdmin)
export class PlanosController {
  constructor(private readonly planosService: PlanosService) {}

  @Get()
  @ApiOperation({ summary: "Listar planos" })
  findAll(@Query("incluirInativos") incluirInativos?: string) {
    return this.planosService.findAll(incluirInativos === "true");
  }

  @Get(":id")
  @ApiOperation({ summary: "Detalhe de um plano" })
  findOne(@Param("id") id: string) {
    return this.planosService.findOne(+id);
  }

  @Post()
  @ApiOperation({ summary: "Criar plano" })
  create(@Body() dto: CreatePlanoDto) {
    return this.planosService.create(dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar plano" })
  update(@Param("id") id: string, @Body() dto: UpdatePlanoDto) {
    return this.planosService.update(+id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Desativar plano" })
  async remove(@Param("id") id: string) {
    await this.planosService.remove(+id);
    return { success: true, message: "Plano desativado" };
  }
}
