import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getBranding } from "@/lib/branding";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { logoUrl } = await getBranding();

  return (
    <>
      <SiteHeader logoUrl={logoUrl} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter logoUrl={logoUrl} />
    </>
  );
}
