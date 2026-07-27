import { publicGet } from "@/lib/api";
import { EnrollmentForm } from "@/components/enrollment-form";
import { dayLabels } from "@/lib/utils";

type OpeningHour = {
  day: string;
  open?: string;
  close?: string;
  closed?: boolean;
};

type Contact = {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  youtubeUrl?: string | null;
  mapEmbedUrl?: string | null;
  openingHours?: OpeningHour[] | null;
};

const dayOrder = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default async function ContactosPage() {
  const contact = await publicGet<Contact>("/api/public/contact").catch(() => null);
  const hours = [...(contact?.openingHours ?? [])].sort(
    (a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day),
  );

  return (
    <div className="bg-cream pt-10 text-ink md:pt-14">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-6xl tracking-wide">Contactos</h1>
          <p className="mt-4 text-ink/70">Fala connosco ou deixa a tua inscrição para treinar.</p>
          <dl className="mt-10 space-y-4 text-sm">
            {contact?.address && (
              <div>
                <dt className="uppercase tracking-widest text-ink/45">Morada</dt>
                <dd className="mt-1 text-base">{contact.address}</dd>
              </div>
            )}
            {contact?.phone && (
              <div>
                <dt className="uppercase tracking-widest text-ink/45">Telefone</dt>
                <dd className="mt-1 text-base">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>
                </dd>
              </div>
            )}
            {contact?.email && (
              <div>
                <dt className="uppercase tracking-widest text-ink/45">Email</dt>
                <dd className="mt-1 text-base">
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
            )}
            {(contact?.instagramUrl || contact?.facebookUrl) && (
              <div>
                <dt className="uppercase tracking-widest text-ink/45">Redes</dt>
                <dd className="mt-1 flex flex-wrap gap-4">
                  {contact.instagramUrl && (
                    <a
                      href={contact.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent-strong underline"
                    >
                      Instagram
                    </a>
                  )}
                  {contact.facebookUrl && (
                    <a
                      href={contact.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent-strong underline"
                    >
                      Facebook
                    </a>
                  )}
                </dd>
              </div>
            )}
          </dl>

          {!!hours.length && (
            <div className="mt-10">
              <h2 className="font-display text-3xl tracking-wide">Horário de abertura</h2>
              <ul className="mt-4 divide-y divide-ink/10 border border-ink/10 bg-white">
                {hours.map((h) => (
                  <li key={h.day} className="flex justify-between px-4 py-3 text-sm">
                    <span className="font-semibold">{dayLabels[h.day] ?? h.day}</span>
                    <span className="text-ink/70">
                      {h.closed ? "Encerrado" : `${h.open}–${h.close}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div>
          <h2 className="font-display text-4xl tracking-wide">Inscrição</h2>
          <div className="mt-6">
            <EnrollmentForm />
          </div>
        </div>
      </div>
    </div>
  );
}
