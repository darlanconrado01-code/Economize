
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Category } from '../types';
import { Plus, Tag } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setCategories(storageService.getCategories());
  }, []);

  const handleAdd = () => {
    if (!newName) return;
    storageService.addCategory({ name: newName, color: 'bg-slate-500' });
    setCategories(storageService.getCategories());
    setNewName('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Categorias</h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nova Categoria
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${cat.color} rounded-full flex items-center justify-center text-white`}>
              <Tag className="w-5 h-5" />
            </div>
            <span className="font-semibold text-slate-700 text-sm">{cat.name}</span>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Nova Categoria</h3>
            <input 
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Ex: Investimentos"
              className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsAddOpen(false)} className="flex-1 py-2 text-slate-500 font-bold">Cancelar</button>
              <button onClick={handleAdd} className="flex-1 py-2 bg-slate-800 text-white rounded-lg font-bold">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
