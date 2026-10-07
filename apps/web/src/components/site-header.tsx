"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/lutadores", label: "Lutadores" },
  { href: "/coaches", label: "Coaches" },
  { href: "/horarios", label: "Horários" },
  { href: "/eventos", label: "Eventos" },
  { href: "/noticias", label: "Notícias" },
  { href: "/galeria", label: "Galeria" },
  { href: "/contactos", label: "Contactos" },
];

type Props = {
  logoUrl?: string | null;
};

export function SiteHeader({ logoUrl }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onHome = pathname === "/";
  const src = logoUrl || "/logo.png";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-40",
        onHome ? "absolute" : "sticky border-b border-ink/10 bg-cream/95 backdrop-blur",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="VH Team Fighters" className="h-12 w-12 object-contain" />
          <span
            className={cn(
              "font-display text-2xl tracking-wide",
              onHome ? "text-cream" : "text-ink",
            )}
          >
            VH TEAM
          </span>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm uppercase tracking-[0.14em] transition",
                onHome
                  ? "text-cream/75 hover:text-accent"
                  : "text-ink/65 hover:text-accent-strong",
                pathname === link.href && (onHome ? "text-accent" : "text-accent-strong"),
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden",
            onHome ? "text-cream" : "text-ink",
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div
          id="mobile-nav"
          className={cn(
            "border-t px-5 py-4 lg:hidden",
            onHome ? "border-white/10 bg-ink/95" : "border-ink/10 bg-cream",
          )}
        >
          <nav className="flex flex-col gap-3" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-sm uppercase tracking-[0.14em]",
                  onHome ? "text-cream/85" : "text-ink/80",
                  pathname === link.href && "text-accent",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
