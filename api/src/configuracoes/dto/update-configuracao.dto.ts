import { IsOptional, IsString, IsNumber, Min, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateConfiguracaoDto {
  @ApiProperty({
    description: "ID do usuário master/administrador",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  masterId?: number;

  @ApiProperty({
    description: "Nome da empresa",
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  nomeEmpresa?: string;

  @ApiProperty({
    description: "CNPJ da empresa",
    maxLength: 18,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(14, 18)
  cnpj?: string;

  @ApiProperty({ description: "Pontos por novo usuário", required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pontosPorNovoUsuario?: number;

  @ApiProperty({ description: "Comissão por venda (%)", required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  comissaoPorVenda?: number;
}
