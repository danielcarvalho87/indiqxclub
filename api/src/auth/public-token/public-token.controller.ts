import { Controller, Post } from "@nestjs/common";
import { PublicTokenService } from "./public-token.service";

@Controller("public")
export class PublicTokenController {
  constructor(private readonly publicTokenService: PublicTokenService) {}

  @Post("register-token")
  generateToken() {
    return this.publicTokenService.generateRegisterToken();
  }
}
