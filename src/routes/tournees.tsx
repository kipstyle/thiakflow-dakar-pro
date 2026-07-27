import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, lazy, Suspense } from "react";
import { ShoppingCart, TrendingUp, Zap } from "lucide-react";
import { DeliveryCard } from "@/components/DeliveryCard";
import { ZoneFilter, type ZoneFilterValue } from "@/components/ZoneFilter";
import { deliveries, formatFcfa, type Delivery } from "@/data/deliveries";

// Import dynamique (Lazy Loading) : la carte ne se charge que sur le navigateur
const DakarMap = lazy(() =>
  import("@/components/DakarMap").then((module) => ({ default: module.DakarMap }))
);

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

/**
 * Calcule le coût du carburant basé sur la distance totale
 * Formule : distance_km * (2.5 / 100) * 840
 * @param totalKm - Distance totale en km
 * @returns Coût carburant arrondi à l'entier
 */
function calculateFuelCost(totalKm: number): number {
  return Math.round(totalKm * (2.5 / 100) * 840);
}

function Tournees() {
  const [zone, setZone] = useState<ZoneFilterValue>("ALL");
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  const filtered = useMemo(
    () => (zone === "ALL" ? deliveries : deliveries.filter((d) => d.zone === zone)),
    [zone],
  );

  const handleToggleRoute = (ref: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(ref) ? prev.filter((r) => r !== ref) : [...prev, ref],
    );
  };

  const selectedDeliveries: Delivery[] = useMemo(() => {
    return deliveries.filter((d) => selectedRoutes.includes(d.ref));
  }, [selectedRoutes]);

  const caTotal = useMemo(() => {
    return selectedDeliveries.reduce((sum, d) => sum + d.priceFcfa, 0);
  }, [selectedDeliveries]);

  const totalKm = useMemo(() => {
    return selectedDeliveries.reduce((sum, d) => sum + d.distanceKm, 0);
  }, [selectedDeliveries]);

  const fuelCost = useMemo(() => {
    return calculateFuelCost(totalKm);
  }, [totalKm]);

  const netProfit = caTotal - fuelCost;

  const handleValidateTournee = () => {
    if (selectedRoutes.length === 0) return;

    const summary = `
TOURNÉE OPTIMISÉE
━━━━━━━━━━━━━━━━
Courses: ${selectedRoutes.length}
CA Total: ${formatFcfa(caTotal)}
Distance: ${totalKm.toFixed(1)} km
Carburant: ${formatFcfa(fuelCost)}
Bénéfice Net: ${formatFcfa(netProfit)}
    `.trim();

    alert(summary);
    // TODO: Intégrer API pour sauvegarder la tournée
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10 pb-32 md:pb-10">
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
        <Suspense
          fallback={
            <div className="h-[45vh] w-full lg:h-[70vh] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 animate-pulse text-muted-foreground">
              Chargement du radar logistique... 📡
            </div>
          }
        >
          <DakarMap
            interactive
            className="h-[45vh] w-full lg:h-[70vh] z-0"
            selectedDeliveries={selectedDeliveries}
          />
        </Suspense>

        <div className="flex flex-col gap-4">
          <ZoneFilter value={zone} onChange={setZone} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {filtered.map((d) => (
              <DeliveryCard
  key={d.ref}
  d={d}
/>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="glass-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Aucune offre dans cette zone pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* DASHBOARD DE RENTABILITÉ FLOTTANT */}
      {selectedRoutes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#7c3aed]/30 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 backdrop-blur-md shadow-[0_-4px_20px_rgba(124,58,237,0.3)]">
          <div className="mx-auto max-w-7xl px-4 py-4 md:px-8 md:py-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#7c3aed]/20 p-2.5">
                  <ShoppingCart className="h-5 w-5 text-[#7c3aed]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Courses</p>
                  <p className="text-lg font-bold text-white">{selectedRoutes.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#10b981]/20 p-2.5">
                  <TrendingUp className="h-5 w-5 text-[#10b981]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">CA Total</p>
                  <p className="text-lg font-bold text-[#10b981]">{formatFcfa(caTotal)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-[#f59e0b]/20 p-2.5">
                  <Zap className="h-5 w-5 text-[#f59e0b]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Carburant ({totalKm.toFixed(1)} km)
                  </p>
                  <p className="text-lg font-bold text-[#f59e0b]">{formatFcfa(fuelCost)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`rounded-lg p-2.5 ${
                    netProfit > 0 ? "bg-[#06b6d4]/20" : "bg-[#ef4444]/20"
                  }`}
                >
                  <TrendingUp
                    className={`h-5 w-5 ${
                      netProfit > 0 ? "text-[#06b6d4]" : "text-[#ef4444]"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Bénéfice Net</p>
                  <p
                    className={`text-lg font-bold ${
                      netProfit > 0 ? "text-[#06b6d4]" : "text-[#ef4444]"
                    }`}
                  >
                    {formatFcfa(netProfit)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleValidateTournee}
                className="col-span-full sm:col-span-2 lg:col-span-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] px-6 py-3 font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.5)] transition hover:shadow-[0_0_32px_rgba(124,58,237,0.7)] hover:brightness-110 active:scale-95"
              >
                🚀 Valider la tournée optimisée
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}