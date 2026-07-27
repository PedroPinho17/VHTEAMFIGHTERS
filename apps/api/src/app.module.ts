import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bullmq";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { HealthModule } from "./health/health.module";
import { HomeModule } from "./home/home.module";
import { PeopleModule } from "./people/people.module";
import { ScheduleModule } from "./schedule/schedule.module";
import { EventsModule } from "./events/events.module";
import { PostsModule } from "./posts/posts.module";
import { GalleryModule } from "./gallery/gallery.module";
import { ContactModule } from "./contact/contact.module";
import { EnrollmentsModule } from "./enrollments/enrollments.module";
import { MediaModule } from "./media/media.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ["../../.env", ".env"] }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL ?? "redis://localhost:6379",
      },
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    HealthModule,
    HomeModule,
    PeopleModule,
    ScheduleModule,
    EventsModule,
    PostsModule,
    GalleryModule,
    ContactModule,
    EnrollmentsModule,
    MediaModule,
  ],
})
export class AppModule {}
