import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Variables Supabase manquantes — vérifiez votre fichier .env.local (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type IncidentType =
  | 'embouteillage'
  | 'route_bloquee'
  | 'accident'
  | 'travaux'
  | 'deviation'
  | 'zone_fluide'
  | 'autre';

export type Severity = 'faible' | 'moyen' | 'eleve' | 'critique';
export type IncidentStatus = 'actif' | 'en_cours' | 'resolu';

export interface TrafficIncident {
  id: string;
  created_at: string;
  incident_type: IncidentType;
  severity: Severity;
  description: string;
  zone: string;
  author: string;
  status: IncidentStatus;
  lat: number | null;
  lng: number | null;
}