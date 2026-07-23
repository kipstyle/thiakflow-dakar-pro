# Plan — ThiakFlow

Plateforme statique 3 pages, dark mode glassmorphic, mobile-first. Aucun backend (données mockées en TS). Stack: TanStack Start (déjà en place) + Tailwind v4.

## Design system (src/styles.css)
- Fond `--background: #0B0B14`, surface glass `#14142B`
- `--primary: #7C3AED` (violet), `--accent: #06B6D4` (cyan néon), `--destructive: #EF4444`
- Utilitaires custom via `@utility`: `glass-card` (bg translucide + backdrop-blur + bordure violette phosphorescente), `neon-glow` (box-shadow cyan)
- Police: Space Grotesk (headings) + Inter (body) chargées via `<link>` dans `__root.tsx`
- Force `.dark` sur `<html>` par défaut

## Structure fichiers
```
src/routes/
  __root.tsx          # nav header + bottom-nav mobile + fonts + dark
  index.tsx           # Accueil (tableau de bord)
  tournees.tsx        # Split carte/liste
  support.tsx         # Chatbot IA
src/components/
  Logo.tsx            # "TF" néon
  NetworkIndicator.tsx
  StatCard.tsx
  DakarMap.tsx        # SVG stylisé presqu'île + tracés néon animés
  DeliveryCard.tsx
  ZoneFilter.tsx
  ChatBubble.tsx
  QuickReply.tsx
  BottomNav.tsx       # mobile <768px
  SiteHeader.tsx      # desktop
  SiteFooter.tsx
src/data/
  deliveries.ts       # 6 offres dakaroises
  stops.ts            # coordonnées Colobane, Sandaga, Médina, Fann, Ouakam, Almadies
```

## Page 1 — Accueil (`/`)
- Header sticky: Logo TF (cyan glow) + "ThiakFlow" + `NetworkIndicator` (pastille cyan pulsante "Réseau Dakar · Stable")
- Hero: titre XL "Doublez vos livraisons, divisez votre carburant à Dakar", sous-titre, CTA violet glow "Commencer la tournée" → `/tournees`
- Widget carte: `DakarMap` en preview (aperçu presqu'île fond sombre, tracés violet/cyan avec `stroke-dasharray` animé)
- 3 `StatCard` glass: 24 Livraisons / 85 400 FCFA / 96.8% Performance (icônes lucide, delta cyan)
- Footer: mentions + "Colobane, Dakar" + contact

## Page 2 — Tournées (`/tournees`)
- Layout desktop: grid 55/45 vertical (h-screen minus header). Mobile: stack.
- Haut: `DakarMap` interactive — SVG viewport presqu'île, 6 marqueurs (Colobane, Sandaga, Médina, Fann, Ouakam, Almadies) avec labels + halo cyan au hover, lignes polyline entre étapes actives
- Bas: barre `ZoneFilter` (Tous / Zone A / Zone B / Zone C) — state React filtrant la liste
- Grille de `DeliveryCard` (2 cols desktop, 1 col mobile): ref, trajet avec flèche, distance, tarif FCFA en gras violet, heure ramassage, badge cyan "Disponible" / rouge "En rupture"

## Page 3 — Support IA (`/support`)
- Header chat: avatar "Ai-da" (rond gradient violet→cyan) + "ThiakFlow AI Support - Agent Ai-da" + statut en ligne
- Zone messages: bulles alternées (user violet à droite, agent glass à gauche avec emoji 📦), messages seed pré-remplis
- État local `messages`: ajout au submit, réponse auto simulée ("Je vérifie…") après 800ms
- Quick replies: 3 boutons pill cyan outline sous la zone → injectent le texte
- Composer sticky bottom: textarea glass + bouton send cyan rond avec glow

## Responsive
- `useMobile` (existant) pour switcher header desktop ↔ `BottomNav` icônes (Home, Route, Bot)
- Breakpoint Tailwind `md:` (768px)
- Cartes empilent, map passe en hauteur fixe 40vh sur mobile

## Métadonnées SEO
Chaque route: `head()` unique (title, description, og:title/description, twitter:card). __root garde defaults génériques remplacés par les leaves.

## Détails techniques
- Pas de librairie carte (Mapbox exclu du prompt) → SVG custom stylisé de la presqu'île (chemin approximatif + points nommés)
- Animations: Tailwind `animate-pulse` sur indicateur réseau, `@keyframes` custom `dash` pour tracés carte
- Formatage FCFA: `Intl.NumberFormat('fr-SN')`
- Aucune donnée persistée, aucun serveur, aucun secret

## Vérifications finales
- Build passe, chaque route a son head() unique
- Contraste user bubble violet + texte blanc OK
- Mobile <768px: bottom nav visible, pas de scroll horizontal
