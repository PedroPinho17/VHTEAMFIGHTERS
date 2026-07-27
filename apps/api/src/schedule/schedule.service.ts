import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpsertSlotDto } from "./schedule.dto";

const CACHE_KEY = "public:schedule";

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listPublic() {
    const cached = await this.redis.getJson(CACHE_KEY);
    if (cached) return cached;
    const slots = await this.prisma.trainingSlot.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { startTime: "asc" }],
    });
    await this.redis.setJson(CACHE_KEY, slots, 120);
    return slots;
  }

  async listAdmin() {
    return this.prisma.trainingSlot.findMany({
      orderBy: [{ sortOrder: "asc" }, { day: "asc" }],
    });
  }

  async create(dto: UpsertSlotDto) {
    const slot = await this.prisma.trainingSlot.create({ data: dto });
    await this.redis.del(CACHE_KEY);
    return slot;
  }

  async update(id: string, dto: UpsertSlotDto) {
    const slot = await this.prisma.trainingSlot.update({ where: { id }, data: dto });
    await this.redis.del(CACHE_KEY);
    return slot;
  }

  async remove(id: string) {
    await this.prisma.trainingSlot.delete({ where: { id } });
    await this.redis.del(CACHE_KEY);
    return { ok: true };
  }

  async get(id: string) {
    const slot = await this.prisma.trainingSlot.findUnique({ where: { id } });
    if (!slot) throw new NotFoundException();
    return slot;
  }
}
