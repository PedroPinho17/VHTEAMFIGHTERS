import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { PostsService } from "./posts.service";
import { UpsertPostDto } from "./posts.dto";
import { AdminGuard } from "../auth/auth.guard";

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get("api/public/posts")
  listPublic() {
    return this.postsService.listPublic();
  }

  @Get("api/public/posts/:slug")
  getBySlug(@Param("slug") slug: string) {
    return this.postsService.getBySlug(slug);
  }

  @Get("api/admin/posts")
  @UseGuards(AdminGuard)
  listAdmin() {
    return this.postsService.listAdmin();
  }

  @Post("api/admin/posts")
  @UseGuards(AdminGuard)
  create(@Body() dto: UpsertPostDto) {
    return this.postsService.create(dto);
  }

  @Put("api/admin/posts/:id")
  @UseGuards(AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpsertPostDto) {
    return this.postsService.update(id, dto);
  }

  @Delete("api/admin/posts/:id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.postsService.remove(id);
  }
}
