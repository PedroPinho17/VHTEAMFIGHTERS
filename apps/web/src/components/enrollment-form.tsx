"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function EnrollmentForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = new FormData(e.currentTarget);
    const privacyConsent = form.get("privacyConsent") === "on";
    if (!privacyConsent) {
      setStatus("error");
      setError("É necessário aceitar a política de privacidade.");
      return;
    }
    try {
      const res = await fetch("/api/public/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          message: form.get("message") || undefined,
          privacyConsent: true,
          website: form.get("website") || "",
        }),
      });
      if (!res.ok) {
        let message = "Não foi possível enviar. Tenta novamente.";
        try {
          const data = await res.json();
          if (typeof data?.message === "string") message = data.message;
          else if (Array.isArray(data?.message)) message = data.message.join(", ");
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }
      setStatus("ok");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Erro ao enviar");
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4 border border-ink/10 bg-white p-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required autoComplete="name" maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" maxLength={254} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Objetivo, experiência, horários preferidos..."
          maxLength={2000}
        />
      </div>
      <div className="flex items-start gap-2 text-sm text-ink/80">
        <input
          id="privacyConsent"
          name="privacyConsent"
          type="checkbox"
          required
          className="mt-1"
        />
        <Label htmlFor="privacyConsent" className="font-normal leading-snug">
          Li e aceito a{" "}
          <Link href="/privacidade" className="underline hover:text-accent" target="_blank">
            política de privacidade
          </Link>
          . Os dados serão usados apenas para contacto sobre a inscrição.
        </Label>
      </div>
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "A enviar..." : "Enviar inscrição"}
      </Button>
      {status === "ok" && (
        <p className="text-sm text-green-700" role="status">
          Inscrição enviada. Entramos em contacto em breve.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
