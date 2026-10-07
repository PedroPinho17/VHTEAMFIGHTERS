import { publicGet } from "@/lib/api";
import { dayLabels } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Horários",
  description: "Horários de treino semanais da VH Team Fighters.",
};

type Slot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  modality: string;
  level?: string | null;
  note?: string | null;
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

export default async function HorariosPage() {
  const slots = await publicGet<Slot[]>("/api/public/schedule").catch(() => [] as Slot[]);
  const sorted = [...slots].sort(
    (a, b) =>
      dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) ||
      a.startTime.localeCompare(b.startTime),
  );

  const byDay = dayOrder
    .map((day) => ({
      day,
      items: sorted.filter((s) => s.day === day),
    }))
    .filter((g) => g.items.length);

  return (
    <div className="bg-cream text-ink">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 md:pt-14">
        <h1 className="font-display text-6xl tracking-wide">Horários</h1>
        <p className="mt-3 max-w-2xl text-ink/70">Treinos semanais da VH Team Fighters.</p>

        {/* Mobile: cards por dia */}
        <div className="mt-12 space-y-6 md:hidden">
          {byDay.map((group) => (
            <section key={group.day} className="border border-ink/10 bg-white">
              <h2 className="bg-ink px-4 py-3 font-display text-2xl tracking-wide text-cream">
                {dayLabels[group.day] ?? group.day}
              </h2>
              <ul className="divide-y divide-ink/10">
                {group.items.map((s) => (
                  <li key={s.id} className="px-4 py-4">
                    <p className="font-semibold">
                      {s.startTime} – {s.endTime}
                    </p>
                    <p className="mt-1 text-sm">{s.modality}</p>
                    {s.level && <p className="mt-1 text-sm text-ink/60">{s.level}</p>}
                    {s.note && <p className="mt-1 text-xs text-ink/50">{s.note}</p>}
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {!slots.length && (
            <p className="border border-ink/10 bg-white p-6 text-ink/60">
              Horários em atualização. Contacta-nos para saberes as próximas sessões.
            </p>
          )}
        </div>

        {/* Desktop: tabela */}
        <div className="mt-12 hidden overflow-hidden border border-ink/10 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-4 py-3 font-medium">Dia</th>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Modalidade</th>
                <th className="px-4 py-3 font-medium">Nível</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-4 py-4 font-semibold">{dayLabels[s.day] ?? s.day}</td>
                  <td className="px-4 py-4">
                    {s.startTime} – {s.endTime}
                  </td>
                  <td className="px-4 py-4">{s.modality}</td>
                  <td className="px-4 py-4 text-ink/70">{s.level ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!slots.length && (
            <p className="p-6 text-ink/60">
              Horários em atualização. Contacta-nos para saberes as próximas sessões.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
