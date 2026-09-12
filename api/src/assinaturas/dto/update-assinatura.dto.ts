import { IsIn, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateAssinaturaDto } from "./create-assinatura.dto";

/**
 * O usuário da assinatura nunca muda: para trocar o titular, cancele e crie
 * outra. Por isso `userId` fica de fora.
 */
export class UpdateAssinaturaDto extends PartialType(
  OmitType(CreateAssinaturaDto, ["userId"] as const),
) {
  @ApiProperty({
    enum: ["ativa", "cancelada", "expirada"],
    required: false,
  })
  @IsOptional()
  @IsIn(["ativa", "cancelada", "expirada"])
  status?: "ativa" | "cancelada" | "expirada";
}
