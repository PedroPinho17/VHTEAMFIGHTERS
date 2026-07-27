"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { KrajeeFileInput } from "@/components/krajee-file-input";
import { mediaUrl } from "@/lib/utils";

type EventItem = {
  id: string;
  title: string;
  date: string;
  location?: string | null;
  description?: string | null;
  opponent?: string | null;
  result?: string | null;
  imageKey?: string | null;
  published?: boolean;
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const empty = {
  title: "",
  date: "",
  location: "",
  description: "",
  opponent: "",
  result: "",
};

export default function AdminEventsPage() {
  const { data: session } = authClient.useSession();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setEvents(await adminFetch<EventItem[]>("/api/admin/events"));
  }

  useEffect(() => {
    if (session) load().catch(console.error);
  }, [session]);

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setImageKey(null);
    setMsg("");
  }

  function startEdit(e: EventItem) {
    setEditingId(e.id);
    setForm({
      title: e.title,
      date: toLocalInput(e.date),
      location: e.location ?? "",
      description: e.description ?? "",
      opponent: e.opponent ?? "",
      result: e.result ?? "",
    });
    setImageKey(e.imageKey ?? null);
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      title: form.title,
      date: new Date(form.date).toISOString(),
      location: form.location || null,
      description: form.description || null,
      opponent: form.opponent || null,
      result: form.result || null,
      imageKey: imageKey,
      published: true,
    };
    try {
      if (editingId) {
        await adminFetch(`/api/admin/events/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Atualizado.");
      } else {
        await adminFetch("/api/admin/events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMsg("Criado.");
      }
      resetForm();
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? `Erro: ${err.message}` : "Erro");
    }
  }

  async function remove(id: string) {
    if (!confirm("Apagar este evento?")) return;
    await adminFetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Eventos</h1>
        {editingId && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Novo evento
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid max-w-xl gap-3 border border-ink/10 bg-white text-ink p-5">
        <p className="text-sm font-semibold text-ink/60">
          {editingId ? "A editar" : "Criar novo"}
        </p>
        <Label>Título</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <Label>Data</Label>
        <Input
          type="datetime-local"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
        />
        <Label>Local</Label>
        <Input
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
        />
        <Label>Adversário</Label>
        <Input
          value={form.opponent}
          onChange={(e) => setForm((f) => ({ ...f, opponent: e.target.value }))}
        />
        <Label>Resultado</Label>
        <Input
          value={form.result}
          onChange={(e) => setForm((f) => ({ ...f, result: e.target.value }))}
        />
        <Label>Descrição</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <KrajeeFileInput
          label="Imagem do evento"
          folder="events"
          value={imageKey}
          onChange={setImageKey}
          optional
        />
        <div className="flex gap-2">
          <Button type="submit">{editingId ? "Guardar alterações" : "Adicionar"}</Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
        {msg && <p className="text-sm text-ink/70">{msg}</p>}
      </form>

      <ul className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex items-center justify-between gap-4 border border-ink/10 bg-white text-ink p-4"
          >
            <div className="flex items-center gap-3">
              {mediaUrl(e.imageKey) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(e.imageKey)!} alt="" className="h-12 w-12 object-cover" />
              ) : null}
              <span>
                {e.title} · {new Date(e.date).toLocaleString("pt-PT")}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(e)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(e.id)}>
                Apagar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
