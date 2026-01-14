
import React, { useState } from 'react';
import { Menu, Bell, User, Search, LogOut, ChevronDown } from 'lucide-react';
import { ViewType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
  viewTitle: ViewType;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, viewTitle }) => {
  const { currentUser, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatTitle = (title: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      purchases: 'Minhas Compras',
      reports: 'Relatórios de Faturas',
      cards: 'Cartões',
      categories: 'Categorias',
      responsibles: 'Responsáveis'
    };
    return titles[title] || title;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <nav className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-slate-100 rounded-lg md:hidden"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 hidden sm:block">
          {formatTitle(viewTitle)}
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48 lg:w-64 transition-all"
          />
        </div>

        <button className="p-2 hover:bg-slate-100 rounded-full relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:bg-slate-50 rounded-lg py-1 pr-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
              {userInitial}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden lg:block max-w-[120px] truncate">
              {userName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block" />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

