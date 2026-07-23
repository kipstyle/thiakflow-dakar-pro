export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] font-display font-black text-white neon-violet"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      <span className="text-glow-cyan">TF</span>
    </div>
  );
}
