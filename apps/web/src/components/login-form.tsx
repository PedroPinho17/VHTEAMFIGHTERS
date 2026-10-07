"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      const mustChange = Boolean(
        (session.user as { mustChangePassword?: boolean }).mustChangePassword,
      );
      router.replace(mustChange ? "/admin/change-password" : "/admin");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.PublicKeyCredential ||
      !PublicKeyCredential.isConditionalMediationAvailable
    ) {
      return;
    }
    void PublicKeyCredential.isConditionalMediationAvailable().then((ok) => {
      if (ok) void authClient.signIn.passkey({ autoFill: true });
    });
  }, []);

  async function goAdmin() {
    const { data } = await authClient.getSession();
    const mustChange = Boolean(
      (data?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword,
    );
    router.replace(mustChange ? "/admin/change-password" : "/admin");
    router.refresh();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Falha no login");
      return;
    }
    await goAdmin();
  }

  async function onPasskey() {
    setPasskeyLoading(true);
    setError("");
    const { error: err } = await authClient.signIn.passkey();
    setPasskeyLoading(false);
    if (err) {
      setError(err.message ?? "Falha no WebAuthn / passkey");
      return;
    }
    await goAdmin();
  }

  if (isPending || session) {
    return <p className="text-center text-cream/50">A redirecionar...</p>;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-[#171b21] p-7 shadow-2xl"
    >
      <div className="mb-2 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-12 w-12 object-contain" />
        <div>
          <h1 className="font-display text-3xl tracking-wide text-cream">VH Admin</h1>
          <p className="text-xs uppercase tracking-widest text-cream/40">Login</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-cream/70">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username webauthn"
          defaultValue="admin@vhteamfighters.local"
          required
          className="border-white/15 bg-[#111418] text-cream"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-cream/70">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password webauthn"
          required
          className="border-white/15 bg-[#111418] text-cream"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "A entrar..." : "Entrar"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={passkeyLoading}
        onClick={onPasskey}
      >
        {passkeyLoading ? "A aguardar dispositivo..." : "Entrar com Passkey"}
      </Button>
    </form>
  );
}
