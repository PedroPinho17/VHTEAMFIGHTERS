import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ContactService } from "./contact.service";
import { UpdateContactDto } from "./contact.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get("api/public/contact")
  getPublic() {
    return this.contactService.getPublic();
  }

  @Get("api/admin/contact")
  @UseGuards(AdminGuard)
  getAdmin() {
    return this.contactService.getAdmin();
  }

  @Put("api/admin/contact")
  @UseGuards(AdminGuard)
  update(@Body() dto: UpdateContactDto) {
    return this.contactService.update(dto);
  }
}
