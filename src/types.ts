
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Card {
  id: string;
  userId: string;
  name: string;
  lastFourDigits: string;
  paymentDay: number;
  color: string;
}

export interface Purchase {
  id: string;
  userId: string;
  cardId: string;
  item: string;
  amount: number;
  purchaseDate: string; // ISO string
  installments: number;
  currentInstallment: number;
  responsibleId?: string;
  category?: string;
  notes?: string;
}

export interface Responsible {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CardCycle {
  id: string; // cardId-YYYY-MM
  cardId: string;
  year: number;
  month: number;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export type ViewType = 'dashboard' | 'purchases' | 'reports' | 'cards' | 'categories' | 'responsibles';
