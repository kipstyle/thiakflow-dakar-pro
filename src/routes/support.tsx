import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Bot, AlertTriangle, Package, Headphones } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support IA Ai-da — ThiakFlow" },
      {
        name: "description",
        content:
          "Chat en direct avec Ai-da, l'assistant IA ThiakFlow : suivez vos colis, signalez un embouteillage à Dakar ou parlez à un agent.",
      },
      { property: "og:title", content: "Support IA Ai-da — ThiakFlow" },
      {
        property: "og:description",
        content: "Assistant IA de ThiakFlow pour livreurs Tiak-Tiak à Dakar.",
      },
    ],
  }),
  component: Support,
});

type Msg = { id: number; role: "user" | "agent"; text: string };

const SEED: Msg[] = [
  { id: 1, role: "user", text: "Où est le colis #TF12345 ?" },
  {
    id: 2,
    role: "agent",
    text: "Vérification… Il est au centre de tri de Colobane. Arrivée estimée : 14h00. 📦",
  },
];

const REPLIES: Record<string, string> = {
  "Suivre une commande":
    "Bien reçu 🚀 Donnez-moi la référence du colis (ex : #TF-D101) et je le localise en temps réel.",
  "Signaler un embouteillage":
    "Merci pour l'info 🛵 Où êtes-vous bloqué ? Je vais recalculer les tournées voisines via VDN.",
  "Parler à un agent":
    "Je transfère votre demande à un agent ThiakFlow basé à Colobane. Temps d'attente estimé : 2 min. 📞",
};

function autoReply(text: string): string {
  const key = Object.keys(REPLIES).find((k) => text.startsWith(k));
  if (key) return REPLIES[key];
  if (/#TF/i.test(text))
    return "Je localise ce colis… Il est actuellement en transit vers Plateau. Livraison prévue dans 22 min. 📦";
  return "Bien noté. Je transmets à l'équipe ThiakFlow pour un suivi personnalisé. ⚡";
}

function Support() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text: value };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "agent", text: autoReply(value) },
      ]);
    }, 700);
  }

  const quick = [
    { label: "Suivre une commande", Icon: Package },
    { label: "Signaler un embouteillage", Icon: AlertTriangle },
    { label: "Parler à un agent", Icon: Headphones },
  ];

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 md:px-8 md:py-10">
      <div className="glass-card flex items-center gap-3 rounded-2xl p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] neon-violet">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold md:text-base">
            ThiakFlow AI Support · Agent <span className="text-[#06b6d4]">Ai-da</span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[#06b6d4] neon-cyan" />
            En ligne · Répond en quelques secondes
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="glass-panel flex h-[52vh] flex-col gap-3 overflow-y-auto rounded-2xl p-4 md:h-[58vh]"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-[#7c3aed] px-4 py-2.5 text-sm text-white neon-violet"
                  : "glass-card max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-foreground"
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {quick.map(({ label, Icon }) => (
          <button
            key={label}
            onClick={() => send(label)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#06b6d4]/40 bg-[#06b6d4]/5 px-3 py-1.5 text-xs font-semibold text-[#06b6d4] transition hover:bg-[#06b6d4]/15"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="glass-card flex items-center gap-2 rounded-2xl p-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez à Ai-da…"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#06b6d4] text-[#041014] neon-cyan transition hover:brightness-110"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
