"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dayLabels } from "@/lib/utils";

type OpeningHour = {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

type Contact = {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  mapEmbedUrl?: string | null;
  openingHours?: OpeningHour[] | null;
};

const DAYS = Object.keys(dayLabels);

function normalizeHours(hours?: OpeningHour[] | null): OpeningHour[] {
  const byDay = new Map((hours ?? []).map((h) => [h.day, h]));
  return DAYS.map((day) => {
    const existing = byDay.get(day);
    return (
      existing ?? {
        day,
        open: "07:00",
        close: "22:00",
        closed: day === "SUNDAY",
      }
    );
  });
}

export default function AdminContactPage() {
  const { data: session } = authClient.useSession();
  const [contact, setContact] = useState<Contact | null>(null);
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    adminFetch<Contact>("/api/admin/contact")
      .then((c) => {
        setContact(c);
        setHours(normalizeHours(c?.openingHours));
      })
      .catch(console.error);
  }, [session]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      address: String(form.get("address") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      email: String(form.get("email") || "") || undefined,
      instagramUrl: String(form.get("instagramUrl") || "") || undefined,
      facebookUrl: String(form.get("facebookUrl") || "") || undefined,
      youtubeUrl: String(form.get("youtubeUrl") || "") || undefined,
      mapEmbedUrl: String(form.get("mapEmbedUrl") || "") || undefined,
      openingHours: hours,
    };
    const updated = await adminFetch<Contact>("/api/admin/contact", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    setContact(updated);
    setHours(normalizeHours(updated.openingHours));
    setMsg("Guardado.");
  }

  function updateHour(day: string, patch: Partial<OpeningHour>) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, ...patch } : h)));
  }

  if (!contact) return <p className="text-cream/60">A carregar...</p>;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4">
      <h1 className="font-display text-5xl">Contactos</h1>
      <p className="text-sm text-cream/50">
        Estes dados alimentam a página pública e o rodapé do site.
      </p>

      <div className="space-y-3 border border-white/10 bg-white p-5 text-ink">
        <Label>Morada</Label>
        <Input name="address" defaultValue={contact.address ?? ""} />
        <Label>Telefone</Label>
        <Input name="phone" defaultValue={contact.phone ?? ""} />
        <Label>Email</Label>
        <Input name="email" type="email" defaultValue={contact.email ?? ""} />
        <Label>Instagram URL</Label>
        <Input name="instagramUrl" defaultValue={contact.instagramUrl ?? ""} />
        <Label>Facebook URL</Label>
        <Input name="facebookUrl" defaultValue={contact.facebookUrl ?? ""} />
        <Label>YouTube URL</Label>
        <Input name="youtubeUrl" defaultValue={contact.youtubeUrl ?? ""} />
        <Label>URL embed do mapa (Google Maps → Partilhar → Incorporar)</Label>
        <Input
          name="mapEmbedUrl"
          defaultValue={contact.mapEmbedUrl ?? ""}
          placeholder="https://www.google.com/maps/embed?..."
        />
      </div>

      <div className="space-y-3 border border-white/10 bg-white p-5 text-ink">
        <h2 className="font-display text-2xl">Horário de abertura</h2>
        <ul className="space-y-3">
          {hours.map((h) => (
            <li
              key={h.day}
              className="grid gap-2 border-b border-ink/10 pb-3 sm:grid-cols-[110px_1fr_1fr_auto] sm:items-center"
            >
              <span className="font-semibold">{dayLabels[h.day] ?? h.day}</span>
              <Input
                type="time"
                value={h.open ?? ""}
                disabled={!!h.closed}
                onChange={(e) => updateHour(h.day, { open: e.target.value })}
              />
              <Input
                type="time"
                value={h.close ?? ""}
                disabled={!!h.closed}
                onChange={(e) => updateHour(h.day, { close: e.target.value })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!h.closed}
                  onChange={(e) => updateHour(h.day, { closed: e.target.checked })}
                />
                Encerrado
              </label>
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit">Guardar</Button>
      {msg && <p className="text-sm text-green-400">{msg}</p>}
    </form>
  );
}
