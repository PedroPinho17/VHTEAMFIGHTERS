import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpsertGalleryDto } from "./gallery.dto";

const CACHE_KEY = "public:gallery";

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listPublic() {
    const cached = await this.redis.getJson(CACHE_KEY);
    if (cached) return cached;
    const items = await this.prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    });
    await this.redis.setJson(CACHE_KEY, items, 120);
    return items;
  }

  async listAdmin() {
    return this.prisma.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });
  }

  async create(dto: UpsertGalleryDto) {
    const item = await this.prisma.galleryItem.create({ data: dto });
    await this.redis.del(CACHE_KEY);
    return item;
  }

  async update(id: string, dto: UpsertGalleryDto) {
    const item = await this.prisma.galleryItem.update({ where: { id }, data: dto });
    await this.redis.del(CACHE_KEY);
    return item;
  }

  async remove(id: string) {
    await this.prisma.galleryItem.delete({ where: { id } });
    await this.redis.del(CACHE_KEY);
    return { ok: true };
  }
}
