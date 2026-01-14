// Contexto de Autenticação React
// Gerencia estado de autenticação global para o Economize!

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider, db } from '../services/firebaseConfig';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Tipos
interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

// Contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Hook personalizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

// Provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cria documento do usuário no Firestore se não existir
    const createUserDocument = async (user: User, displayName?: string) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                email: user.email,
                name: displayName || user.displayName || 'Usuário',
                createdAt: serverTimestamp(),
            });
        }
    };

    // Login com email/senha
    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    // Registro com email/senha
    const register = async (email: string, password: string, name: string) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await createUserDocument(result.user, name);
    };

    // Login com Google
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserDocument(result.user);
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
    };

    // Observer de estado de autenticação com timeout
    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setCurrentUser(user);
                setLoading(false);
            }, (err) => {
                console.error('Erro de autenticação:', err);
                setError(err.message);
                setLoading(false);
            });

            // Timeout de segurança - se não carregar em 10s, mostra erro
            const timeout = setTimeout(() => {
                if (loading) {
                    setError('Timeout ao conectar com Firebase. Verifique as configurações.');
                    setLoading(false);
                }
            }, 10000);

            return () => {
                unsubscribe();
                clearTimeout(timeout);
            };
        } catch (err: any) {
            console.error('Erro ao inicializar Firebase:', err);
            setError(err.message || 'Erro ao inicializar Firebase');
            setLoading(false);
        }
    }, []);

    const value: AuthContextType = {
        currentUser,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
    };

    // Mostra erro se houver
    if (error) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
                    <h2 className="text-red-600 font-bold text-xl mb-2">Erro de Configuração</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">Verifique se as variáveis de ambiente do Firebase estão configuradas corretamente.</p>
                </div>
            </div>
        );
    }

    // Mostra loading enquanto carrega
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-medium">Conectando...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
