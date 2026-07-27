"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { adminFetch } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Contact = {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
};

export default function AdminContactPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [contact, setContact] = useState<Contact | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!session) return;
    adminFetch<Contact>("/api/admin/contact").then(setContact).catch(console.error);
  }, [session]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      address: String(form.get("address") || "") || undefined,
      phone: String(form.get("phone") || "") || undefined,
      email: String(form.get("email") || "") || undefined,
      instagramUrl: String(form.get("instagramUrl") || "") || undefined,
      facebookUrl: String(form.get("facebookUrl") || "") || undefined,
    };
    setContact(
      await adminFetch<Contact>("/api/admin/contact", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    );
    setMsg("Guardado.");
  }

  if (!contact) return <p>A carregar...</p>;

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <h1 className="font-display text-5xl">Contactos</h1>
      <Label>Morada</Label>
      <Input name="address" defaultValue={contact.address ?? ""} />
      <Label>Telefone</Label>
      <Input name="phone" defaultValue={contact.phone ?? ""} />
      <Label>Email</Label>
      <Input name="email" type="email" defaultValue={contact.email ?? ""} />
      <Label>Instagram URL</Label>
      <Input name="instagramUrl" defaultValue={contact.instagramUrl ?? ""} />
      <Label>Facebook URL</Label>
      <Input name="facebookUrl" defaultValue={contact.facebookUrl ?? ""} />
      <Button type="submit">Guardar</Button>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
    </form>
  );
}
