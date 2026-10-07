import { SiteHeader } from "@/components/site-header";
import { SiteFooter, type FooterContact } from "@/components/site-footer";
import { getBranding } from "@/lib/branding";
import { publicGet } from "@/lib/api";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [{ logoUrl }, contact] = await Promise.all([
    getBranding(),
    publicGet<FooterContact>("/api/public/contact", 60).catch(() => null),
  ]);

  return (
    <>
      <SiteHeader logoUrl={logoUrl} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter logoUrl={logoUrl} contact={contact} />
    </>
  );
}
