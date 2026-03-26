import { IsNotEmpty, IsString, IsNumber, Min, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateConfiguracaoDto {
  @ApiProperty({ description: "ID do usuário master/administrador" })
  @IsNotEmpty()
  @IsNumber()
  masterId: number;

  @ApiProperty({ description: "Nome da empresa", maxLength: 200 })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  nomeEmpresa: string;

  @ApiProperty({ description: "CNPJ da empresa", maxLength: 18 })
  @IsNotEmpty()
  @IsString()
  @Length(14, 18)
  cnpj: string;

  @ApiProperty({ description: "Pontos por novo usuário" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  pontosPorNovoUsuario: number;

  @ApiProperty({ description: "Comissão por venda (%)" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  comissaoPorVenda: number;
}