"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KrajeeFileInput } from "@/components/krajee-file-input";
import { mediaUrl } from "@/lib/utils";

type Item = {
  id: string;
  imageKey: string;
  alt?: string | null;
  album?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export default function AdminGalleryPage() {
  const { data: session } = authClient.useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [album, setAlbum] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setItems(await adminFetch<Item[]>("/api/admin/gallery"));
  }

  useEffect(() => {
    if (session) load().catch(console.error);
  }, [session]);

  function resetForm() {
    setEditingId(null);
    setImageKey(null);
    setAlt("");
    setAlbum("");
    setMsg("");
  }

  function startEdit(item: Item) {
    setEditingId(item.id);
    setImageKey(item.imageKey);
    setAlt(item.alt ?? "");
    setAlbum(item.album ?? "");
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageKey) {
      setMsg("Escolhe uma imagem.");
      return;
    }
    setBusy(true);
    const payload = {
      imageKey,
      alt: alt || null,
      album: album || null,
      published: true,
    };
    try {
      if (editingId) {
        await adminFetch(`/api/admin/gallery/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Atualizado.");
      } else {
        await adminFetch("/api/admin/gallery", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMsg("Criado.");
      }
      resetForm();
      await load();
    } catch (err) {
      setMsg(err instanceof Error ? `Erro: ${err.message}` : "Erro");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Apagar esta imagem?")) return;
    await adminFetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Galeria</h1>
        {editingId && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Nova imagem
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid max-w-xl gap-3 border border-ink/10 bg-white text-ink p-5">
        <p className="text-sm font-semibold text-ink/60">
          {editingId ? "A editar" : "Criar nova"}
        </p>
        <KrajeeFileInput
          label="Imagem"
          folder="gallery"
          value={imageKey}
          onChange={setImageKey}
          optional={false}
        />
        <Label>Alt</Label>
        <Input value={alt} onChange={(e) => setAlt(e.target.value)} />
        <Label>Álbum</Label>
        <Input value={album} onChange={(e) => setAlbum(e.target.value)} placeholder="opcional" />
        <div className="flex gap-2">
          <Button type="submit" disabled={busy || !imageKey}>
            {busy ? "A guardar..." : editingId ? "Guardar alterações" : "Adicionar à galeria"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>
        {msg && <p className="text-sm text-ink/70">{msg}</p>}
      </form>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 border border-ink/10 bg-white text-ink p-4 text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              {mediaUrl(item.imageKey) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mediaUrl(item.imageKey)!}
                  alt={item.alt ?? ""}
                  className="h-14 w-14 shrink-0 object-cover"
                />
              ) : null}
              <div className="min-w-0">
                <p className="truncate font-medium">{item.alt || item.imageKey}</p>
                {item.album && <p className="text-ink/50">{item.album}</p>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                Apagar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
