import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PublicTokenService } from "./public-token.service";
import { PublicTokenController } from "./public-token.controller";
import { RegisterTokenGuard } from "./register-token.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "sua-chave-secreta-super-segura",
      signOptions: {
        expiresIn: "30m",
        issuer: "saudeflow-app",
        audience: "public-registration",
      },
    }),
  ],
  controllers: [PublicTokenController],
  providers: [PublicTokenService, RegisterTokenGuard],
  exports: [PublicTokenService, RegisterTokenGuard],
})
export class PublicTokenModule {}
