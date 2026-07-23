import { Link } from "@tanstack/react-router";
import { Home, Route as RouteIcon, Bot } from "lucide-react";

const items = [
  { to: "/", label: "Accueil", Icon: Home },
  { to: "/tournees", label: "Tournées", Icon: RouteIcon },
  { to: "/support", label: "Support", Icon: Bot },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#0b0b14]/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-[#06b6d4]" }}
              className="flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 text-[11px] text-muted-foreground"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
