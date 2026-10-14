"use client";

import { FormEvent, useEffect, useState } from "react";
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
  const { data: session } = authClient.useSession();
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
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <h1 className="font-display text-5xl text-cream">Página inicial</h1>

      <section className="space-y-5 rounded-md border border-ink/10 bg-white p-5 text-ink md:p-6">
        <div>
          <h2 className="font-display text-3xl tracking-wide">Marca do clube</h2>
          <p className="mt-1 text-sm text-ink/50">
            Sem upload, o site usa o logo padrão em <code className="text-ink/70">/logo.png</code>.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <KrajeeFileInput
            label="Logo do clube"
            folder="branding"
            value={logoKey}
            onChange={setLogoKey}
            preview="square"
            optional
            hint="Aparece no topo e no rodapé do site."
          />
          <KrajeeFileInput
            label="Favicon"
            folder="branding"
            value={faviconKey}
            onChange={setFaviconKey}
            preview="square"
            optional
            hint="Ícone da tab do browser. Ideal: PNG quadrado."
          />
        </div>
      </section>

      <section className="space-y-5 rounded-md border border-ink/10 bg-white p-5 text-ink md:p-6">
        <div>
          <h2 className="font-display text-3xl tracking-wide">Hero</h2>
          <p className="mt-1 text-sm text-ink/50">
            Título, CTAs e imagem de fundo da primeira secção.
          </p>
        </div>
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
          label="Imagem de fundo"
          folder="home"
          value={heroImageKey}
          onChange={setHeroImageKey}
          preview="wide"
          optional
          hint="Imagem full-bleed atrás do título. Sem upload, usa o gradiente escuro."
        />
      </section>

      <Button type="submit">Guardar</Button>
      {msg && (
        <p className={`text-sm ${msg.startsWith("Erro") ? "text-red-400" : "text-emerald-400"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
