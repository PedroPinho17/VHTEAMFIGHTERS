"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { KrajeeFileInput } from "@/components/krajee-file-input";

type Home = {
  heroTitle: string;
  heroSubtitle: string;
  bodyText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
  heroImageKey?: string | null;
  logoKey?: string | null;
  faviconKey?: string | null;
};

export default function AdminHomeContentPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [home, setHome] = useState<Home | null>(null);
  const [logoKey, setLogoKey] = useState<string | null>(null);
  const [faviconKey, setFaviconKey] = useState<string | null>(null);
  const [heroImageKey, setHeroImageKey] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    adminFetch<Home>("/api/admin/home").then((data) => {
      setHome(data);
      setLogoKey(data.logoKey ?? null);
      setFaviconKey(data.faviconKey ?? null);
      setHeroImageKey(data.heroImageKey ?? null);
    }).catch(console.error);
  }, [session]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    const form = new FormData(e.currentTarget);
    const payload = {
      heroTitle: String(form.get("heroTitle")),
      heroSubtitle: String(form.get("heroSubtitle")),
      bodyText: String(form.get("bodyText")),
      ctaPrimaryLabel: String(form.get("ctaPrimaryLabel")),
      ctaPrimaryHref: String(form.get("ctaPrimaryHref")),
      ctaSecondaryLabel: String(form.get("ctaSecondaryLabel") || "") || null,
      ctaSecondaryHref: String(form.get("ctaSecondaryHref") || "") || null,
      heroImageKey: heroImageKey,
      logoKey: logoKey,
      faviconKey: faviconKey,
    };
    try {
      const updated = await adminFetch<Home>("/api/admin/home", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setHome(updated);
      setMsg("Guardado. Recarrega a página para ver o favicon na tab do browser.");
    } catch (err) {
      setMsg(err instanceof Error ? `Erro: ${err.message}` : "Erro ao guardar");
    }
  }

  if (!home) return <p>A carregar...</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <h1 className="font-display text-5xl">Página inicial</h1>

      <section className="space-y-4 border border-ink/10 bg-white text-ink p-5">
        <h2 className="font-display text-3xl">Marca do clube</h2>
        <KrajeeFileInput
          label="Logo do clube"
          folder="branding"
          value={logoKey}
          onChange={setLogoKey}
          optional
        />
        <KrajeeFileInput
          label="Favicon"
          folder="branding"
          value={faviconKey}
          onChange={setFaviconKey}
          optional
        />
        <p className="text-xs text-ink/50">
          Sem upload, o site e o backoffice usam o logo padrão em <code>/logo.png</code>.
        </p>
      </section>

      <section className="space-y-4 border border-ink/10 bg-white text-ink p-5">
        <h2 className="font-display text-3xl">Hero</h2>
        {(
          [
            ["heroTitle", "Título hero", home.heroTitle],
            ["heroSubtitle", "Subtítulo", home.heroSubtitle],
            ["ctaPrimaryLabel", "CTA principal (label)", home.ctaPrimaryLabel],
            ["ctaPrimaryHref", "CTA principal (link)", home.ctaPrimaryHref],
            ["ctaSecondaryLabel", "CTA secundário (label)", home.ctaSecondaryLabel ?? ""],
            ["ctaSecondaryHref", "CTA secundário (link)", home.ctaSecondaryHref ?? ""],
          ] as const
        ).map(([name, label, value]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} name={name} defaultValue={value} />
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="bodyText">Texto</Label>
          <Textarea id="bodyText" name="bodyText" defaultValue={home.bodyText} />
        </div>
        <KrajeeFileInput
          label="Imagem hero"
          folder="home"
          value={heroImageKey}
          onChange={setHeroImageKey}
          optional
        />
      </section>

      <Button type="submit">Guardar</Button>
      {msg && (
        <p className={`text-sm ${msg.startsWith("Erro") ? "text-red-700" : "text-green-700"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
