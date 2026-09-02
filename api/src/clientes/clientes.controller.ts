import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { ClientesService } from "./clientes.service";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";

@Controller("clientes")
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(
    @Body() createClienteDto: CreateClienteDto,
    @CurrentUser() user: UserFromJwt,
  ) {
    return this.clientesService.create(createClienteDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: UserFromJwt,
    @Query() query: PaginationQueryDto,
  ) {
    return this.clientesService.findAll(user, query);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: UserFromJwt) {
    return this.clientesService.findOne(+id, user);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateClienteDto: UpdateClienteDto,
    @CurrentUser() user: UserFromJwt,
  ) {
    return this.clientesService.update(+id, updateClienteDto, user);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: UserFromJwt) {
    return this.clientesService.remove(+id, user);
  }
}
