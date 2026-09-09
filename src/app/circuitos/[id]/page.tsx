import Link from "next/link";
import { notFound } from "next/navigation";
import { getCircuit, getSimilarCircuits, getRounds } from "@/lib/data";
import { PageHero, Panel } from "@/components/ui";
import { flagEmoji } from "@/lib/format";

export const revalidate = 60;

export default async function CircuitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const circuit = await getCircuit(id);
  if (!circuit) notFound();

  const [similar, rounds] = await Promise.all([
    getSimilarCircuits(circuit),
    getRounds(),
  ]);
  const circuitRounds = rounds
    .filter((r) => r.circuit_id === circuit.id)
    .sort((a, b) => a.round_number - b.round_number);

  const stat = (label: string, value: React.ReactNode) => (
    <div className="rounded-lg p-3" style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}>
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="text-lg font-extrabold">{value}</p>
    </div>
  );

  const rec = circuit.lap_record_time;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={circuit.country ? `${flagEmoji(circuit.country_code)} ${circuit.country}` : "Circuito"}
        title={circuit.name}
      >
        <Link href="/calendario" className="font-bold text-primary">
          ← Calendario
        </Link>
      </PageHero>

      <section className="shell grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel className="overflow-hidden">
          {circuit.map_url ? (
            <div
              className="flex items-center justify-center p-6"
              style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,101,0,.14), transparent 60%)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={circuit.map_url} alt={`Trazado de ${circuit.name}`} className="max-h-[340px] w-auto object-contain" />
            </div>
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-muted">
              Sin imagen del trazado
            </div>
          )}
          {circuit.description && (
            <p className="border-t px-5 py-4 text-sm leading-relaxed text-muted" style={{ borderColor: "var(--line)" }}>
              {circuit.description}
            </p>
          )}
        </Panel>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {circuit.length_km != null && stat("Longitud", `${circuit.length_km} km`)}
            {circuit.turns != null && stat("Curvas", circuit.turns)}
            {circuit.laps != null && stat("Vueltas (liga)", circuit.laps)}
            {circuitRounds.length > 0 && stat("Rondas", circuitRounds.map((r) => `R${r.round_number}`).join(" · "))}
          </div>

          <Panel className="p-5">
            <p className="eyebrow">Récord de vuelta · vida real</p>
            {rec ? (
              <>
                <p className="mt-1 text-3xl font-black tabular-nums">{rec}</p>
                <p className="text-sm text-muted">
                  {[circuit.lap_record_holder, circuit.lap_record_car, circuit.lap_record_year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted">No cargado.</p>
            )}
          </Panel>

          {circuitRounds.some((r) => r.status === "finalizado") && (
            <div className="flex flex-wrap gap-2">
              {circuitRounds
                .filter((r) => r.status === "finalizado")
                .map((r) => (
                  <Link key={r.id} href={`/resultados/${r.id}`} className="chip hover:border-primary">
                    Resultados R{r.round_number}
                  </Link>
                ))}
            </div>
          )}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="shell">
          <Panel className="p-5">
            <p className="eyebrow">Trazados parecidos</p>
            <p className="mb-3 text-xs text-muted">Por longitud similar.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((c) => (
                <Link
                  key={c.id}
                  href={`/circuitos/${c.id}`}
                  className="rounded-lg p-3 transition hover:border-primary"
                  style={{ background: "var(--panel-2)", border: "1px solid var(--line)" }}
                >
                  <p className="font-bold">
                    {flagEmoji(c.country_code)} {c.name}
                  </p>
                  <p className="text-sm text-muted">
                    {c.length_km != null ? `${c.length_km} km` : ""}
                    {c.turns != null ? ` · ${c.turns} curvas` : ""}
                  </p>
                </Link>
              ))}
            </div>
          </Panel>
        </section>
      )}
    </div>
  );
}
