"use client";

import { useCallback, useEffect, useState } from "react";
import { mediaUrl } from "@/lib/utils";

type Item = {
  id: string;
  imageKey: string;
  alt?: string | null;
  album?: string | null;
};

export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => {
    setActive((i) => (i == null ? i : (i + items.length - 1) % items.length));
  }, [items.length]);
  const next = useCallback(() => {
    setActive((i) => (i == null ? i : (i + 1) % items.length));
  }, [items.length]);

  useEffect(() => {
    if (active == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close, prev, next]);

  if (!items.length) {
    return (
      <p className="mt-8 text-cream/60">Ainda sem fotos publicadas. Volta em breve.</p>
    );
  }

  const current = active != null ? items[active] : null;
  const currentSrc = current ? mediaUrl(current.imageKey) : null;

  return (
    <>
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, index) => {
          const src = mediaUrl(item.imageKey);
          if (!src) return null;
          return (
            <button
              key={item.id}
              type="button"
              className="mb-4 block w-full break-inside-avoid overflow-hidden border border-white/10 text-left transition hover:border-accent"
              onClick={() => setActive(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={item.alt ?? "Foto VH Team Fighters"}
                className="w-full object-cover"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      {current && currentSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt ?? "Foto ampliada"}
          onClick={close}
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-sm uppercase tracking-widest text-cream/80 hover:text-accent"
            onClick={close}
          >
            Fechar
          </button>
          {items.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 px-3 py-2 text-cream/80 hover:text-accent md:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Anterior"
              >
                ←
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 text-cream/80 hover:text-accent md:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Seguinte"
              >
                →
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSrc}
            alt={current.alt ?? "Foto VH Team Fighters"}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
