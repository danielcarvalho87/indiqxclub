// pagination-query.dto.ts
// Parâmetros opcionais de paginação e busca das listagens
// Localização: src/common/dto/pagination-query.dto.ts

import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { Type } from "class-transformer";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Quando `page` é informado a rota devolve { data, total, page, limit }.
 * Sem `page` a resposta continua sendo o array completo, para não quebrar
 * as telas que agregam sobre a base inteira (dashboard e relatórios).
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  limit?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Normaliza page/limit dentro dos limites aceitos. */
export function resolvePaging(query?: PaginationQueryDto) {
  const page = Math.max(1, Number(query?.page) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(query?.limit) || DEFAULT_PAGE_SIZE),
  );

  return { page, limit, skip: (page - 1) * limit };
}

/**
 * Escapa os curingas do LIKE (%, _) e a barra invertida.
 * Sem isso, buscar por "%" retornava todos os registros do escopo e um "_"
 * casava com qualquer caractere.
 */
export function escapeLike(termo: string): string {
  return termo.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export function buildPaginated<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
