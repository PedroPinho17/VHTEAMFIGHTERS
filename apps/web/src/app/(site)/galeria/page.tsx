import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

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
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <figure key={item.id} className="mb-4 break-inside-avoid overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(item.imageKey) ?? ""}
                alt={item.alt ?? "Galeria VH"}
                className="w-full object-cover"
              />
            </figure>
          ))}
        </div>
        {!items.length && (
          <p className="mt-8 text-cream/60">Ainda sem fotos publicadas. Carrega imagens no admin.</p>
        )}
      </div>
    </div>
  );
}
