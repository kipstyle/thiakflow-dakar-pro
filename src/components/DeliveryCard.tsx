import { ArrowRight, Clock, MapPin } from "lucide-react";
import { formatFcfa, type Delivery } from "@/data/deliveries";

export function DeliveryCard({ d }: { d: Delivery }) {
  const available = d.status === "Disponible";
  return (
    <article className="glass-card group relative rounded-2xl p-5 transition hover:border-[#06b6d4]/60 hover:neon-cyan">
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-xs text-muted-foreground">{d.ref}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            available
              ? "bg-[#06b6d4]/15 text-[#06b6d4] neon-cyan"
              : "bg-[#ef4444]/15 text-[#ef4444]"
          }`}
        >
          {d.status}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="truncate">{d.from}</span>
        <ArrowRight className="h-4 w-4 shrink-0 text-[#7c3aed]" />
        <span className="truncate">{d.to}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-[#06b6d4]" />
          {d.distanceKm} km
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-[#06b6d4]" />
          Ramassage {d.pickupTime}
        </span>
        <span className="rounded-full border border-[#7c3aed]/30 px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">
          Zone {d.zone}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="font-display text-2xl font-black text-[#7c3aed] text-glow-violet">
          {formatFcfa(d.priceFcfa)}
        </p>
        <button
          disabled={!available}
          className="rounded-lg bg-[#7c3aed] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#8b4dfd] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-muted-foreground"
        >
          Accepter
        </button>
      </div>
    </article>
  );
}
