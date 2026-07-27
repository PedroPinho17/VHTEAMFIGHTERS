import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { HomeService } from "./home.service";
import { UpdateHomeDto } from "./home.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get("api/public/home")
  getPublic() {
    return this.homeService.getPublic();
  }

  @Get("api/admin/home")
  @UseGuards(AdminGuard)
  getAdmin() {
    return this.homeService.getAdmin();
  }

  @Put("api/admin/home")
  @UseGuards(AdminGuard)
  update(@Body() dto: UpdateHomeDto) {
    return this.homeService.update(dto);
  }
}
