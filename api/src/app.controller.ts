// app.controller.ts
import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { IsPublic } from "./auth/decorators/is-public.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /** Health check público (usado por monitoramento / Heroku). */
  @Get()
  @IsPublic()
  getHello(): string {
    return this.appService.getHello();
  }
}
