import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Wallet, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { DakarMap } from "@/components/DakarMap";
import { StatCard } from "@/components/StatCard";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThiakFlow — Tableau de bord temps réel des livraisons à Dakar" },
      {
        name: "description",
        content:
          "Doublez vos livraisons et divisez votre carburant à Dakar avec ThiakFlow : IA de regroupement de colis pour livreurs moto Tiak-Tiak.",
      },
      { property: "og:title", content: "ThiakFlow — Tableau de bord temps réel" },
      {
        property: "og:description",
        content: "Plateforme IA d'optimisation des tournées Tiak-Tiak à Dakar.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-1 text-xs font-semibold text-[#06b6d4]">
              <Zap className="h-3.5 w-3.5" /> IA · Regroupement par secteur
            </span>
            <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] md:text-6xl">
              Doublez vos livraisons,{" "}
              <span className="text-[#7c3aed] text-glow-violet">divisez</span> votre
              carburant à <span className="text-[#06b6d4] text-glow-cyan">Dakar</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              ThiakFlow optimise vos tournées Tiak-Tiak en temps réel : plus de trajets à
              vide entre Colobane, Plateau et les Almadies.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/tournees"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white neon-violet transition hover:bg-[#8b4dfd]"
              >
                Commencer la tournée
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/support"
                className="glass-panel inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-foreground"
              >
                Parler à Ai-da
              </Link>
            </div>
          </div>

          <DakarMap className="aspect-[4/3] w-full" />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <StatCard icon={Package} value="24" label="Livraisons en cours" trend="+12%" />
          <StatCard icon={Wallet} value="85 400 FCFA" label="Revenus du jour" trend="+8%" />
          <StatCard icon={TrendingUp} value="96.8%" label="Performance tournée" trend="Top" />
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
