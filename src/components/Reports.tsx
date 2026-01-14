
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { ChevronRight, ChevronDown, Calendar, CreditCard, Filter } from 'lucide-react';

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const purchases = storageService.getPurchases();
  const cards = storageService.getCards();
  const cycles = storageService.getCycles();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const reportData = useMemo(() => {
    // Basic logic: filter purchases that happen within the billing cycle
    // In a production app, we would calculate installments correctly across months.
    // For this prototype, we'll show purchases of the selected month.
    
    return cards.map(card => {
      const cardPurchases = purchases.filter(p => {
        const d = new Date(p.purchaseDate);
        return p.cardId === card.id && d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });
      
      const total = cardPurchases.reduce((sum, p) => sum + p.amount, 0);
      
      return {
        card,
        purchases: cardPurchases,
        total
      };
    }).filter(group => group.purchases.length > 0);
  }, [purchases, cards, selectedMonth, selectedYear]);

  const toggleExpand = (id: string) => {
    if (expandedCards.includes(id)) setExpandedCards(expandedCards.filter(i => i !== id));
    else setExpandedCards([...expandedCards, id]);
  };

  const grandTotal = reportData.reduce((acc, g) => acc + g.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Faturas Mensais</h2>
        <div className="flex gap-2 bg-white p-1 border border-slate-200 rounded-xl">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 bg-transparent focus:outline-none font-medium text-slate-700"
          >
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 bg-transparent focus:outline-none font-medium text-slate-700 border-l border-slate-200"
          >
            {[2023, 2024, 2025].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-emerald-600 rounded-2xl p-8 text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl shadow-emerald-100">
        <div>
          <p className="text-emerald-100 font-medium">Total de todas as faturas em {months[selectedMonth]} {selectedYear}</p>
          <h3 className="text-4xl font-bold mt-1">R$ {grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="mt-4 md:mt-0 px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl flex items-center gap-3">
          <Calendar className="w-6 h-6" />
          <div className="text-sm">
            <p className="font-bold">{reportData.length} Cartões ativos</p>
            <p className="opacity-80">com faturas abertas</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reportData.map((group) => {
          const isExpanded = expandedCards.includes(group.card.id);
          return (
            <div key={group.card.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                onClick={() => toggleExpand(group.card.id)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${group.card.color || 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{group.card.name}</h4>
                    <p className="text-sm text-slate-500">Final •••• {group.card.lastFourDigits}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor da Fatura</p>
                    <p className="text-xl font-bold text-slate-800">R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-6 h-6 text-slate-400" /> : <ChevronRight className="w-6 h-6 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-300">
                  <div className="border-t border-slate-100 pt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-slate-400 font-semibold">
                          <th className="py-2">Data</th>
                          <th className="py-2">Item</th>
                          <th className="py-2">Categoria</th>
                          <th className="py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {group.purchases.map(p => (
                          <tr key={p.id}>
                            <td className="py-3 text-slate-500">{new Date(p.purchaseDate).toLocaleDateString('pt-BR')}</td>
                            <td className="py-3 font-medium text-slate-800">{p.item}</td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">{p.category || 'Outros'}</span>
                            </td>
                            <td className="py-3 text-right font-bold text-slate-900">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="text-sm text-emerald-600 font-bold flex items-center gap-2 hover:underline">
                      <Filter className="w-4 h-4" /> Personalizar Ciclo
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {reportData.length === 0 && (
          <div className="py-20 bg-white rounded-2xl border border-slate-200 text-center flex flex-col items-center gap-3">
            <Calendar className="w-12 h-12 text-slate-200" />
            <p className="text-slate-500 font-medium">Nenhum gasto registrado para este período.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
