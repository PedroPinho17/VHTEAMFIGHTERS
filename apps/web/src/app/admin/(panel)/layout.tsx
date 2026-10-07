"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  Menu,
  Newspaper,
  Users,
  ExternalLink,
  X,
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
  { href: "/admin/security", label: "Segurança", icon: Lock, adminOnly: true },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = session?.user as
    | { role?: string; mustChangePassword?: boolean }
    | undefined;
  const role = user?.role ?? "NONE";
  const mustChangePassword = Boolean(user?.mustChangePassword);
  const visibleSections = sections.filter((s) => !s.adminOnly || role === "ADMIN");

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/admin/login");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!isPending && session && mustChangePassword) {
      router.replace("/admin/change-password");
    }
  }, [isPending, session, mustChangePassword, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (isPending || !session || mustChangePassword) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111418] text-cream/60">
        A verificar sessão...
      </div>
    );
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        {visibleSections.map((s) => {
          const active = s.exact ? pathname === s.href : pathname.startsWith(s.href);
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              onClick={onNavigate}
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
      </>
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
            <NavLinks />
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
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-[#111418]/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center gap-3 md:hidden">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10"
                aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link href="/admin" className="font-display text-xl tracking-wide">
                VH ADMIN
              </Link>
            </div>
            <p className="hidden text-sm text-cream/55 md:block">
              Olá, <span className="text-cream">{session.user.name}</span>
              {role === "ADMIN" ? (
                <span className="ml-2 text-xs uppercase tracking-widest text-accent">Admin</span>
              ) : (
                <span className="ml-2 text-xs uppercase tracking-widest text-cream/35">Editor</span>
              )}
            </p>
            <Link
              href="/"
              target="_blank"
              className="text-xs uppercase tracking-widest text-cream/45 hover:text-accent md:hidden"
            >
              Site
            </Link>
          </header>

          {mobileOpen && (
            <div className="border-b border-white/10 bg-[#0c0e12] p-3 md:hidden">
              <nav className="space-y-0.5">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </nav>
              <button
                type="button"
                className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-cream/55"
                onClick={async () => {
                  await authClient.signOut();
                  router.replace("/admin/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}

          <main className="admin-surface flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
