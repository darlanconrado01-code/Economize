
import { Card, Purchase, Responsible, Category, CardCycle } from '../types';

const STORAGE_KEYS = {
  CARDS: 'economize_cards',
  PURCHASES: 'economize_purchases',
  RESPONSIBLES: 'economize_responsibles',
  CATEGORIES: 'economize_categories',
  CYCLES: 'economize_cycles',
};

// Seed initial data if empty
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    const initialCategories: Category[] = [
      { id: '1', name: 'Alimentação', color: 'bg-orange-500' },
      { id: '2', name: 'Transporte', color: 'bg-blue-500' },
      { id: '3', name: 'Saúde', color: 'bg-green-500' },
      { id: '4', name: 'Lazer', color: 'bg-purple-500' },
      { id: '5', name: 'Educação', color: 'bg-yellow-500' },
    ];
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(initialCategories));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.RESPONSIBLES)) {
    const initialResponsibles: Responsible[] = [
      { id: '1', name: 'Eu' },
    ];
    localStorage.setItem(STORAGE_KEYS.RESPONSIBLES, JSON.stringify(initialResponsibles));
  }
};

seedData();

export const storageService = {
  // Generic CRUD helpers
  getItems: <T,>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  
  saveItems: <T,>(key: string, items: T[]): void => {
    localStorage.setItem(key, JSON.stringify(items));
  },

  // Cards
  getCards: () => storageService.getItems<Card>(STORAGE_KEYS.CARDS),
  addCard: (card: Omit<Card, 'id'>) => {
    const cards = storageService.getCards();
    const newCard = { ...card, id: Math.random().toString(36).substr(2, 9) };
    storageService.saveItems(STORAGE_KEYS.CARDS, [...cards, newCard]);
    return newCard;
  },
  deleteCard: (id: string) => {
    const cards = storageService.getCards().filter(c => c.id !== id);
    storageService.saveItems(STORAGE_KEYS.CARDS, cards);
  },

  // Purchases
  getPurchases: () => storageService.getItems<Purchase>(STORAGE_KEYS.PURCHASES),
  addPurchase: (purchase: Omit<Purchase, 'id'>) => {
    const purchases = storageService.getPurchases();
    const newPurchase = { ...purchase, id: Math.random().toString(36).substr(2, 9) };
    storageService.saveItems(STORAGE_KEYS.PURCHASES, [...purchases, newPurchase]);
    return newPurchase;
  },
  addPurchasesBatch: (newPurchases: Omit<Purchase, 'id'>[]) => {
    const purchases = storageService.getPurchases();
    const mapped = newPurchases.map(p => ({ ...p, id: Math.random().toString(36).substr(2, 9) }));
    storageService.saveItems(STORAGE_KEYS.PURCHASES, [...purchases, ...mapped]);
  },
  updatePurchase: (id: string, data: Partial<Purchase>) => {
    const purchases = storageService.getPurchases().map(p => p.id === id ? { ...p, ...data } : p);
    storageService.saveItems(STORAGE_KEYS.PURCHASES, purchases);
  },
  deletePurchase: (id: string) => {
    const purchases = storageService.getPurchases().filter(p => p.id !== id);
    storageService.saveItems(STORAGE_KEYS.PURCHASES, purchases);
  },
  deletePurchasesBatch: (ids: string[]) => {
    const purchases = storageService.getPurchases().filter(p => !ids.includes(p.id));
    storageService.saveItems(STORAGE_KEYS.PURCHASES, purchases);
  },

  // Categories
  getCategories: () => storageService.getItems<Category>(STORAGE_KEYS.CATEGORIES),
  addCategory: (cat: Omit<Category, 'id'>) => {
    const categories = storageService.getCategories();
    const newCat = { ...cat, id: Math.random().toString(36).substr(2, 9) };
    storageService.saveItems(STORAGE_KEYS.CATEGORIES, [...categories, newCat]);
    return newCat;
  },

  // Responsibles
  getResponsibles: () => storageService.getItems<Responsible>(STORAGE_KEYS.RESPONSIBLES),
  addResponsible: (res: Omit<Responsible, 'id'>) => {
    const responsibles = storageService.getResponsibles();
    const newRes = { ...res, id: Math.random().toString(36).substr(2, 9) };
    storageService.saveItems(STORAGE_KEYS.RESPONSIBLES, [...responsibles, newRes]);
    return newRes;
  },

  // Cycles
  getCycles: () => storageService.getItems<CardCycle>(STORAGE_KEYS.CYCLES),
  saveCycle: (cycle: CardCycle) => {
    const cycles = storageService.getCycles().filter(c => c.id !== cycle.id);
    storageService.saveItems(STORAGE_KEYS.CYCLES, [...cycles, cycle]);
  }
};
