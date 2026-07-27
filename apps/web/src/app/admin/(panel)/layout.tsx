"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  CalendarDays,
  Contact,
  FileText,
  Home,
  Images,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Newspaper,
  Users,
  ExternalLink,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/admin/home", label: "Página inicial", icon: Home },
  { href: "/admin/people", label: "Lutadores / Coaches", icon: Users },
  { href: "/admin/schedule", label: "Horários", icon: CalendarDays },
  { href: "/admin/events", label: "Eventos", icon: FileText },
  { href: "/admin/posts", label: "Notícias", icon: Newspaper },
  { href: "/admin/gallery", label: "Galeria", icon: Images },
  { href: "/admin/contact", label: "Contactos", icon: Contact },
  { href: "/admin/enrollments", label: "Inscrições", icon: Inbox },
  { href: "/admin/security", label: "Segurança", icon: Lock },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/admin/login");
    }
  }, [isPending, session, router]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111418] text-cream/60">
        A verificar sessão...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111418] text-cream">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0c0e12] md:flex">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/admin" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-9 w-9 object-contain" />
              <div>
                <p className="font-display text-xl leading-none tracking-wide">VH ADMIN</p>
                <p className="mt-1 text-[11px] uppercase tracking-widest text-cream/40">Backoffice</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {sections.map((s) => {
              const active = s.exact ? pathname === s.href : pathname.startsWith(s.href);
              const Icon = s.icon;
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-accent text-ink font-semibold"
                      : "text-cream/65 hover:bg-white/5 hover:text-cream",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-3">
            <Link
              href="/"
              target="_blank"
              className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-cream/55 hover:bg-white/5 hover:text-cream"
            >
              <ExternalLink className="h-4 w-4" />
              Ver site
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-cream/55 hover:bg-white/5 hover:text-cream"
              onClick={async () => {
                await authClient.signOut();
                router.replace("/admin/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#111418]/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="md:hidden">
              <Link href="/admin" className="font-display text-xl tracking-wide">
                VH ADMIN
              </Link>
            </div>
            <p className="hidden text-sm text-cream/55 md:block">
              Olá, <span className="text-cream">{session.user.name}</span>
            </p>
            <div className="flex items-center gap-2 overflow-x-auto md:hidden">
              {sections.slice(0, 5).map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="whitespace-nowrap rounded-full border border-white/10 px-3 py-1 text-xs text-cream/70"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </header>
          <main className="admin-surface flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
