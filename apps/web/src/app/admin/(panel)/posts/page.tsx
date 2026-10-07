"use client";

import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KrajeeFileInput } from "@/components/krajee-file-input";
import { MarkdownEditor } from "@/components/markdown-editor";
import { mediaUrl } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  published: boolean;
  coverKey?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  published: true,
};

export default function AdminPostsPage() {
  const { data: session } = authClient.useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setPosts(await adminFetch<Post[]>("/api/admin/posts"));
  }

  useEffect(() => {
    if (session) load().catch(console.error);
  }, [session]);

  function resetForm() {
    setEditingId(null);
    setForm(empty);
    setCoverKey(null);
    setMsg("");
  }

  function startEdit(p: Post) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      body: p.body,
      published: p.published,
    });
    setCoverKey(p.coverKey ?? null);
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      body: form.body,
      coverKey: coverKey,
      published: form.published,
      publishedAt: form.published ? new Date().toISOString() : undefined,
    };
    try {
      if (editingId) {
        await adminFetch(`/api/admin/posts/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMsg("Atualizado.");
      } else {
        await adminFetch("/api/admin/posts", {
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
    if (!confirm("Apagar esta notícia?")) return;
    await adminFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-5xl">Notícias</h1>
        {editingId && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Nova notícia
          </Button>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid max-w-2xl gap-3 border border-ink/10 bg-white text-ink p-5">
        <p className="text-sm font-semibold text-ink/60">
          {editingId ? "A editar" : "Criar nova"}
        </p>
        <Label>Título</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <Label>Slug</Label>
        <Input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          placeholder="opcional — gerado do título"
        />
        <Label>Excerpt</Label>
        <Input
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
        />
        <MarkdownEditor
          value={form.body}
          onChange={(body) => setForm((f) => ({ ...f, body }))}
          required
        />
        <KrajeeFileInput
          label="Imagem de capa"
          folder="posts"
          value={coverKey}
          onChange={setCoverKey}
          optional
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
          <Button type="submit">
            {editingId ? "Guardar alterações" : form.published ? "Publicar" : "Guardar rascunho"}
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
        {posts.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-4 border border-ink/10 bg-white text-ink p-4"
          >
            <div className="flex items-center gap-3">
              {mediaUrl(p.coverKey) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(p.coverKey)!} alt="" className="h-12 w-12 object-cover" />
              ) : null}
              <span>
                {p.title}{" "}
                <span className="text-ink/50">/{p.slug}</span>
                {!p.published && <span className="ml-2 text-xs text-ink/45">rascunho</span>}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                Editar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => remove(p.id)}>
                Apagar
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
