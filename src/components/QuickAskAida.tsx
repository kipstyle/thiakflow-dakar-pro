import { useState, useRef } from "react";
import { Send, Loader2, Bot, Mic } from "lucide-react"; // 💡 Ajout de l'icône Mic

const DIFY_URL = "https://api.dify.ai/v1/workflows/run";
const DIFY_KEY = "app-XIELnMag32uMctjuHBqW8Tev"; 

export function QuickAskAida() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 💡 Nouveaux states pour la gestion du micro
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 💡 Fonction 100% locale (Zéro token) pour la reconnaissance vocale
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Désolé, votre navigateur ne supporte pas la saisie vocale.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'fr-FR'; // Adapté pour comprendre les accents locaux
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsListening(true);
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // On ajoute le texte vocal à ce qui est potentiellement déjà écrit
      setQuery((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error("Erreur micro:", event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.start();
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);

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
          inputs: { query: value },
          response_mode: "blocking",
          user: "user-thiakflow-" + Date.now(),
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("http_" + res.status);
      const data = await res.json();
      setAnswer(data?.data?.outputs?.answer ?? "Réponse indisponible.");
    } catch (err) {
      const isAbort =
        (err instanceof DOMException && err.name === "AbortError") ||
        (err as { name?: string })?.name === "AbortError";
      if (isAbort) {
        setError("La réponse prend trop de temps — réessayez");
      } else {
        setError("Service temporairement indisponible");
      }
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <div className="glass-card mt-6 rounded-2xl p-4 md:p-5">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <h2 className="font-display text-base font-bold md:text-lg">
          Une question rapide ? 🏍️
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        {/* 💡 Modification UI : On englobe l'input pour y glisser le bouton micro */}
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={"Ex: J'ai 3 courses : Colobane→Mermoz..."}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-[#06b6d4]/50"
            disabled={loading}
          />
          <button
            type="button"
            onClick={toggleListening}
            title="Dicter à voix haute"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 transition-all duration-300 rounded-md ${
              isListening 
                ? "text-[#ef4444] bg-[#ef4444]/20 animate-pulse" // Effet néon rouge quand ça écoute
                : "text-muted-foreground hover:text-white hover:bg-white/10"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(29,78,216,0.45)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Demander à Ai-da
        </button>
      </form>

      {(loading || answer || error) && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-[#06b6d4]" />
              Ai-da réfléchit…
            </div>
          )}
          {!loading && error && (
            <p className="text-[#ef4444]">{error}</p>
          )}
          {!loading && answer && (
            <p className="whitespace-pre-wrap text-foreground/90">{answer}</p>
          )}
        </div>
      )}
    </div>
  );
}
