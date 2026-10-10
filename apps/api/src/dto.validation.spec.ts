import "reflect-metadata";
import { describe, expect, it } from "vitest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { CreateEnrollmentDto, UpdateEnrollmentStatusDto } from "./enrollments/enrollments.dto";
import { PresignDto } from "./media/media.dto";
import { UpsertGalleryDto } from "./gallery/gallery.dto";
import { UpsertPersonDto } from "./people/people.dto";
import { UpsertPostDto } from "./posts/posts.dto";
import { UpsertEventDto } from "./events/events.dto";
import { UpsertSlotDto } from "./schedule/schedule.dto";
import { UpdateHomeDto } from "./home/home.dto";
import { UpdateContactDto } from "./contact/contact.dto";

async function errorsOf(Cls: new () => object, plain: Record<string, unknown>) {
  const instance = plainToInstance(Cls, plain);
  return validate(instance);
}

describe("DTO validation", () => {
  it("CreateEnrollmentDto requires consent and valid email", async () => {
    expect(
      await errorsOf(CreateEnrollmentDto, {
        name: "A",
        email: "bad",
        privacyConsent: false,
      }),
    ).not.toHaveLength(0);

    expect(
      await errorsOf(CreateEnrollmentDto, {
        name: "Ana Silva",
        email: "ana@cliente.pt",
        privacyConsent: true,
      }),
    ).toHaveLength(0);
  });

  it("UpdateEnrollmentStatusDto rejects unknown status", async () => {
    expect(await errorsOf(UpdateEnrollmentStatusDto, { status: "DONE" })).not.toHaveLength(0);
    expect(await errorsOf(UpdateEnrollmentStatusDto, { status: "HANDLED" })).toHaveLength(0);
  });

  it("PresignDto allows only image types and known folders", async () => {
    expect(
      await errorsOf(PresignDto, { contentType: "text/html", folder: "gallery" }),
    ).not.toHaveLength(0);
    expect(
      await errorsOf(PresignDto, { contentType: "image/png", folder: "../x" }),
    ).not.toHaveLength(0);
    expect(
      await errorsOf(PresignDto, { contentType: "image/webp", folder: "people" }),
    ).toHaveLength(0);
  });

  it("UpsertGalleryDto requires imageKey", async () => {
    expect(await errorsOf(UpsertGalleryDto, {})).not.toHaveLength(0);
    expect(
      await errorsOf(UpsertGalleryDto, { imageKey: "gallery/a.png", published: true }),
    ).toHaveLength(0);
  });

  it("UpsertPersonDto requires role FIGHTER|COACH", async () => {
    expect(
      await errorsOf(UpsertPersonDto, { role: "FAN", name: "X", bio: "y" }),
    ).not.toHaveLength(0);
    expect(
      await errorsOf(UpsertPersonDto, {
        role: "FIGHTER",
        name: "Rui",
        bio: "Kickboxer",
      }),
    ).toHaveLength(0);
  });

  it("UpsertPostDto requires title, slug and body", async () => {
    expect(await errorsOf(UpsertPostDto, { title: "T" })).not.toHaveLength(0);
    expect(
      await errorsOf(UpsertPostDto, {
        title: "Notícia",
        slug: "noticia",
        body: "Texto",
      }),
    ).toHaveLength(0);
  });

  it("UpsertEventDto requires title and date", async () => {
    expect(await errorsOf(UpsertEventDto, { title: "Fight" })).not.toHaveLength(0);
    expect(
      await errorsOf(UpsertEventDto, {
        title: "Fight Night",
        date: "2026-11-01T20:00:00.000Z",
      }),
    ).toHaveLength(0);
  });

  it("UpsertSlotDto validates weekday", async () => {
    expect(
      await errorsOf(UpsertSlotDto, {
        day: "Funday",
        startTime: "18:00",
        endTime: "19:00",
        modality: "Kick",
      }),
    ).not.toHaveLength(0);
    expect(
      await errorsOf(UpsertSlotDto, {
        day: "MONDAY",
        startTime: "18:00",
        endTime: "19:00",
        modality: "Kick",
      }),
    ).toHaveLength(0);
  });

  it("UpdateHomeDto requires hero fields", async () => {
    expect(await errorsOf(UpdateHomeDto, { heroTitle: "VH" })).not.toHaveLength(0);
    expect(
      await errorsOf(UpdateHomeDto, {
        heroTitle: "VH",
        heroSubtitle: "Fight",
        bodyText: "Body",
        ctaPrimaryLabel: "Inscrever",
        ctaPrimaryHref: "/inscricao",
      }),
    ).toHaveLength(0);
  });

  it("UpdateContactDto validates email when present", async () => {
    expect(await errorsOf(UpdateContactDto, { email: "not-an-email" })).not.toHaveLength(0);
    expect(
      await errorsOf(UpdateContactDto, { email: "contacto@vhteamfighters.pt", phone: "912" }),
    ).toHaveLength(0);
  });
});
