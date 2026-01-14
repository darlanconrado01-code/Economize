
import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Purchase, Card, Category, Responsible } from '../types';
// Fixed: Added ShoppingBag to the lucide-react imports to resolve the "Cannot find name" error.
import { Plus, Filter, Trash2, Edit2, Upload, Search, AlertCircle, ShoppingBag } from 'lucide-react';

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form States
  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newInstallments, setNewInstallments] = useState('1');
  const [newCardId, setNewCardId] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newResponsibleId, setNewResponsibleId] = useState('');
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState('');

  // Bulk States
  const [bulkText, setBulkText] = useState('');
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [tempPurchases, setTempPurchases] = useState<any[]>([]);

  // Filter States
  const [filterText, setFilterText] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPurchases(storageService.getPurchases());
    setCards(storageService.getCards());
    setCategories(storageService.getCategories());
    setResponsibles(storageService.getResponsibles());
  };

  const handleDescriptionBlur = async () => {
    if (!newItem || aiSuggestedCategory) return;
    const catNames = categories.map(c => c.name);
    const suggestion = await geminiService.categorizePurchase(newItem, catNames);
    setAiSuggestedCategory(suggestion);
  };

  const handleAddPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem || !newAmount || !newCardId) return;

    // Duplicate detection
    const isDuplicate = purchases.find(p => 
      p.amount === parseFloat(newAmount) && 
      p.purchaseDate === newDate && 
      p.item.toLowerCase() === newItem.toLowerCase()
    );

    if (isDuplicate && !confirm('Já existe uma compra com este valor, data e nome. Deseja continuar?')) {
      return;
    }

    storageService.addPurchase({
      userId: 'user1',
      cardId: newCardId,
      item: newItem,
      amount: parseFloat(newAmount),
      purchaseDate: newDate,
      installments: parseInt(newInstallments),
      currentInstallment: 1,
      category: newCategory || aiSuggestedCategory,
      responsibleId: newResponsibleId
    });

    setIsAddOpen(false);
    resetForm();
    loadData();
  };

  const handleBulkProcess = async () => {
    if (!bulkText) return;
    setIsProcessing(true);
    try {
      const extracted = await geminiService.parseBulkPurchases(bulkText, bulkYear);
      setTempPurchases(extracted);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBulk = () => {
    const toSave = tempPurchases.map(p => ({
      userId: 'user1',
      cardId: newCardId || (cards[0]?.id),
      item: p.item,
      amount: p.amount,
      purchaseDate: p.purchaseDate,
      installments: p.installments,
      currentInstallment: 1,
      responsibleId: newResponsibleId || (responsibles[0]?.id),
      category: 'Outros'
    }));

    storageService.addPurchasesBatch(toSave);
    setIsBulkOpen(false);
    setTempPurchases([]);
    loadData();
  };

  const handleDeleteSelected = () => {
    if (confirm(`Excluir ${selectedIds.length} compras?`)) {
      storageService.deletePurchasesBatch(selectedIds);
      setSelectedIds([]);
      loadData();
    }
  };

  const resetForm = () => {
    setNewItem('');
    setNewAmount('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewInstallments('1');
    setNewCategory('');
    setAiSuggestedCategory('');
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.item.toLowerCase().includes(filterText.toLowerCase()) ||
      p.category?.toLowerCase().includes(filterText.toLowerCase())
    ).reverse();
  }, [purchases, filterText]);

  const totalFiltered = filteredPurchases.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Minhas Compras</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsBulkOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
          >
            <Upload className="w-4 h-4" /> Importar Fatura
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-sm shadow-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Compra
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filtrar compras..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Excluir ({selectedIds.length})
            </button>
          )}
          <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium border border-slate-200">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-4 px-4">
                  <input 
                    type="checkbox" 
                    onChange={(e) => setSelectedIds(e.target.checked ? filteredPurchases.map(p => p.id) : [])}
                    checked={selectedIds.length > 0 && selectedIds.length === filteredPurchases.length}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-4 px-4">Data</th>
                <th className="py-4 px-4">Item</th>
                <th className="py-4 px-4">Cartão</th>
                <th className="py-4 px-4">Categoria</th>
                <th className="py-4 px-4">Parcelas</th>
                <th className="py-4 px-4 text-right">Valor</th>
                <th className="py-4 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-4">
                    <input 
                      type="checkbox"
                      checked={selectedIds.includes(purchase.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, purchase.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== purchase.id));
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {new Date(purchase.purchaseDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-slate-800">{purchase.item}</div>
                    <div className="text-xs text-slate-400">Responsável: {responsibles.find(r => r.id === purchase.responsibleId)?.name || 'N/A'}</div>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {cards.find(c => c.id === purchase.cardId)?.name || 'Desconhecido'}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                      {purchase.category || 'Outros'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">
                    {purchase.installments}x
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-slate-900">
                    R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          storageService.deletePurchase(purchase.id);
                          loadData();
                        }}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                <td colSpan={6} className="py-4 px-4 text-right">Total das compras visíveis:</td>
                <td className="py-4 px-4 text-right text-lg">
                  R$ {totalFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          {filteredPurchases.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <ShoppingBag className="w-12 h-12 text-slate-200" />
              <p className="text-slate-500 font-medium">Nenhuma compra encontrada.</p>
              <button onClick={() => setIsAddOpen(true)} className="text-emerald-600 font-semibold hover:underline">Adicione sua primeira compra</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Purchase Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Nova Compra</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleAddPurchase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Item / Descrição</label>
                <input 
                  type="text" 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  required
                  placeholder="Ex: Supermercado"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Valor</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Parcelas</label>
                  <input 
                    type="number" 
                    value={newInstallments}
                    onChange={(e) => setNewInstallments(e.target.value)}
                    min="1"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cartão</label>
                  <select 
                    value={newCardId}
                    onChange={(e) => setNewCardId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Categoria</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {aiSuggestedCategory && !newCategory && (
                  <button 
                    type="button"
                    onClick={() => setNewCategory(aiSuggestedCategory)}
                    className="mt-2 text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1"
                  >
                    Sugestão IA: <strong>{aiSuggestedCategory}</strong> (Clique para usar)
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Responsável</label>
                <select 
                  value={newResponsibleId}
                  onChange={(e) => setNewResponsibleId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 shadow-md shadow-emerald-200"
                >
                  Salvar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Dialog */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Importação em Massa</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <div className="flex flex-col lg:flex-row h-[500px]">
              <div className="lg:w-1/3 p-6 bg-slate-50 space-y-4 border-r border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Ano da Fatura</label>
                  <input 
                    type="number" 
                    value={bulkYear}
                    onChange={(e) => setBulkYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cole o texto da fatura</label>
                  <textarea 
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Cole aqui as linhas da sua fatura..."
                    className="w-full h-48 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                  ></textarea>
                </div>
                <button 
                  onClick={handleBulkProcess}
                  disabled={isProcessing || !bulkText}
                  className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? 'Processando IA...' : 'Processar com IA'}
                </button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Revisão das Compras Extrais
                </h4>
                {tempPurchases.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Atribuir Cartão</label>
                        <select 
                          value={newCardId}
                          onChange={(e) => setNewCardId(e.target.value)}
                          className="w-full text-sm border-slate-200 rounded-lg"
                        >
                          <option value="">Selecione...</option>
                          {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Atribuir Responsável</label>
                        <select 
                          value={newResponsibleId}
                          onChange={(e) => setNewResponsibleId(e.target.value)}
                          className="w-full text-sm border-slate-200 rounded-lg"
                        >
                          <option value="">Selecione...</option>
                          {responsibles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <table className="w-full text-sm">
                      <thead className="text-slate-400 border-b border-slate-100 text-left">
                        <tr>
                          <th className="py-2">Data</th>
                          <th className="py-2">Item</th>
                          <th className="py-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {tempPurchases.map((tp, idx) => (
                          <tr key={idx}>
                            <td className="py-2">{new Date(tp.purchaseDate).toLocaleDateString('pt-BR')}</td>
                            <td className="py-2 font-medium">{tp.item} {tp.installments > 1 && `(${tp.installments}x)`}</td>
                            <td className="py-2 text-right font-bold">R$ {tp.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                    <Search className="w-12 h-12 mb-2" />
                    <p>Nenhuma compra extraída ainda.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsBulkOpen(false)}
                className="px-6 py-2 text-slate-600 font-semibold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveBulk}
                disabled={tempPurchases.length === 0}
                className="px-8 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-100 disabled:opacity-50"
              >
                Importar {tempPurchases.length} Compras
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
