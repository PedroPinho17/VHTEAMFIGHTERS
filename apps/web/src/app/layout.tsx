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
  return {
    title: {
      default: "VH Team Fighters",
      template: "%s · VH Team Fighters",
    },
    description: "Kickboxing team — treinos, eventos e competição.",
    icons: {
      icon: faviconUrl || "/logo.png",
      apple: faviconUrl || "/logo.png",
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
