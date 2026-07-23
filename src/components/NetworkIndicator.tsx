export function NetworkIndicator() {
  return (
    <div className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#06b6d4] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#06b6d4] neon-cyan" />
      </span>
      <span className="text-muted-foreground">Réseau Dakar</span>
      <span className="font-semibold text-[#06b6d4]">Stable</span>
    </div>
  );
}
