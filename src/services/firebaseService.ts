// Firebase Service
// Serviço para operações CRUD no Firestore para o Economize!

import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Card, Purchase, Responsible, Category, CardCycle } from '../types';

// Coleções do Firestore
const COLLECTIONS = {
    CARDS: 'cards',
    PURCHASES: 'purchases',
    RESPONSIBLES: 'responsibles',
    CATEGORIES: 'categories',
    CYCLES: 'cycles',
};

// Helpers
const getUserCollection = (userId: string, collectionName: string) =>
    collection(db, 'users', userId, collectionName);

// ==================== CARDS ====================

export const getCards = async (userId: string): Promise<Card[]> => {
    const q = query(getUserCollection(userId, COLLECTIONS.CARDS));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Card));
};

export const addCard = async (userId: string, card: Omit<Card, 'id' | 'userId'>): Promise<Card> => {
    const docRef = await addDoc(getUserCollection(userId, COLLECTIONS.CARDS), {
        ...card,
        userId,
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, userId, ...card };
};

export const updateCard = async (userId: string, cardId: string, data: Partial<Card>): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.CARDS, cardId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deleteCard = async (userId: string, cardId: string): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.CARDS, cardId);
    await deleteDoc(docRef);
};

// ==================== PURCHASES ====================

export const getPurchases = async (userId: string): Promise<Purchase[]> => {
    const q = query(
        getUserCollection(userId, COLLECTIONS.PURCHASES),
        orderBy('purchaseDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Purchase));
};

export const addPurchase = async (userId: string, purchase: Omit<Purchase, 'id' | 'userId'>): Promise<Purchase> => {
    const docRef = await addDoc(getUserCollection(userId, COLLECTIONS.PURCHASES), {
        ...purchase,
        userId,
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, userId, ...purchase };
};

export const addPurchasesBatch = async (userId: string, purchases: Omit<Purchase, 'id' | 'userId'>[]): Promise<void> => {
    const batch = writeBatch(db);
    const colRef = getUserCollection(userId, COLLECTIONS.PURCHASES);

    purchases.forEach((purchase) => {
        const newDocRef = doc(colRef);
        batch.set(newDocRef, {
            ...purchase,
            userId,
            createdAt: serverTimestamp(),
        });
    });

    await batch.commit();
};

export const updatePurchase = async (userId: string, purchaseId: string, data: Partial<Purchase>): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.PURCHASES, purchaseId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
};

export const deletePurchase = async (userId: string, purchaseId: string): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.PURCHASES, purchaseId);
    await deleteDoc(docRef);
};

export const deletePurchasesBatch = async (userId: string, ids: string[]): Promise<void> => {
    const batch = writeBatch(db);
    ids.forEach((id) => {
        const docRef = doc(db, 'users', userId, COLLECTIONS.PURCHASES, id);
        batch.delete(docRef);
    });
    await batch.commit();
};

// ==================== CATEGORIES ====================

export const getCategories = async (userId: string): Promise<Category[]> => {
    const q = query(getUserCollection(userId, COLLECTIONS.CATEGORIES));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
};

export const addCategory = async (userId: string, category: Omit<Category, 'id'>): Promise<Category> => {
    const docRef = await addDoc(getUserCollection(userId, COLLECTIONS.CATEGORIES), {
        ...category,
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...category };
};

export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.CATEGORIES, categoryId);
    await deleteDoc(docRef);
};

// Inicializa categorias padrão para usuário novo
export const initializeDefaultCategories = async (userId: string): Promise<void> => {
    const existing = await getCategories(userId);
    if (existing.length > 0) return;

    const defaultCategories = [
        { name: 'Alimentação', color: 'bg-orange-500' },
        { name: 'Transporte', color: 'bg-blue-500' },
        { name: 'Saúde', color: 'bg-green-500' },
        { name: 'Lazer', color: 'bg-purple-500' },
        { name: 'Educação', color: 'bg-yellow-500' },
    ];

    const batch = writeBatch(db);
    const colRef = getUserCollection(userId, COLLECTIONS.CATEGORIES);

    defaultCategories.forEach((cat) => {
        const newDocRef = doc(colRef);
        batch.set(newDocRef, { ...cat, createdAt: serverTimestamp() });
    });

    await batch.commit();
};

// ==================== RESPONSIBLES ====================

export const getResponsibles = async (userId: string): Promise<Responsible[]> => {
    const q = query(getUserCollection(userId, COLLECTIONS.RESPONSIBLES));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Responsible));
};

export const addResponsible = async (userId: string, responsible: Omit<Responsible, 'id'>): Promise<Responsible> => {
    const docRef = await addDoc(getUserCollection(userId, COLLECTIONS.RESPONSIBLES), {
        ...responsible,
        createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...responsible };
};

export const deleteResponsible = async (userId: string, responsibleId: string): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.RESPONSIBLES, responsibleId);
    await deleteDoc(docRef);
};

// Inicializa responsável padrão para usuário novo
export const initializeDefaultResponsibles = async (userId: string): Promise<void> => {
    const existing = await getResponsibles(userId);
    if (existing.length > 0) return;

    await addResponsible(userId, { name: 'Eu' });
};

// ==================== CYCLES ====================

export const getCycles = async (userId: string): Promise<CardCycle[]> => {
    const q = query(getUserCollection(userId, COLLECTIONS.CYCLES));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CardCycle));
};

export const saveCycle = async (userId: string, cycle: CardCycle): Promise<void> => {
    const docRef = doc(db, 'users', userId, COLLECTIONS.CYCLES, cycle.id);
    await updateDoc(docRef, { ...cycle, updatedAt: serverTimestamp() }).catch(async () => {
        // Se não existir, cria
        await addDoc(getUserCollection(userId, COLLECTIONS.CYCLES), {
            ...cycle,
            createdAt: serverTimestamp(),
        });
    });
};

// ==================== INICIALIZAÇÃO ====================

export const initializeUserData = async (userId: string): Promise<void> => {
    await Promise.all([
        initializeDefaultCategories(userId),
        initializeDefaultResponsibles(userId),
    ]);
};

// Export objeto compatível com estrutura anterior
export const firebaseService = {
    getCards,
    addCard,
    updateCard,
    deleteCard,
    getPurchases,
    addPurchase,
    addPurchasesBatch,
    updatePurchase,
    deletePurchase,
    deletePurchasesBatch,
    getCategories,
    addCategory,
    deleteCategory,
    getResponsibles,
    addResponsible,
    deleteResponsible,
    getCycles,
    saveCycle,
    initializeUserData,
};
