// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      "http://localhost:3011",
      "http://localhost:5173",
      "https://club-realeasy-dfa7c35adc3d.herokuapp.com",
      "https://club-realeasy.web.app",
      "https://club.realeasybr.com.br",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Accept, Authorization",
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const config = new DocumentBuilder()
    .setTitle("Api")
    .setDescription("ADMIN API CLUB REALEASY")
    .setVersion("1.5")
    .addTag("admin")
    .build();

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Aumentar o limite para 50MB (ou o valor que você precisar)
  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT || 3011);
}
bootstrap();
