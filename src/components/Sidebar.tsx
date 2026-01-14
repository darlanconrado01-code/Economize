
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FilePieChart, 
  CreditCard, 
  Tag, 
  Users, 
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isOpen, onToggle }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchases', label: 'Compras', icon: ShoppingBag },
    { id: 'reports', label: 'Relatórios', icon: FilePieChart },
    { id: 'cards', label: 'Cartões', icon: CreditCard },
    { id: 'categories', label: 'Categorias', icon: Tag },
    { id: 'responsibles', label: 'Responsáveis', icon: Users },
  ];

  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 relative flex flex-col h-full`}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        {isOpen && <span className="font-bold text-white text-xl tracking-tight">Economize!</span>}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as ViewType)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-emerald-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'}
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 hover:bg-slate-800 rounded-lg"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
