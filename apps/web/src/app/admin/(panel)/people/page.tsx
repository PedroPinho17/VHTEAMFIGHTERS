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

type Person = {
  id: string;
  role: "FIGHTER" | "COACH";
  name: string;
  bio: string;
  weightKg?: number | null;
  titles: string[];
  photoKey?: string | null;
  published: boolean;
  sortOrder?: number;
};

const empty = {
  role: "FIGHTER" as const,
  name: "",
  bio: "",
  weightKg: "",
  titles: "",
};

export default function AdminPeoplePage() {
  const { data: session } = authClient.useSession();
  const [people, setPeople] = useState<Person[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setPeople(await adminFetch<Person[]>("/api/admin/people"));
  }

  useEffect(() => {
    if (session) load().catch(console.error);
  }, [session]);

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setPhotoKey(null);
    setMsg("");
  }

  function startEdit(p: Person) {
    setEditingId(p.id);
    setForm({
      role: p.role,
      name: p.name,
      bio: p.bio,
      weightKg: p.weightKg != null ? String(p.weightKg) : "",
      titles: (p.titles ?? []).join(", "),
    });
    setPhotoKey(p.photoKey ?? null);
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      role: form.role,
      name: form.name,
      bio: form.bio,
      weightKg: form.weightKg ? Number(form.weightKg) : null,
      titles: form.titles
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      photoKey: photoKey,
      published: true,
    };
    try {
      if (editingId) {
        await adminFetch(`/api/admin/people/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Atualizado.");
      } else {
        await adminFetch("/api/admin/people", {
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
    if (!confirm("Apagar este registo?")) return;
    await adminFetch(`/api/admin/people/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Lutadores / Coaches</h1>
        {editingId && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Novo registo
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid max-w-2xl gap-3 border border-ink/10 bg-white text-ink p-5">
        <p className="text-sm font-semibold text-ink/60">
          {editingId ? "A editar" : "Criar novo"}
        </p>
        <Label>Role</Label>
        <select
          className="h-11 rounded-md border border-ink/15 bg-white text-ink px-3"
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Person["role"] }))}
        >
          <option value="FIGHTER">Lutador</option>
          <option value="COACH">Coach</option>
        </select>
        <Label>Nome</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <Label>Bio</Label>
        <Textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          required
        />
        <Label>Peso (kg)</Label>
        <Input
          type="number"
          step="0.1"
          value={form.weightKg}
          onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
        />
        <Label>Títulos (separados por vírgula)</Label>
        <Input
          value={form.titles}
          onChange={(e) => setForm((f) => ({ ...f, titles: e.target.value }))}
        />
        <KrajeeFileInput label="Foto" folder="people" value={photoKey} onChange={setPhotoKey} optional />
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

      <div className="space-y-3">
        {people.map((p) => (
          <div
            key={p.id}
            className="flex items-start justify-between gap-4 border border-ink/10 bg-white text-ink p-4"
          >
            <div className="flex gap-4">
              {mediaUrl(p.photoKey) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(p.photoKey)!} alt={p.name} className="h-16 w-16 object-cover" />
              ) : null}
              <div>
                <p className="font-semibold">
                  {p.name} · {p.role}
                </p>
                <p className="text-sm text-ink/70">{p.bio}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                Apagar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
