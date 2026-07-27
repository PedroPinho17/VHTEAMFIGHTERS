"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasskeyItem = {
  id: string;
  name?: string | null;
  createdAt?: string | null;
  deviceType?: string;
};

export default function AdminSecurityPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const { data, error: err } = await authClient.passkey.listUserPasskeys();
    if (err) throw new Error(err.message);
    setPasskeys((data as PasskeyItem[]) ?? []);
  }

  useEffect(() => {
    if (session) load().catch((e) => setError(e.message));
  }, [session]);

  async function registerPasskey() {
    setError("");
    setMsg("");
    const { error: err } = await authClient.passkey.addPasskey({
      name: name || "Admin VH",
    });
    if (err) {
      setError(err.message ?? "Falha ao registar passkey");
      return;
    }
    setName("");
    setMsg("Passkey / WebAuthn registada.");
    await load();
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-5xl">Segurança · WebAuthn</h1>
      <p className="text-ink/70">
        Regista uma passkey (Windows Hello, Touch ID, Face ID ou chave de segurança) para login sem password.
      </p>
      <div className="space-y-3 border border-ink/10 bg-white text-ink p-5">
        <Label htmlFor="pk-name">Nome do dispositivo (opcional)</Label>
        <Input
          id="pk-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Portátil Pedro"
        />
        <Button type="button" onClick={registerPasskey}>
          Registar passkey
        </Button>
        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
      <ul className="space-y-2">
        {passkeys.map((pk) => (
          <li key={pk.id} className="flex items-center justify-between border border-ink/10 bg-white text-ink p-4">
            <div>
              <p className="font-semibold">{pk.name || "Passkey"}</p>
              <p className="text-xs text-ink/50">
                {pk.deviceType ?? "device"}
                {pk.createdAt ? ` · ${new Date(pk.createdAt).toLocaleString("pt-PT")}` : ""}
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                await authClient.passkey.deletePasskey({ id: pk.id });
                await load();
              }}
            >
              Remover
            </Button>
          </li>
        ))}
        {!passkeys.length && <p className="text-sm text-ink/50">Ainda sem passkeys registadas.</p>}
      </ul>
    </div>
  );
}
