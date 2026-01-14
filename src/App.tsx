
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Reports from './components/Reports';
import Cards from './components/Cards';
import Categories from './components/Categories';
import Responsibles from './components/Responsibles';
import { ViewType } from './types';
import { initializeUserData } from './services/firebaseService';

// Componente principal da aplicação (após autenticação)
const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializa dados do usuário no primeiro acesso
  useEffect(() => {
    const initialize = async () => {
      if (currentUser && !isInitialized) {
        try {
          await initializeUserData(currentUser.uid);
          setIsInitialized(true);
        } catch (error) {
          console.error('Erro ao inicializar dados do usuário:', error);
        }
      }
    };
    initialize();
  }, [currentUser, isInitialized]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'purchases': return <Purchases />;
      case 'reports': return <Reports />;
      case 'cards': return <Cards />;
      case 'categories': return <Categories />;
      case 'responsibles': return <Responsibles />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} viewTitle={currentView} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

// Wrapper que decide entre Login e App baseado na autenticação
const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostra tela de login
  if (!currentUser) {
    return <Login />;
  }

  // Se está logado, mostra a aplicação
  return <MainApp />;
};

// Root component com Provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

