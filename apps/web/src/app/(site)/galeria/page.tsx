import { publicGet } from "@/lib/api";
import { GalleryGrid } from "@/components/gallery-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galeria",
  description: "Fotos de treinos e eventos da VH Team Fighters.",
};

type Item = {
  id: string;
  imageKey: string;
  alt?: string | null;
  album?: string | null;
};

export default async function GaleriaPage() {
  const items = await publicGet<Item[]>("/api/public/gallery").catch(() => [] as Item[]);

  return (
    <div className="bg-ink pt-10 md:pt-14">
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="font-display text-6xl tracking-wide text-cream">Galeria</h1>
        <p className="mt-3 max-w-2xl text-cream/70">Momentos de treino e competição.</p>
        <GalleryGrid items={items} />
      </div>
    </div>
  );
}
