import { zoneLabels } from "@/data/deliveries";

export type ZoneFilterValue = "ALL" | "A" | "B" | "C";

interface Props {
  value: ZoneFilterValue;
  onChange: (v: ZoneFilterValue) => void;
}

export function ZoneFilter({ value, onChange }: Props) {
  const options: ZoneFilterValue[] = ["ALL", "A", "B", "C"];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              active
                ? "bg-[#7c3aed] text-white neon-violet"
                : "glass-panel text-muted-foreground hover:text-foreground"
            }`}
          >
            {zoneLabels[o]}
          </button>
        );
      })}
    </div>
  );
}
