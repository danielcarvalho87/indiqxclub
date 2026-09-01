import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { BonificacoesService } from "./bonificacoes.service";
import { CreateBonificacaoDto } from "./dto/create-bonificacao.dto";
import { UpdateBonificacaoDto } from "./dto/update-bonificacao.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { Roles } from "../auth/roles/roles.decorator";
import { AccessLevel } from "../auth/roles/level.util";

@Controller("bonificacoes")
export class BonificacoesController {
  constructor(private readonly bonificacoesService: BonificacoesService) {}

  @Post()
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  create(
    @Body() createBonificacaoDto: CreateBonificacaoDto,
    @CurrentUser() user: UserFromJwt,
  ) {
    return this.bonificacoesService.create(createBonificacaoDto, user);
  }

  // Parceiros também leem: a tela "Meus Ganhos" mostra as metas da empresa.
  @Get()
  findAll(@CurrentUser() user: UserFromJwt) {
    return this.bonificacoesService.findAll(user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: UserFromJwt) {
    return this.bonificacoesService.findOne(+id, user);
  }

  @Patch(":id")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  update(
    @Param("id") id: string,
    @Body() updateBonificacaoDto: UpdateBonificacaoDto,
    @CurrentUser() user: UserFromJwt,
  ) {
    return this.bonificacoesService.update(+id, updateBonificacaoDto, user);
  }

  @Delete(":id")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  remove(@Param("id") id: string, @CurrentUser() user: UserFromJwt) {
    return this.bonificacoesService.remove(+id, user);
  }
}
