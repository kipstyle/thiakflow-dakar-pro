export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/5 bg-[#0b0b14]/60 pb-24 pt-10 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 text-sm text-muted-foreground md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-lg font-bold text-foreground">
            Thiak<span className="text-[#06b6d4]">Flow</span>
          </p>
          <p className="mt-2">Optimisation IA des tournées Tiak-Tiak à Dakar.</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Contact</p>
          <p>Colobane, Dakar — Sénégal</p>
          <p>contact@thiakflow.sn</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-foreground">Légal</p>
          <p>© {new Date().getFullYear()} ThiakFlow. Tous droits réservés.</p>
          <p>Mentions légales · CGU · Confidentialité</p>
        </div>
      </div>
    </footer>
  );
}
