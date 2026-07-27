import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpsertEventDto } from "./events.dto";

const CACHE_KEY = "public:events";

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listPublic() {
    const cached = await this.redis.getJson(CACHE_KEY);
    if (cached) return cached;
    const events = await this.prisma.event.findMany({
      where: { published: true },
      orderBy: { date: "asc" },
    });
    await this.redis.setJson(CACHE_KEY, events, 120);
    return events;
  }

  async getPublic(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, published: true },
    });
    if (!event) throw new NotFoundException();
    return event;
  }

  async listAdmin() {
    return this.prisma.event.findMany({ orderBy: { date: "desc" } });
  }

  async create(dto: UpsertEventDto) {
    const event = await this.prisma.event.create({
      data: { ...dto, date: new Date(dto.date) },
    });
    await this.redis.del(CACHE_KEY);
    return event;
  }

  async update(id: string, dto: UpsertEventDto) {
    const event = await this.prisma.event.update({
      where: { id },
      data: { ...dto, date: new Date(dto.date) },
    });
    await this.redis.del(CACHE_KEY);
    return event;
  }

  async remove(id: string) {
    await this.prisma.event.delete({ where: { id } });
    await this.redis.del(CACHE_KEY);
    return { ok: true };
  }
}
