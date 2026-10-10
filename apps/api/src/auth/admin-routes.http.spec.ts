import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AdminGuard, AuthGuard } from "./auth.guard";
import { MediaController } from "../media/media.controller";
import { MediaService } from "../media/media.service";
import { EnrollmentsController } from "../enrollments/enrollments.controller";
import { EnrollmentsService } from "../enrollments/enrollments.service";
import { PeopleController } from "../people/people.controller";
import { PeopleService } from "../people/people.service";
import { PostsController } from "../posts/posts.controller";
import { PostsService } from "../posts/posts.service";
import { EventsController } from "../events/events.controller";
import { EventsService } from "../events/events.service";
import { GalleryController } from "../gallery/gallery.controller";
import { GalleryService } from "../gallery/gallery.service";
import { ScheduleController } from "../schedule/schedule.controller";
import { ScheduleService } from "../schedule/schedule.service";
import { HomeController } from "../home/home.controller";
import { HomeService } from "../home/home.service";
import { ContactController } from "../contact/contact.controller";
import { ContactService } from "../contact/contact.service";
import { MeController } from "./me.controller";
import { PrismaService } from "../prisma/prisma.service";

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("./auth", () => ({
  auth: {
    api: {
      getSession,
      changePassword: vi.fn(),
    },
  },
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: (headers: unknown) => headers,
}));

/** Every /api/admin/* route — must return 401 without a session. */
const ADMIN_ROUTES: Array<{ method: "get" | "post" | "put" | "patch" | "delete"; path: string }> =
  [
    { method: "post", path: "/api/admin/me/change-password" },
    { method: "post", path: "/api/admin/media/presign" },
    { method: "get", path: "/api/admin/enrollments" },
    { method: "patch", path: "/api/admin/enrollments/x/status" },
    { method: "post", path: "/api/admin/enrollments/x/retry" },
    { method: "get", path: "/api/admin/enrollments/x/gdpr-export" },
    { method: "post", path: "/api/admin/enrollments/x/gdpr-erase" },
    { method: "get", path: "/api/admin/people" },
    { method: "get", path: "/api/admin/people/x" },
    { method: "post", path: "/api/admin/people" },
    { method: "put", path: "/api/admin/people/x" },
    { method: "delete", path: "/api/admin/people/x" },
    { method: "get", path: "/api/admin/posts" },
    { method: "post", path: "/api/admin/posts" },
    { method: "put", path: "/api/admin/posts/x" },
    { method: "delete", path: "/api/admin/posts/x" },
    { method: "get", path: "/api/admin/events" },
    { method: "post", path: "/api/admin/events" },
    { method: "put", path: "/api/admin/events/x" },
    { method: "delete", path: "/api/admin/events/x" },
    { method: "get", path: "/api/admin/gallery" },
    { method: "post", path: "/api/admin/gallery" },
    { method: "put", path: "/api/admin/gallery/x" },
    { method: "delete", path: "/api/admin/gallery/x" },
    { method: "get", path: "/api/admin/schedule" },
    { method: "post", path: "/api/admin/schedule" },
    { method: "put", path: "/api/admin/schedule/x" },
    { method: "delete", path: "/api/admin/schedule/x" },
    { method: "get", path: "/api/admin/home" },
    { method: "put", path: "/api/admin/home" },
    { method: "get", path: "/api/admin/contact" },
    { method: "put", path: "/api/admin/contact" },
  ];

describe("admin routes HTTP guards", () => {
  let app: INestApplication;

  beforeAll(async () => {
    getSession.mockResolvedValue(null);
    const stub = () => ({});
    const moduleRef = await Test.createTestingModule({
      controllers: [
        MeController,
        MediaController,
        EnrollmentsController,
        PeopleController,
        PostsController,
        EventsController,
        GalleryController,
        ScheduleController,
        HomeController,
        ContactController,
      ],
      providers: [
        AuthGuard,
        AdminGuard,
        { provide: MediaService, useValue: { createPresignedUpload: stub } },
        { provide: EnrollmentsService, useValue: { listAdmin: stub, create: stub } },
        { provide: PeopleService, useValue: { listAdmin: stub, get: stub, create: stub, update: stub, remove: stub } },
        { provide: PostsService, useValue: { listAdmin: stub, create: stub, update: stub, remove: stub } },
        { provide: EventsService, useValue: { listAdmin: stub, create: stub, update: stub, remove: stub } },
        { provide: GalleryService, useValue: { listAdmin: stub, create: stub, update: stub, remove: stub } },
        { provide: ScheduleService, useValue: { listAdmin: stub, create: stub, update: stub, remove: stub } },
        { provide: HomeService, useValue: { getAdmin: stub, update: stub } },
        { provide: ContactService, useValue: { getAdmin: stub, update: stub } },
        { provide: PrismaService, useValue: { user: { update: stub } } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("covers every known admin route", () => {
    expect(ADMIN_ROUTES.length).toBeGreaterThanOrEqual(30);
  });

  for (const route of ADMIN_ROUTES) {
    it(`${route.method.toUpperCase()} ${route.path} → 401 without session`, async () => {
      getSession.mockResolvedValue(null);
      const res = await request(app.getHttpServer())[route.method](route.path);
      expect(res.status).toBe(401);
    });
  }
});
