import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type Person = {
  id: string;
  name: string;
  bio: string;
  weightKg?: number | null;
  titles: string[];
  photoKey?: string | null;
};

export default async function LutadoresPage() {
  const people = await publicGet<Person[]>("/api/public/people?role=FIGHTER").catch(() => [] as Person[]);

  return (
    <div className="bg-ink pt-10 md:pt-14">
      <div className="mx-auto max-w-6xl px-5 pb-20">
        <h1 className="font-display text-6xl tracking-wide text-cream">Lutadores</h1>
        <p className="mt-3 max-w-2xl text-cream/70">Atletas da VH Team Fighters.</p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <article key={p.id} className="overflow-hidden border border-white/10 bg-panel">
              <div
                className="h-56 bg-cover bg-center"
                style={{
                  backgroundImage: mediaUrl(p.photoKey)
                    ? `url(${mediaUrl(p.photoKey)})`
                    : "linear-gradient(160deg,#2a2f38,#12151a)",
                }}
              />
              <div className="p-5">
                <h2 className="font-display text-3xl text-cream">{p.name}</h2>
                {p.weightKg != null && (
                  <p className="mt-1 text-sm uppercase tracking-widest text-accent">{p.weightKg} kg</p>
                )}
                <p className="mt-3 text-sm text-cream/70">{p.bio}</p>
                {!!p.titles?.length && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.titles.map((t) => (
                      <li key={t} className="border border-white/15 px-2 py-1 text-xs text-cream/80">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
