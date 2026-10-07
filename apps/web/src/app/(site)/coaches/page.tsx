import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Coaches",
  description: "Equipa técnica da VH Team Fighters.",
};

type Person = {
  id: string;
  name: string;
  bio: string;
  titles: string[];
  photoKey?: string | null;
};

export default async function CoachesPage() {
  const people = await publicGet<Person[]>("/api/public/people?role=COACH").catch(() => [] as Person[]);

  return (
    <div className="bg-ink pt-10 md:pt-14">
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="font-display text-6xl tracking-wide text-cream">Coaches</h1>
        <p className="mt-3 max-w-2xl text-cream/70">A equipa técnica por detrás dos treinos.</p>
        {people.length ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {people.map((p) => {
              const photo = mediaUrl(p.photoKey);
              return (
                <article
                  key={p.id}
                  className="grid gap-0 border border-white/10 bg-panel md:grid-cols-[220px_1fr]"
                >
                  <div
                    className="min-h-52 bg-cover bg-center"
                    style={{
                      backgroundImage: photo
                        ? `url(${photo})`
                        : "linear-gradient(160deg,#2a2f38,#12151a)",
                    }}
                    role={photo ? "img" : undefined}
                    aria-label={photo ? p.name : undefined}
                  />
                  <div className="p-6">
                    <h2 className="font-display text-3xl text-cream">{p.name}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-cream/70">{p.bio}</p>
                    {!!p.titles?.length && (
                      <p className="mt-4 text-xs uppercase tracking-widest text-accent">
                        {p.titles.join(" · ")}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="mt-12 text-cream/60">Em breve: conhece os coaches da equipa.</p>
        )}
      </div>
    </div>
  );
}
