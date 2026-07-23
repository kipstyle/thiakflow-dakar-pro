import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  value: string;
  label: string;
  trend?: string;
}

export function StatCard({ icon: Icon, value, label, trend }: Props) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#7c3aed]/20 text-[#06b6d4]">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full bg-[#06b6d4]/15 px-2 py-0.5 text-xs font-semibold text-[#06b6d4]">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-black text-foreground md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
