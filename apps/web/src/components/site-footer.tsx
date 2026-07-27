import Link from "next/link";

type Props = {
  logoUrl?: string | null;
};

export function SiteFooter({ logoUrl }: Props) {
  const src = logoUrl || "/logo.png";

  return (
    <footer className="border-t border-white/10 bg-ink text-cream/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="VH Team Fighters" className="h-14 w-14 object-contain" />
          <div>
            <p className="font-display text-xl text-cream">VH Team Fighters</p>
            <p className="mt-1 text-sm">Boxe · Kickboxing · Lobão</p>
            <p className="mt-1 text-xs text-cream/50">R. Principal n.104, 4505-515 Lobão</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <Link href="/contactos" className="hover:text-accent">
            Contactos
          </Link>
          <a href="tel:917673853" className="hover:text-accent">
            917 673 853
          </a>
          <a
            href="https://www.instagram.com/vhteamfighters"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/100063594130412"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent"
          >
            Facebook
          </a>
          <Link href="/admin" className="hover:text-accent">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
