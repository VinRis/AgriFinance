export type LivestockType = 'dairy' | 'poultry';

export interface BaseRecord {
  id: string;
  date: string; // ISO string
  revenue: number;
  notes?: string;
}

export interface DairyRecord extends BaseRecord {
  type: 'dairy';
  milkProduction: number;
  feedConsumed: number;
}

export interface PoultryRecord extends BaseRecord {
  type: 'poultry';
  eggsCollected: number;
  mortality: number;
  feedConsumed: number;
}

export type AgriRecord = DairyRecord | PoultryRecord;

export interface AppSettings {
  farmName: string;
  managerName: string;
  location: string;
  currency: string;
}
