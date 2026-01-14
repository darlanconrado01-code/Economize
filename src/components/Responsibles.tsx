
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Responsible } from '../types';
import { Plus, User, Trash2 } from 'lucide-react';

const Responsibles: React.FC = () => {
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    setResponsibles(storageService.getResponsibles());
  }, []);

  const handleAdd = () => {
    if (!newName) return;
    storageService.addResponsible({ name: newName });
    setResponsibles(storageService.getResponsibles());
    setNewName('');
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Responsáveis</h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium"
        >
          <Plus className="w-4 h-4" /> Nova Pessoa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {responsibles.map(res => (
          <div key={res.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <User className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-800">{res.name}</span>
            </div>
            <button className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Adicionar Pessoa</h3>
            <input 
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nome da pessoa..."
              className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setIsAddOpen(false)} className="flex-1 py-2 text-slate-500 font-bold">Cancelar</button>
              <button onClick={handleAdd} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Responsibles;
