import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpdateHomeDto } from "./home.dto";

const CACHE_KEY = "public:home";

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPublic() {
    const cached = await this.redis.getJson(CACHE_KEY);
    if (cached) return cached;
    const home = await this.prisma.siteHome.findFirst({ orderBy: { createdAt: "asc" } });
    if (!home) throw new NotFoundException("Homepage not configured");
    await this.redis.setJson(CACHE_KEY, home, 120);
    return home;
  }

  async getAdmin() {
    return this.prisma.siteHome.findFirst({ orderBy: { createdAt: "asc" } });
  }

  async update(dto: UpdateHomeDto) {
    const existing = await this.prisma.siteHome.findFirst({ orderBy: { createdAt: "asc" } });
    const home = existing
      ? await this.prisma.siteHome.update({ where: { id: existing.id }, data: dto })
      : await this.prisma.siteHome.create({ data: dto });
    await this.redis.del(CACHE_KEY);
    return home;
  }
}
