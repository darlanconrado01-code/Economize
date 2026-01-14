
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Card } from '../types';
import { Plus, Trash2, CreditCard as CardIcon } from 'lucide-react';

const Cards: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDigits, setNewDigits] = useState('');
  const [newPayDay, setNewPayDay] = useState('10');
  const [newColor, setNewColor] = useState('bg-slate-800');

  useEffect(() => {
    setCards(storageService.getCards());
  }, []);

  const handleAdd = () => {
    if (!newName || !newDigits) return;
    storageService.addCard({
      userId: 'user1',
      name: newName,
      lastFourDigits: newDigits,
      paymentDay: parseInt(newPayDay),
      color: newColor
    });
    setCards(storageService.getCards());
    setIsAddOpen(false);
    reset();
  };

  const reset = () => {
    setNewName('');
    setNewDigits('');
    setNewPayDay('10');
    setNewColor('bg-slate-800');
  };

  const colors = [
    { name: 'Preto', class: 'bg-slate-900' },
    { name: 'Roxo', class: 'bg-purple-600' },
    { name: 'Azul', class: 'bg-blue-600' },
    { name: 'Verde', class: 'bg-emerald-600' },
    { name: 'Dourado', class: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Meus Cartões</h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-100"
        >
          <Plus className="w-4 h-4" /> Adicionar Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.id} className={`p-6 rounded-2xl shadow-lg relative text-white overflow-hidden h-48 flex flex-col justify-between ${card.color || 'bg-slate-800'}`}>
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center justify-between">
              <div className="w-10 h-7 bg-amber-400/80 rounded-sm"></div>
              <button 
                onClick={() => {
                  storageService.deleteCard(card.id);
                  setCards(storageService.getCards());
                }}
                className="p-2 hover:bg-white/20 rounded-lg text-white/60 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium tracking-widest text-white/70">•••• •••• •••• {card.lastFourDigits}</p>
              <h3 className="text-lg font-bold">{card.name}</h3>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-white/70 uppercase">
              <span>Vencimento dia {card.paymentDay}</span>
              <CardIcon className="w-6 h-6 text-white/40" />
            </div>
          </div>
        ))}

        {cards.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 gap-4">
            <CardIcon className="w-12 h-12" />
            <p>Você ainda não cadastrou nenhum cartão.</p>
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Novo Cartão</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-1">Nome do Cartão</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Nubank, Inter, XP"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Últimos 4 Dígitos</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={newDigits}
                    onChange={e => setNewDigits(e.target.value)}
                    placeholder="1234"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">Dia Vencimento</label>
                  <input 
                    type="number" 
                    min={1} 
                    max={31}
                    value={newPayDay}
                    onChange={e => setNewPayDay(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Cor do Cartão</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button 
                      key={c.class}
                      onClick={() => setNewColor(c.class)}
                      className={`w-8 h-8 rounded-full border-2 ${c.class} ${newColor === c.class ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-transparent'}`}
                    ></button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleAdd}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-colors"
              >
                Criar Cartão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
