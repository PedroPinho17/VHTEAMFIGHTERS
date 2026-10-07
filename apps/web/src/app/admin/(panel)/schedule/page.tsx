"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dayLabels } from "@/lib/utils";

type Slot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  modality: string;
  level?: string | null;
  note?: string | null;
  sortOrder?: number;
  published?: boolean;
};

const empty = {
  day: "MONDAY",
  startTime: "19:00",
  endTime: "20:30",
  modality: "",
  level: "",
  sortOrder: "0",
  published: true,
};

export default function AdminSchedulePage() {
  const { data: session } = authClient.useSession();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");

  async function load() {
    setSlots(await adminFetch<Slot[]>("/api/admin/schedule"));
  }

  useEffect(() => {
    if (session) load().catch(console.error);
  }, [session]);

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setMsg("");
  }

  function startEdit(s: Slot) {
    setEditingId(s.id);
    setForm({
      day: s.day,
      startTime: s.startTime,
      endTime: s.endTime,
      modality: s.modality,
      level: s.level ?? "",
      sortOrder: String(s.sortOrder ?? 0),
      published: s.published ?? true,
    });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      modality: form.modality,
      level: form.level || null,
      sortOrder: Number(form.sortOrder) || 0,
      published: form.published,
    };
    try {
      if (editingId) {
        await adminFetch(`/api/admin/schedule/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Atualizado.");
      } else {
        await adminFetch("/api/admin/schedule", {
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
    if (!confirm("Apagar este horário?")) return;
    await adminFetch(`/api/admin/schedule/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Horários</h1>
        {editingId && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Novo horário
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid max-w-xl gap-3 border border-ink/10 bg-white text-ink p-5">
        <p className="text-sm font-semibold text-ink/60">
          {editingId ? "A editar" : "Criar novo"}
        </p>
        <Label>Dia</Label>
        <select
          className="h-11 rounded-md border border-ink/15 bg-white text-ink px-3"
          value={form.day}
          onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
        >
          {Object.entries(dayLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Label>Início</Label>
        <Input
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          placeholder="19:00"
          required
        />
        <Label>Fim</Label>
        <Input
          value={form.endTime}
          onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          placeholder="20:30"
          required
        />
        <Label>Modalidade</Label>
        <Input
          value={form.modality}
          onChange={(e) => setForm((f) => ({ ...f, modality: e.target.value }))}
          required
        />
        <Label>Nível</Label>
        <Input
          value={form.level}
          onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
        />
        <Label>Ordem</Label>
        <Input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
          />
          Publicado no site
        </label>
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
        {slots.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-4 border border-ink/10 bg-white text-ink p-4"
          >
            <span>
              {dayLabels[s.day] ?? s.day} · {s.startTime}-{s.endTime} · {s.modality}
              {s.level ? ` · ${s.level}` : ""}
            </span>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                Apagar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
