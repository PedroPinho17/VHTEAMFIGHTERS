import { Injectable, NotFoundException } from "@nestjs/common";
import { PersonRole } from "@vh/database";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpsertPersonDto } from "./people.dto";

@Injectable()
export class PeopleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private cacheKey(role?: string) {
    return `public:people:${role ?? "all"}`;
  }

  async listPublic(role?: PersonRole) {
    const key = this.cacheKey(role);
    const cached = await this.redis.getJson(key);
    if (cached) return cached;
    const people = await this.prisma.person.findMany({
      where: { published: true, ...(role ? { role } : {}) },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    await this.redis.setJson(key, people, 120);
    return people;
  }

  async listAdmin() {
    return this.prisma.person.findMany({
      orderBy: [{ role: "asc" }, { sortOrder: "asc" }],
    });
  }

  async get(id: string) {
    const person = await this.prisma.person.findUnique({ where: { id } });
    if (!person) throw new NotFoundException();
    return person;
  }

  async create(dto: UpsertPersonDto) {
    const person = await this.prisma.person.create({ data: dto });
    await this.invalidate();
    return person;
  }

  async update(id: string, dto: UpsertPersonDto) {
    const person = await this.prisma.person.update({ where: { id }, data: dto });
    await this.invalidate();
    return person;
  }

  async remove(id: string) {
    await this.prisma.person.delete({ where: { id } });
    await this.invalidate();
    return { ok: true };
  }

  private async invalidate() {
    await this.redis.del(
      this.cacheKey(),
      this.cacheKey("FIGHTER"),
      this.cacheKey("COACH"),
    );
  }
}
