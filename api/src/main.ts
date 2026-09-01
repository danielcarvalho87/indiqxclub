// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger, ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";

/** Origens liberadas por padrão; pode ser sobrescrito por CORS_ORIGINS. */
const DEFAULT_ORIGINS = [
  "http://localhost:3011",
  "http://localhost:5173",
  "https://app-indiqx.web.app",
  "https://indiqx.club",
  "https://www.indiqx.club",
];

async function bootstrap() {
  // Sem JWT_SECRET a aplicação assinaria tokens com um segredo previsível.
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET não configurado. Defina a variável de ambiente antes de " +
        "iniciar a API.",
    );
  }

  // ATENÇÃO: o segredo atual é curto. Um JWT_SECRET curto pode ser quebrado
  // offline a partir de qualquer token capturado, permitindo forjar um token
  // com level "FullAdmin" e contornar toda a autorização abaixo.
  // Recomendado: 64 caracteres hex (openssl rand -hex 32).
  if (process.env.JWT_SECRET.length < 32) {
    Logger.warn(
      "JWT_SECRET tem menos de 32 caracteres — recomendado rotacionar para " +
        "um valor gerado com `openssl rand -hex 32`.",
      "Bootstrap",
    );
  }

  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === "production";

  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
    : DEFAULT_ORIGINS;

  app.enableCors({
    origin: allowedOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Cabeçalhos básicos de segurança (sem dependência extra).
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    if (isProduction) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains",
      );
    }
    res.removeHeader("X-Powered-By");
    next();
  });

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Limite de payload: o suficiente para uploads de imagem (5MB) com folga.
  app.use(json({ limit: "6mb" }));
  app.use(urlencoded({ extended: true, limit: "6mb" }));

  // Swagger apenas fora de produção: em produção ele expõe todo o mapa de
  // rotas e os schemas de entrada da API sem autenticação.
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle("Api")
      .setDescription("ADMIN API CLUB INDIQX")
      .setVersion("1.5")
      .addBearerAuth()
      .addTag("admin")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
  }

  const port = process.env.PORT || 3011;
  await app.listen(port);
  Logger.log(`API iniciada na porta ${port}`, "Bootstrap");
}
bootstrap();
