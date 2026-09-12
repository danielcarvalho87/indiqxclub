import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePlanoDto {
  @ApiProperty({ description: "Identificador estável do plano", example: "growth" })
  @IsNotEmpty()
  @IsString()
  @Length(2, 40)
  @Matches(/^[a-z0-9-]+$/, {
    message: "slug aceita apenas letras minúsculas, números e hífen",
  })
  slug: string;

  @ApiProperty({ description: "Nome exibido do plano" })
  @IsNotEmpty()
  @IsString()
  @Length(2, 60)
  nome: string;

  @ApiProperty({
    description: "Teto de parceiros; null para ilimitado",
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  limiteParceiros?: number | null;

  @ApiProperty({ description: "Mensalidade em reais" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precoMensal: number;

  @ApiProperty({ description: "Valor anual em reais" })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  precoAnual: number;

  @ApiProperty({
    description: "Valor por parceiro acima do limite",
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoParceiroExtra?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  descricao?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  destaque?: boolean;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;
}
