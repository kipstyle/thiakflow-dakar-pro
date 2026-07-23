import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { NetworkIndicator } from "./NetworkIndicator";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b0b14]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
          <span className="font-display text-xl font-bold tracking-tight">
            Thiak<span className="text-[#06b6d4] text-glow-cyan">Flow</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/", label: "Accueil" },
            { to: "/tournees", label: "Tournées" },
            { to: "/support", label: "Support IA" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-[#06b6d4] bg-white/5" }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <NetworkIndicator />
      </div>
    </header>
  );
}
