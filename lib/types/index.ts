export interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  duration_mins: number | null;
  location_id: string;
  location_name: string;
  stakes_id: string;
  stakes_label: string;
  big_blind: number | null;
  game_type: "NLH";
  buy_in: number;
  cash_out: number | null;
  profit_loss: number | null;
  notes: string | null;
  rating: "good" | "neutral" | "bad" | null;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Stakes {
  id: string;
  label: string;
  small_blind: number | null;
  big_blind: number | null;
  created_at: string;
  updated_at: string;
}

export type YAxisMode = "currency" | "bb";

export type TimeRangePreset = "all" | "last30" | "last90" | "last180" | "last365" | "custom";

export interface FilterState {
  location: string;
  stakes: string;
  timeRange: TimeRangePreset;
  customStart: string | null;
  customEnd: string | null;
}

export interface AppSettings {
  currency_symbol: "$";
  default_location_id: string | null;
  default_stakes_id: string | null;
}
