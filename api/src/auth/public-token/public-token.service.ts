import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class PublicTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateRegisterToken() {
    const payload = {
      type: "register",
      purpose: "public_registration",
      timestamp: Date.now(),
    };

    const token = this.jwtService.sign(payload);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
      success: true,
      access_token: token,
      token_type: "Bearer",
      expires_in: 1800,
      expires_at: expiresAt.toISOString(),
      message: "Token gerado com sucesso",
    };
  }

  async validateRegisterToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token, {
        audience: "public-registration",
        issuer: "saudeflow-app",
      });

      if (decoded.type !== "register") {
        throw new Error("Token inválido para esta operação");
      }

      return decoded;
    } catch (error) {
      throw error;
    }
  }
}
