import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@vh/database";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { UpdateContactDto } from "./contact.dto";

const CACHE_KEY = "public:contact";

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPublic() {
    const cached = await this.redis.getJson(CACHE_KEY);
    if (cached) return cached;
    const contact = await this.prisma.contactSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!contact) throw new NotFoundException("Contact not configured");
    await this.redis.setJson(CACHE_KEY, contact, 120);
    return contact;
  }

  async getAdmin() {
    return this.prisma.contactSettings.findFirst({ orderBy: { createdAt: "asc" } });
  }

  async update(dto: UpdateContactDto) {
    const existing = await this.prisma.contactSettings.findFirst({
      orderBy: { createdAt: "asc" },
    });
    const data: Prisma.ContactSettingsUpdateInput = {
      address: dto.address,
      mapEmbedUrl: dto.mapEmbedUrl,
      latitude: dto.latitude,
      longitude: dto.longitude,
      phone: dto.phone,
      email: dto.email,
      instagramUrl: dto.instagramUrl,
      facebookUrl: dto.facebookUrl,
      youtubeUrl: dto.youtubeUrl,
      ...(dto.openingHours !== undefined
        ? { openingHours: dto.openingHours as unknown as Prisma.InputJsonValue }
        : {}),
    };
    const contact = existing
      ? await this.prisma.contactSettings.update({ where: { id: existing.id }, data })
      : await this.prisma.contactSettings.create({
          data: data as Prisma.ContactSettingsCreateInput,
        });
    await this.redis.del(CACHE_KEY);
    return contact;
  }
}
