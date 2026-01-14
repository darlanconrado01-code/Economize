
import React, { useMemo } from 'react';
import { storageService } from '../services/storageService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, CreditCard, ShoppingBag, Users } from 'lucide-react';

const Dashboard: React.FC = () => {
  const purchases = storageService.getPurchases();
  const cards = storageService.getCards();
  const categories = storageService.getCategories();
  const responsibles = storageService.getResponsibles();

  const totalSpent = useMemo(() => 
    purchases.reduce((acc, p) => acc + p.amount, 0), 
  [purchases]);

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    purchases.forEach(p => {
      const cat = p.category || 'Sem Categoria';
      counts[cat] = (counts[cat] || 0) + p.amount;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [purchases]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const stats = [
    { label: 'Total Gasto', value: `R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Compras', value: purchases.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Cartões', value: cards.length, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Responsáveis', value: responsibles.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-slate-500">Acompanhe seus gastos e saúde financeira.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Gastos por Categoria</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {categoryData.slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">R$ {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Compras Recentes</h3>
            <button className="text-sm text-emerald-600 font-medium hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 px-2">Data</th>
                  <th className="pb-3 px-2">Item</th>
                  <th className="pb-3 px-2">Categoria</th>
                  <th className="pb-3 px-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {purchases.slice(-5).reverse().map((purchase) => (
                  <tr key={purchase.id} className="text-sm">
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-2 font-medium text-slate-800">{purchase.item}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                        {purchase.category || 'Outros'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-900">
                      R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 italic">Nenhuma compra cadastrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
