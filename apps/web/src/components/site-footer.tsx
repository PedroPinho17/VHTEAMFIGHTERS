import Link from "next/link";

export type FooterContact = {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
};

type Props = {
  logoUrl?: string | null;
  contact?: FooterContact | null;
};

export function SiteFooter({ logoUrl, contact }: Props) {
  const src = logoUrl || "/logo.png";
  const phone = contact?.phone;
  const address = contact?.address ?? "Lobão";
  const phoneHref = phone ? `tel:${phone.replace(/\s/g, "")}` : null;

  return (
    <footer className="border-t border-white/10 bg-ink text-cream/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="VH Team Fighters" className="h-14 w-14 object-contain" />
          <div>
            <p className="font-display text-xl text-cream">VH Team Fighters</p>
            <p className="mt-1 text-sm">Boxe · Kickboxing · Lobão</p>
            {address && <p className="mt-1 text-xs text-cream/50">{address}</p>}
          </div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm">
          <Link href="/contactos" className="hover:text-accent">
            Contactos
          </Link>
          <Link href="/privacidade" className="hover:text-accent">
            Privacidade
          </Link>
          {phoneHref && (
            <a href={phoneHref} className="hover:text-accent">
              {phone}
            </a>
          )}
          {contact?.instagramUrl && (
            <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
              Instagram
            </a>
          )}
          {contact?.facebookUrl && (
            <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
              Facebook
            </a>
          )}
          {contact?.youtubeUrl && (
            <a href={contact.youtubeUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
              YouTube
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
