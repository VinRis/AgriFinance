export type LivestockType = 'dairy' | 'poultry';
export type TransactionType = 'income' | 'expense';

export interface AgriTransaction {
  id: string;
  date: string; // ISO string
  livestockType: LivestockType;
  transactionType: TransactionType;
  category: string;
  amount: number;
  description: string;
}

export interface AppSettings {
  farmName: string;
  managerName: string;
  location: string;
  currency: string;
}
