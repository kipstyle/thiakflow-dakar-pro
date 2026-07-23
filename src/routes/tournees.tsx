import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DakarMap } from "@/components/DakarMap";
import { DeliveryCard } from "@/components/DeliveryCard";
import { ZoneFilter, type ZoneFilterValue } from "@/components/ZoneFilter";
import { deliveries } from "@/data/deliveries";

export const Route = createFileRoute("/tournees")({
  head: () => ({
    meta: [
      { title: "Tournées disponibles — ThiakFlow Dakar" },
      {
        name: "description",
        content:
          "Consultez les offres de livraison Tiak-Tiak à Dakar par zone (Centre, VDN/Almadies, Banlieue) et lancez votre tournée optimisée.",
      },
      { property: "og:title", content: "Tournées ThiakFlow — Dakar temps réel" },
      {
        property: "og:description",
        content: "Carte interactive et offres de livraison par secteur à Dakar.",
      },
    ],
  }),
  component: Tournees,
});

function Tournees() {
  const [zone, setZone] = useState<ZoneFilterValue>("ALL");
  const filtered = useMemo(
    () => (zone === "ALL" ? deliveries : deliveries.filter((d) => d.zone === zone)),
    [zone],
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-black md:text-4xl">
            Tournées <span className="text-[#06b6d4] text-glow-cyan">actives</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} offre{filtered.length > 1 ? "s" : ""} · Presqu'île de Dakar
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <DakarMap interactive className="h-[45vh] w-full lg:h-[70vh]" />

        <div className="flex flex-col gap-4">
          <ZoneFilter value={zone} onChange={setZone} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {filtered.map((d) => (
              <DeliveryCard key={d.ref} d={d} />
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Aucune offre dans cette zone pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
