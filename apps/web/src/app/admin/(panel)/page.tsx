"use client";

import Link from "next/link";
import {
  CalendarDays,
  Contact,
  FileText,
  Images,
  Lock,
  Newspaper,
  Users,
  Home,
  Inbox,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const cards = [
  { href: "/admin/home", label: "Página inicial", desc: "Hero, logo e favicon", icon: Home },
  { href: "/admin/people", label: "Lutadores / Coaches", desc: "Equipa e bios", icon: Users },
  { href: "/admin/schedule", label: "Horários", desc: "Treinos semanais", icon: CalendarDays },
  { href: "/admin/events", label: "Eventos", desc: "Combates e datas", icon: FileText },
  { href: "/admin/posts", label: "Notícias", desc: "Publicações", icon: Newspaper },
  { href: "/admin/gallery", label: "Galeria", desc: "Fotos", icon: Images },
  { href: "/admin/contact", label: "Contactos", desc: "Morada e redes", icon: Contact },
  { href: "/admin/enrollments", label: "Inscrições", desc: "Pedidos recebidos", icon: Inbox },
  { href: "/admin/security", label: "Segurança", desc: "Passkeys / WebAuthn", icon: Lock },
];

export default function AdminDashboardPage() {
  const { data: session } = authClient.useSession();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "EDITOR";
  const visible = cards.filter((c) => c.href !== "/admin/security" || role === "ADMIN");

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-5xl tracking-wide md:text-6xl">Painel</h1>
      <p className="mt-2 max-w-xl text-cream/60">
        Gere o conteúdo do site VH Team Fighters sem mexer em código.
        {session?.user.email ? ` · ${session.user.email}` : ""}
      </p>
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-lg border border-white/10 bg-[#171b21] p-5 transition hover:border-accent hover:bg-[#1c222a]"
            >
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-4 font-semibold text-cream group-hover:text-white">{c.label}</p>
              <p className="mt-1 text-sm text-cream/45">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
