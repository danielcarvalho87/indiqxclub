import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AssinaturasService } from "./assinaturas.service";
import { CreateAssinaturaDto } from "./dto/create-assinatura.dto";
import { UpdateAssinaturaDto } from "./dto/update-assinatura.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { Roles } from "../auth/roles/roles.decorator";
import { AccessLevel, isParceiro } from "../auth/roles/level.util";

@ApiTags("assinaturas")
@ApiBearerAuth()
@Controller("assinaturas")
export class AssinaturasController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  /**
   * Assinatura do próprio usuário.
   * Rota estática antes de ":id" para o Nest não tratar "me" como id.
   */
  @Get("me")
  @ApiOperation({ summary: "Plano e uso do usuário autenticado" })
  async minhaAssinatura(@CurrentUser() user: UserFromJwt) {
    // O parceiro não assina: quem contrata é a empresa dele.
    const alvo = isParceiro(user.level) ? Number(user.master_id) : user.id;

    return this.assinaturasService.resumoDoUsuario(alvo);
  }

  @Get("me/historico")
  @ApiOperation({ summary: "Histórico de planos do usuário autenticado" })
  async meuHistorico(@CurrentUser() user: UserFromJwt) {
    const alvo = isParceiro(user.level) ? Number(user.master_id) : user.id;

    return this.assinaturasService.historicoDoUsuario(alvo);
  }

  @Get()
  @Roles(AccessLevel.FullAdmin)
  @ApiOperation({ summary: "Assinatura de cada administrador" })
  listar() {
    return this.assinaturasService.listarAssinaturasPorAdministrador();
  }

  @Get("usuario/:userId")
  @Roles(AccessLevel.FullAdmin)
  @ApiOperation({ summary: "Histórico de um administrador" })
  historico(@Param("userId") userId: string) {
    return this.assinaturasService.historicoDoUsuario(+userId);
  }

  @Post()
  @Roles(AccessLevel.FullAdmin)
  @ApiOperation({ summary: "Vincular plano a um administrador" })
  vincular(@Body() dto: CreateAssinaturaDto) {
    return this.assinaturasService.vincular(dto);
  }

  @Patch(":id")
  @Roles(AccessLevel.FullAdmin)
  @ApiOperation({ summary: "Atualizar assinatura" })
  atualizar(@Param("id") id: string, @Body() dto: UpdateAssinaturaDto) {
    return this.assinaturasService.atualizar(+id, dto);
  }

  @Delete(":id")
  @Roles(AccessLevel.FullAdmin)
  @ApiOperation({ summary: "Cancelar assinatura" })
  cancelar(@Param("id") id: string) {
    return this.assinaturasService.cancelar(+id);
  }
}
