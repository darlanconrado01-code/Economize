// Firebase Configuration
// Inicialização do Firebase para o projeto Economize!

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurações do Firebase
// Nota: Em produção, estas credenciais são seguras pois o Firebase usa
// regras de segurança no backend para proteger os dados
const firebaseConfig = {
  apiKey: "AIzaSyBrcN49ug0K_suk_dgV1NPHHsa-c89NHM4",
  authDomain: "voznow.firebaseapp.com",
  projectId: "voznow",
  storageBucket: "voznow.firebasestorage.app",
  messagingSenderId: "406820155226",
  appId: "1:406820155226:web:8eb9d76bb0d9cb19224d63",
};

// Inicializa Firebase App
const app = initializeApp(firebaseConfig);

// Serviços Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

