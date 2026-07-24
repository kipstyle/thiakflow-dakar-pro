import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TrafficCone, Loader2, Send, MapPin } from "lucide-react";

const DIFY_URL = "https://api.dify.ai/v1/workflows/run";
const DIFY_KEY = "app-wgqk0lGkRsaZDOTSaahdvlDH";

export const Route = createFileRoute("/saisie-terrain")({
  head: () => ({
    meta: [
      { title: "Saisie Terrain — ThiakFlow Dakar" },
      {
        name: "description",
        content:
          "Coxeur logistique : saisissez les données de trafic et d'accessibilité à Dakar pour générer des feuilles de route optimisées pour les livreurs Tiak-Tiak.",
      },
      { property: "og:title", content: "Saisie Terrain — ThiakFlow Dakar" },
      {
        property: "og:description",
        content:
          "Données terrain en temps réel pour optimiser les tournées Tiak-Tiak à Dakar.",
      },
    ],
  }),
  component: SaisieTerrain,
});

function SaisieTerrain() {
  const [terrain, setTerrain] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    const t = terrain.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout"), 10000);

    try {
      const res = await fetch(DIFY_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DIFY_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: { query: q, donnees_terrain: t },
          response_mode: "blocking",
          user: "agent-terrain-thiakflow",
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("http_" + res.status);
      const data = await res.json();
      const text =
        data?.data?.outputs?.text ?? data?.outputs?.text ?? "Réponse indisponible.";
      setResult(text);
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err as { name?: string })?.name === "AbortError";
      setError(isAbort ? "La réponse prend trop de temps — réessayez" : "❌ Erreur — réessayer");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="text-center md:text-left">
        <h1 className="font-display text-3xl font-black text-[#7c3aed] text-glow-violet md:text-4xl">
          🚦 Saisie Terrain
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Coxeur Logistique — Données en temps réel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 md:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="terrain" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrafficCone className="h-4 w-4 text-[#06b6d4]" />
              Données de trafic ou d'accessibilité
            </label>
            <textarea
              id="terrain"
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              rows={6}
              placeholder="Ex: Axe VDN 10/06 08h30 — Embouteillage total au croisement. Déviation Corniche conseillée. Source: Coxeur Colobane."
              className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="query" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-[#06b6d4]" />
              Votre question
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Quel est le meilleur trajet pour Colobane -> Almadies ?"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7c3aed] px-5 py-3 font-semibold text-white shadow-[0_0_24px_rgba(124,58,237,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {loading ? "⏳ Génération en cours..." : "🏍️ Générer la feuille de route"}
          </button>
        </div>
      </form>

      {(loading || result || error) && (
        <div className="glass-card rounded-2xl p-5 md:p-6">
          {loading && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-[#06b6d4]" />
              <span className="text-sm font-medium">⏳ Génération en cours...</span>
            </div>
          )}

          {!loading && error && (
            <p className="text-sm font-medium text-[#ef4444]">{error}</p>
          )}

          {!loading && result && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#06b6d4]">
                Feuille de route générée
              </p>
              <div
                className="text-sm leading-relaxed text-foreground/90"
                style={{ whiteSpace: "pre-line" }}
              >
                {result}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
