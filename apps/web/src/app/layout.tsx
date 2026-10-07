import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { getBranding } from "@/lib/branding";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl } = await getBranding();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  // Always keep local /logo.png as fallback — CMS/S3 favicons can 404 if MinIO port drifts.
  const icon = faviconUrl && !faviconUrl.includes(":9010") ? faviconUrl : "/logo.png";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "VH Team Fighters",
      template: "%s · VH Team Fighters",
    },
    description: "Kickboxing team — treinos, eventos e competição em Lobão.",
    openGraph: {
      type: "website",
      locale: "pt_PT",
      siteName: "VH Team Fighters",
      title: "VH Team Fighters",
      description: "Kickboxing com atitude, disciplina e resultados.",
    },
    twitter: {
      card: "summary_large_image",
      title: "VH Team Fighters",
      description: "Kickboxing com atitude, disciplina e resultados.",
    },
    icons: {
      icon: [
        { url: "/logo.png", type: "image/png" },
        { url: icon, type: "image/png" },
      ],
      shortcut: "/logo.png",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt">
      <body className={`${display.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}
