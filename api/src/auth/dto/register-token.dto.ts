export class RegisterTokenDto {
  // Vazio pois não recebe nada do frontend
}

export class RegisterTokenResponseDto {
  token: string;
  expires_in: number;
}
