import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAssinaturaDto {
  @ApiProperty({ description: "Administrador que recebe o plano" })
  @IsNotEmpty()
  @IsInt()
  userId: number;

  @ApiProperty({ description: "Plano contratado" })
  @IsNotEmpty()
  @IsInt()
  planoId: number;

  @ApiProperty({ enum: ["mensal", "anual"], default: "mensal" })
  @IsOptional()
  @IsIn(["mensal", "anual"])
  ciclo?: "mensal" | "anual";

  @ApiProperty({
    description: "Início da vigência (padrão: hoje)",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  inicio?: string;

  @ApiProperty({
    description: "Vencimento; sem valor é calculado pelo ciclo",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiraEm?: string;

  @ApiProperty({
    description: "Valor negociado; sem valor usa o preço do plano",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  observacao?: string;
}
