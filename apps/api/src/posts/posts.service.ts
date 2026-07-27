import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpsertPostDto } from "./posts.dto";

const CACHE_KEY = "public:posts";

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listPublic() {
    const cached = await this.redis.getJson(CACHE_KEY);
    if (cached) return cached;
    const posts = await this.prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    await this.redis.setJson(CACHE_KEY, posts, 120);
    return posts;
  }

  async getBySlug(slug: string) {
    const post = await this.prisma.post.findFirst({
      where: { slug, published: true },
    });
    if (!post) throw new NotFoundException();
    return post;
  }

  async listAdmin() {
    return this.prisma.post.findMany({ orderBy: { updatedAt: "desc" } });
  }

  async create(dto: UpsertPostDto) {
    const post = await this.prisma.post.create({
      data: {
        ...dto,
        publishedAt: dto.published
          ? dto.publishedAt
            ? new Date(dto.publishedAt)
            : new Date()
          : null,
      },
    });
    await this.redis.del(CACHE_KEY);
    return post;
  }

  async update(id: string, dto: UpsertPostDto) {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.published
          ? dto.publishedAt
            ? new Date(dto.publishedAt)
            : new Date()
          : null,
      },
    });
    await this.redis.del(CACHE_KEY);
    return post;
  }

  async remove(id: string) {
    await this.prisma.post.delete({ where: { id } });
    await this.redis.del(CACHE_KEY);
    return { ok: true };
  }
}
