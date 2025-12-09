import React, { useState } from 'react';
import { ShoppingList, ShoppingItem } from '../types';
import * as Icons from '../components/Icons';

interface ShoppingProps {
  lists: ShoppingList[];
  actions: any;
  onBack: () => void;
  currentListId: string | null;
  onSelectKey: (id: string | null) => void;
}

export const ShoppingModule: React.FC<ShoppingProps> = ({ lists, actions, onBack, currentListId, onSelectKey }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');
  const [newListName, setNewListName] = useState('');

  // Derived state
  const currentList = lists.find(l => l.id === currentListId);

  // --- Handlers for List Management ---
  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      actions.addShoppingList(newListName);
      setNewListName('');
      setIsModalOpen(false);
    }
  };

  // --- Handlers for Item Management ---
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentList || !newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      quantity: newItemQty,
      done: false
    };

    const updatedList = {
      ...currentList,
      items: [...currentList.items, newItem]
    };
    actions.updateShoppingList(updatedList);
    setNewItemName('');
    setNewItemQty('1');
    setIsModalOpen(false); // Close modal reused for item add
  };

  const toggleItem = (itemId: string) => {
    if (!currentList) return;
    const updatedList = {
      ...currentList,
      items: currentList.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i)
    };
    actions.updateShoppingList(updatedList);
  };

  const deleteItem = (itemId: string) => {
    if (!currentList) return;
    const updatedList = {
      ...currentList,
      items: currentList.items.filter(i => i.id !== itemId)
    };
    actions.updateShoppingList(updatedList);
  };

  const clearCompleted = () => {
    if (!currentList) return;
    const updatedList = {
      ...currentList,
      items: currentList.items.map(i => i.done ? { ...i, done: false } : i) // Requirement says "Limpar" usually implies delete or uncheck. Re-reading: "Limpar itens comprados" usually means remove. But unchecking is safer. Let's ask? No, user said "Limpar itens comprados com um botão". I will remove them.
    };
    // Actually, "Limpar" often means Remove Completed.
    const filteredList = {
       ...currentList,
       items: currentList.items.filter(i => !i.done)
    };
    actions.updateShoppingList(filteredList);
  };

  // --- Render List of Lists ---
  if (!currentListId) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 shadow p-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300">
            <Icons.ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Listas de Compras</h1>
        </header>

        <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
          {lists.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Nenhuma lista criada.</div>
          ) : (
            <div className="grid gap-3">
              {lists.map(list => {
                 const totalItems = list.items.length;
                 const doneItems = list.items.filter(i => i.done).length;
                 const progress = totalItems === 0 ? 0 : (doneItems / totalItems) * 100;

                 return (
                  <div key={list.id} onClick={() => onSelectKey(list.id)} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm active:scale-[0.99] transition-transform cursor-pointer border border-gray-100 dark:border-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white">{list.name}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); actions.deleteShoppingList(list.id); }}
                        className="text-gray-400 hover:text-danger p-1"
                      >
                        <Icons.Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                       <span>{doneItems}/{totalItems} itens</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </main>

        <button
          onClick={() => { setIsModalOpen(true); }}
          className="fixed bottom-6 right-6 bg-secondary hover:bg-pink-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-20"
        >
          <Icons.Plus size={28} />
        </button>

        {/* Modal Create List */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-bold mb-4 dark:text-white">Nova Lista</h2>
              <form onSubmit={handleCreateList}>
                <input
                  autoFocus
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  placeholder="Nome da lista (ex: Mercado)"
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white mb-4 outline-none focus:ring-2 focus:ring-secondary"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-500">Cancelar</button>
                  <button type="submit" className="flex-1 py-2 bg-secondary text-white rounded-lg font-bold">Criar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Render List Details ---
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => onSelectKey(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300">
            <Icons.ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white truncate max-w-[200px]">{currentList?.name}</h1>
        </div>
        <button onClick={clearCompleted} className="text-xs font-medium text-secondary hover:underline px-2">
          Limpar comprados
        </button>
      </header>

      <main className="flex-1 p-4 overflow-y-auto no-scrollbar pb-24">
        <div className="space-y-2">
          {currentList?.items.map(item => (
            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.done ? 'bg-gray-100 dark:bg-slate-800/50 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-sm'}`}>
              <button
                onClick={() => toggleItem(item.id)}
                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${item.done ? 'bg-secondary border-secondary text-white' : 'border-gray-300 dark:border-slate-500'}`}
              >
                {item.done && <Icons.Check size={14} />}
              </button>
              <div className="flex-1" onClick={() => toggleItem(item.id)}>
                <p className={`font-medium ${item.done ? 'line-through text-gray-500' : 'text-gray-800 dark:text-white'}`}>{item.name}</p>
                <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
              </div>
              <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-danger p-2">
                <Icons.Trash2 size={18} />
              </button>
            </div>
          ))}
          {currentList?.items.length === 0 && (
             <div className="text-center py-10 text-gray-400">Lista vazia. Adicione itens.</div>
          )}
        </div>
      </main>

      {/* Input Bar for Quick Add */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-4 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <form onSubmit={handleAddItem} className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            placeholder="Adicionar item..."
            className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border-none outline-none dark:text-white"
          />
          <input
            type="text"
            value={newItemQty}
            onChange={e => setNewItemQty(e.target.value)}
            placeholder="Qtd"
            className="w-16 text-center p-3 rounded-lg bg-gray-100 dark:bg-slate-700 border-none outline-none dark:text-white"
          />
          <button type="submit" className="bg-secondary p-3 rounded-lg text-white font-bold hover:bg-pink-600">
            <Icons.Plus />
          </button>
        </form>
      </div>
    </div>
  );
};