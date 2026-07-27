import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TrafficCone, Loader2, Send, MapPin, AlertTriangle } from "lucide-react";
import { DakarMap } from "@/components/DakarMap";
import { supabase, type TrafficIncident, type IncidentType, type Severity } from "@/lib/supabase";

const DIFY_URL = "https://api.dify.ai/v1/workflows/run";
const DIFY_KEY = "VOTRE_CLE_ICI";

const ZONE_COORDS: Record<string, [number, number]> = {
  "VDN": [14.7167, -17.4677],
  "Colobane": [14.708, -17.443],
  "Corniche": [14.682, -17.489],
  "Sandaga": [14.668, -17.433],
  "Médina": [14.682, -17.447],
  "Almadies": [14.743, -17.518],
};

const incidentLabels: Record<IncidentType, string> = {
  embouteillage: "🚗 Embouteillage",
  route_bloquee: "🚧 Route bloquée",
  accident: "⚠️ Accident",
  travaux: "🔧 Travaux",
  deviation: "↪️ Déviation",
  zone_fluide: "✅ Zone fluide",
  autre: "ℹ️ Autre",
};

const severityColor: Record<Severity, string> = {
  faible: "#10b981",
  moyen: "#f59e0b",
  eleve: "#ef4444",
  critique: "#dc2626",
};

export const Route = createFileRoute("/saisie-trafic")({
  head: () => ({
    meta: [
      { title: "Saisie Trafic & Terrain — ThiakFlow Dakar" },
      {
        name: "description",
        content:
          "Coxeur : signalez le trafic et les incidents de terrain à Dakar pour recalculer les feuilles de route sécurisées des livreurs Tiak-Tiak.",
      },
      { property: "og:title", content: "Saisie Trafic & Terrain — ThiakFlow Dakar" },
      {
        property: "og:description",
        content:
          "Données terrain en temps réel pour optimiser les tournées Tiak-Tiak à Dakar.",
      },
    ],
  }),
  component: SaisieTrafic,
});

function SaisieTrafic() {
  const [terrain, setTerrain] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [incidents, setIncidents] = useState<TrafficIncident[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Chargement initial + écoute temps réel des incidents actifs
  useEffect(() => {
    async function loadIncidents() {
      const { data, error: fetchError } = await supabase
        .from("traffic_incidents")
        .select("*")
        .neq("status", "resolu")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.warn("Erreur chargement incidents:", fetchError);
        return;
      }
      setIncidents(data ?? []);
    }

    loadIncidents();

    const channel = supabase
      .channel("traffic_incidents_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "traffic_incidents" },
        () => {
          loadIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Détecte le type/zone/gravité approximatifs à partir du texte saisi
  function parseIncidentFromText(text: string): {
    incident_type: IncidentType;
    severity: Severity;
    zone: string;
  } {
    const lower = text.toLowerCase();
    let incident_type: IncidentType = "autre";
    if (lower.includes("bloqu")) incident_type = "route_bloquee";
    else if (lower.includes("embouteillage") || lower.includes("ralenti")) incident_type = "embouteillage";
    else if (lower.includes("accident")) incident_type = "accident";
    else if (lower.includes("travaux")) incident_type = "travaux";
    else if (lower.includes("déviation") || lower.includes("deviation")) incident_type = "deviation";
    else if (lower.includes("fluide")) incident_type = "zone_fluide";

    let severity: Severity = "moyen";
    if (lower.includes("total") || lower.includes("critique") || incident_type === "accident") severity = "critique";
    else if (incident_type === "zone_fluide") severity = "faible";
    else if (lower.includes("lourd") || lower.includes("important")) severity = "eleve";

    const zoneMatch = Object.keys(ZONE_COORDS).find((z) => lower.includes(z.toLowerCase()));
    const zone = zoneMatch ?? "Non précisée";

    return { incident_type, severity, zone };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    const t = terrain.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Enregistrement de l'incident en base si des données terrain ont été saisies
    if (t) {
      const parsed = parseIncidentFromText(t);
      const coords = ZONE_COORDS[parsed.zone];
      const { error: insertError } = await supabase.from("traffic_incidents").insert({
        incident_type: parsed.incident_type,
        severity: parsed.severity,
        description: t,
        zone: parsed.zone,
        author: "coxeur-colobane",
        status: "actif",
        lat: coords?.[0] ?? null,
        lng: coords?.[1] ?? null,
      });
      if (insertError) {
        console.warn("Erreur enregistrement incident:", insertError);
      }
    }

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
          user: "coxeur-terrain",
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("http_" + res.status);
      const data = await res.json();
      const text =
        data?.data?.outputs?.answer ??
        data?.data?.outputs?.text ??
        data?.outputs?.answer ??
        data?.outputs?.text ??
        "Réponse indisponible.";
      setResult(text);
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err as { name?: string })?.name === "AbortError";
      setError(isAbort ? "La réponse prend trop de temps — réessayez" : "❌ Erreur serveur — réessayer");
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  const blockedZonesForMap = incidents
    .filter((i) => i.lat !== null && i.lng !== null && i.incident_type !== "zone_fluide")
    .map((i) => ({
      id: i.id,
      name: `${incidentLabels[i.incident_type]} — ${i.zone}`,
      lat: i.lat as number,
      lng: i.lng as number,
      radius: i.severity === "critique" ? 800 : i.severity === "eleve" ? 500 : 300,
      reportedAt: i.created_at,
      detail: i.description,
    }));

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <div className="text-center md:text-left">
        <h1 className="font-display text-3xl font-black text-[#7c3aed] text-glow-violet md:text-4xl">
          🚦 Saisie Trafic & Terrain
        </h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Coordonnateur de Zone (Coxeur) — Données en temps réel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 md:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="terrain" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrafficCone className="h-4 w-4 text-[#06b6d4]" />
              Données de trafic ou incidents observés
            </label>
            <textarea
              id="terrain"
              value={terrain}
              onChange={(e) => setTerrain(e.target.value)}
              rows={6}
              placeholder="Ex: Axe VDN 10/06 08h30 — Embouteillage total au croisement. Déviation Corniche conseillée."
              className="resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#7c3aed]/50 focus:ring-1 focus:ring-[#7c3aed]/30"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="query" className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-[#06b6d4]" />
              Requête du livreur Tiak-Tiak
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
            {loading ? "⏳ Analyse logistique et trafic en cours..." : "🚦 Générer la feuille de route sécurisée"}
          </button>
        </div>
      </form>

      {/* LISTE DES INCIDENTS ACTIFS — temps réel */}
      <section className="glass-card rounded-2xl p-5 md:p-6">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-foreground md:text-lg">
          <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
          Incidents actifs ({incidents.length})
        </h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun incident signalé pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    {incidentLabels[incident.incident_type]} — {incident.zone}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(incident.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {incident.description}
                  </span>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold text-white"
                  style={{ backgroundColor: severityColor[incident.severity] }}
                >
                  {incident.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {mounted && (
        <section>
          <h2 className="mb-2 font-display text-base font-bold text-foreground md:text-lg">
            🗺️ Zones signalées
          </h2>
          <DakarMap
  className="h-[350px] w-full"
  blockedZones={blockedZonesForMap}
  showDefaultVdnAlert={false}
/>
        </section>
      )}

      {(loading || result || error) && (
        <div className="glass-card rounded-2xl p-5 md:p-6">
          {loading && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-[#06b6d4]" />
              <span className="text-sm font-medium">⏳ Analyse logistique et trafic en cours...</span>
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