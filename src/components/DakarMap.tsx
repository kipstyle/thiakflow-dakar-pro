import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, Navigation } from 'lucide-react';
import type { Delivery } from '@/data/deliveries';

// 💡 FIX OBLIGATOIRE : Répare le bug des icônes invisibles de Leaflet sous React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface BlockedZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  reportedAt: string;
  detail: string;
}

interface DakarMapProps {
  className?: string;
  interactive?: boolean;
  selectedDeliveries?: Delivery[];
  blockedZones?: BlockedZone[];
  showDefaultVdnAlert?: boolean;
}

type RouteStep = {
  pos: [number, number];
  kind: 'pickup' | 'dropoff';
  ref: string;
  label: string;
};

// Distance à vol d'oiseau (Haversine), suffisante pour ordonner les points
function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Ajuste automatiquement le zoom/centre pour englober tous les points affichés
function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export function DakarMap({
  className = "h-full w-full",
  interactive = false,
  selectedDeliveries = [],
  blockedZones = [],
  showDefaultVdnAlert = true,
}: DakarMapProps) {
  const [livePosition, setLivePosition] = useState<[number, number] | null>(null);

  // Zone VDN historique, conservée par défaut pour compatibilité avec l'existant.
  // Désactivable via showDefaultVdnAlert={false} une fois les vraies données
  // Supabase disponibles partout, pour éviter un doublon visuel.
  const defaultVdnZone: BlockedZone = {
    id: 'default-vdn',
    name: 'Zone VDN Bloquée',
    lat: 14.7167,
    lng: -17.4677,
    radius: 1200,
    reportedAt: new Date().toISOString(),
    detail: 'Croisement VDN — signalement historique',
  };

  const allBlockedZones = showDefaultVdnAlert
    ? [defaultVdnZone, ...blockedZones]
    : blockedZones;

  // Écoute du GPS du téléphone (HTML5 Geolocation API)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLivePosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("Erreur GPS:", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 💡 Itinéraire optimisé : algorithme du plus proche voisin (nearest neighbor)
  const routeSteps = useMemo<RouteStep[]>(() => {
    if (selectedDeliveries.length === 0) return [];

    const remaining = [...selectedDeliveries];
    const steps: RouteStep[] = [];
    let currentPos: [number, number] = livePosition ?? [14.6928, -17.4467];

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;
      remaining.forEach((d, idx) => {
        const dist = distanceKm(currentPos, d.fromCoords);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = idx;
        }
      });

      const delivery = remaining.splice(nearestIdx, 1)[0];
      steps.push({ pos: delivery.fromCoords, kind: 'pickup', ref: delivery.ref, label: delivery.from });
      steps.push({ pos: delivery.toCoords, kind: 'dropoff', ref: delivery.ref, label: delivery.to });
      currentPos = delivery.toCoords;
    }

    return steps;
  }, [selectedDeliveries, livePosition]);

  const routePoints = useMemo<[number, number][]>(() => {
    const points: [number, number][] = [];
    if (livePosition) points.push(livePosition);
    routeSteps.forEach((s) => points.push(s.pos));
    return points;
  }, [routeSteps, livePosition]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 shadow-lg ${className}`}>
      <MapContainer
        center={[14.6928, -17.4467]}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap'
        />

        {/* 1. POSITION LIVE DU LIVREUR */}
        {livePosition && (
          <Marker position={livePosition}>
            <Popup>📍 Vous êtes ici (Position Live)</Popup>
          </Marker>
        )}

        {/* 2. ZONES BLOQUÉES — dynamiques (Supabase) + zone VDN par défaut */}
        {allBlockedZones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radius}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 2, dashArray: "5, 5" }}
          >
            <Popup>
              <div className="text-red-600 font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> {zone.name}
              </div>
              <div className="text-sm mt-1">{zone.detail}</div>
              <div className="text-xs text-gray-500 mt-1">
                Signalé : {new Date(zone.reportedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </Popup>
          </Circle>
        ))}

        {/* 3. TRACÉ DE L'ITINÉRAIRE OPTIMISÉ (tournées sélectionnées) */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#06b6d4',
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 10",
              lineCap: "round"
            }}
          />
        )}

        {/* 4. MARQUEURS DES ÉTAPES — vert = ramassage, violet = livraison */}
        {routeSteps.map((step, idx) => (
          <Circle
            key={`${step.ref}-${step.kind}-${idx}`}
            center={step.pos}
            radius={150}
            pathOptions={{
              color: step.kind === 'pickup' ? '#10b981' : '#7c3aed',
              fillColor: step.kind === 'pickup' ? '#10b981' : '#7c3aed',
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="font-bold">
                {idx + 1}. {step.kind === 'pickup' ? '📦 Ramassage' : '🎯 Livraison'} — {step.ref}
              </div>
              <div className="text-sm">{step.label}</div>
            </Popup>
          </Circle>
        ))}

        <FitBounds points={routePoints.length > 0 ? routePoints : (livePosition ? [livePosition] : [])} />
      </MapContainer>

      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
        <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-[#06b6d4]">
          <Navigation className="h-3 w-3 animate-pulse" /> GPS Actif
        </div>
        {allBlockedZones.length > 0 && (
          <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-[#ef4444]">
            <AlertTriangle className="h-3 w-3" /> {allBlockedZones.length} zone{allBlockedZones.length > 1 ? 's' : ''} signalée{allBlockedZones.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}