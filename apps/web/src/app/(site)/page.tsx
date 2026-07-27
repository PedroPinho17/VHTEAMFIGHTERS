import Link from "next/link";
import { publicGet } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

type Home = {
  heroTitle: string;
  heroSubtitle: string;
  bodyText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
  heroImageKey?: string | null;
};

type Person = { id: string; name: string; role: string; bio: string; photoKey?: string | null };
type Event = { id: string; title: string; date: string; location?: string | null };

async function getHome(): Promise<Home | null> {
  try {
    return await publicGet<Home>("/api/public/home");
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const [home, fighters, events] = await Promise.all([
    getHome(),
    publicGet<Person[]>("/api/public/people?role=FIGHTER").catch(() => [] as Person[]),
    publicGet<Event[]>("/api/public/events").catch(() => [] as Event[]),
  ]);

  const heroImage = mediaUrl(home?.heroImageKey) ?? null;

  return (
    <>
      <section className="relative min-h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: heroImage
              ? `url(${heroImage})`
              : "linear-gradient(135deg, #1a1f27 0%, #0d0f12 45%, #3d1a0a 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35" />
        <div className="animate-glow absolute -right-20 top-24 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32">
          <p className="animate-rise font-display text-6xl leading-none tracking-wide text-cream md:text-8xl lg:text-9xl">
            {home?.heroTitle ?? "VH Team Fighters"}
          </p>
          <p className="animate-rise-delay mt-4 max-w-xl text-lg text-cream/80 md:text-xl">
            {home?.heroSubtitle ?? "Kickboxing com atitude, disciplina e resultados"}
          </p>
          <div className="animate-rise-delay mt-8 flex flex-wrap gap-3">
            <Link
              href={home?.ctaPrimaryHref ?? "/contactos"}
              className="inline-flex h-12 items-center rounded-md bg-accent px-6 font-semibold text-ink transition hover:bg-accent-strong hover:text-cream"
            >
              {home?.ctaPrimaryLabel ?? "Inscreve-te"}
            </Link>
            {home?.ctaSecondaryHref && (
              <Link
                href={home.ctaSecondaryHref}
                className="inline-flex h-12 items-center rounded-md border border-cream/30 px-6 font-semibold text-cream transition hover:border-accent hover:text-accent"
              >
                {home.ctaSecondaryLabel ?? "Saber mais"}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-cream text-ink">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2 md:items-center">
          <h2 className="font-display text-5xl tracking-wide md:text-6xl">A equipa</h2>
          <p className="text-lg leading-relaxed text-ink/75">
            {home?.bodyText ??
              "Treina com uma equipa focada em técnica, condição física e mentalidade de combate."}
          </p>
        </div>
      </section>

      <section className="bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-5xl tracking-wide text-cream">Lutadores</h2>
            <Link href="/lutadores" className="text-sm uppercase tracking-widest text-accent">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fighters.slice(0, 3).map((p) => (
              <article key={p.id} className="border border-white/10 bg-ink/40 p-5">
                <h3 className="font-display text-3xl text-cream">{p.name}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-cream/65">{p.bio}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="font-display text-5xl tracking-wide text-cream">Próximos eventos</h2>
          <div className="mt-8 space-y-4">
            {events.slice(0, 3).map((e) => (
              <Link
                key={e.id}
                href={`/eventos/${e.id}`}
                className="flex flex-col justify-between gap-2 border-b border-white/10 py-4 transition hover:border-accent md:flex-row md:items-center"
              >
                <span className="font-display text-2xl text-cream">{e.title}</span>
                <span className="text-sm text-cream/60">
                  {new Date(e.date).toLocaleDateString("pt-PT")}
                  {e.location ? ` · ${e.location}` : ""}
                </span>
              </Link>
            ))}
            {!events.length && <p className="text-cream/60">Sem eventos publicados.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
