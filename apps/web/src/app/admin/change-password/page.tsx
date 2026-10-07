"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const mustChange = Boolean(
    (session?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword,
  );

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/admin/login");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!isPending && session && !mustChange) {
      router.replace("/admin");
    }
  }, [isPending, session, mustChange, router]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword"));
    const newPassword = String(form.get("newPassword"));
    const confirm = String(form.get("confirm"));
    if (newPassword !== confirm) {
      setLoading(false);
      setError("As passwords novas não coincidem.");
      return;
    }
    if (newPassword.length < 12) {
      setLoading(false);
      setError("A nova password deve ter pelo menos 12 caracteres.");
      return;
    }
    try {
      const res = await fetch("/api/admin/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data?.message === "string"
            ? data.message
            : "Não foi possível alterar a password.",
        );
      }
      await authClient.getSession();
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0e12] text-cream/50">
        A carregar...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0e12] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-[#171b21] p-7"
      >
        <h1 className="font-display text-3xl text-cream">Alterar password</h1>
        <p className="text-sm text-cream/60">
          A conta foi criada com uma password temporária. Define uma nova antes de continuar.
        </p>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Password actual</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            minLength={12}
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar nova password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={12}
            autoComplete="new-password"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "A guardar..." : "Guardar e entrar"}
        </Button>
      </form>
    </div>
  );
}
