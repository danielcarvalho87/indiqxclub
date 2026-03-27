import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LocalStrategy } from "./strategies/local.strategy";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LoginValidationMiddleware } from "./middlewares/login-validation.middleware";
import { RegisterTokenGuard } from "./guards/register-token.guard";
import { EmailModule } from "../email/email.module";
import { ConfiguracoesModule } from "../configuracoes/configuracoes.module";

@Module({
  imports: [
    UserModule,
    ConfigModule,
    EmailModule,
    ConfiguracoesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "1d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RegisterTokenGuard],
  exports: [AuthService, RegisterTokenGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoginValidationMiddleware).forRoutes("login");
  }
}
