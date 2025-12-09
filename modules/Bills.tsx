import React, { useState, useMemo } from 'react';
import { Bill, BillCategory } from '../types';
import * as Icons from '../components/Icons';

interface BillsProps {
  bills: Bill[];
  actions: any;
  onBack: () => void;
  viewCalendar: boolean;
  onToggleView: () => void;
}

const CATEGORY_ICONS: Record<BillCategory, React.ElementType> = {
  water: Icons.Droplet,
  electricity: Icons.Zap,
  internet: Icons.Wifi,
  card: Icons.CreditCard,
  rent: Icons.House,
  other: Icons.Circle,
};

const CATEGORY_LABELS: Record<BillCategory, string> = {
  water: 'Água',
  electricity: 'Luz',
  internet: 'Internet',
  card: 'Cartão',
  rent: 'Aluguel',
  other: 'Outro',
};

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'paid', label: 'Pagas' },
  { id: 'overdue', label: 'Vencidas' },
];

export const BillsModule: React.FC<BillsProps> = ({ bills, actions, onBack, viewCalendar, onToggleView }) => {
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Bill>>({
    name: '',
    value: 0,
    dueDate: new Date().toISOString().split('T')[0],
    category: 'other',
    status: 'pending',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      value: 0,
      dueDate: new Date().toISOString().split('T')[0],
      category: 'other',
      status: 'pending',
    });
    setEditingBill(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const billToSave = {
      ...formData,
      id: editingBill ? editingBill.id : crypto.randomUUID(),
    } as Bill;

    if (editingBill) {
      actions.updateBill(billToSave);
    } else {
      actions.addBill(billToSave);
      // Try to schedule notification
      actions.scheduleNotification("Conta Adicionada", `Lembrete criado para ${billToSave.name}`);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormData(bill);
    setIsModalOpen(true);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const isOverdue = bill.status === 'pending' && bill.dueDate < todayStr;
      if (filter === 'pending') return bill.status === 'pending' && !isOverdue;
      if (filter === 'paid') return bill.status === 'paid';
      if (filter === 'overdue') return isOverdue;
      if (filter === 'today') return bill.dueDate === todayStr;
      return true;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [bills, filter, todayStr]);

  // Calculations for total
  const totalValue = filteredBills.reduce((acc, bill) => acc + Number(bill.value), 0);

  // Calendar View Rendering
  const renderCalendar = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const getBillsForDay = (day: number) => {
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return bills.filter(b => b.dueDate === dateStr);
    };

    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 animate-fade-in">
        <h3 className="text-lg font-bold mb-4 text-center dark:text-white">
          {today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center mb-2 text-xs font-semibold text-gray-500">
          <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sab</div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(b => <div key={`blank-${b}`} className="h-14"></div>)}
          {days.map(day => {
            const dayBills = getBillsForDay(day);
            const hasOverdue = dayBills.some(b => b.status === 'pending' && b.dueDate < todayStr);
            const hasPending = dayBills.some(b => b.status === 'pending');
            const isToday = day === today.getDate();

            return (
              <div key={day} className={`h-14 border rounded flex flex-col items-center justify-start pt-1 text-xs relative ${isToday ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-slate-700'}`}>
                <span className="font-medium dark:text-gray-300">{day}</span>
                <div className="flex gap-1 mt-1 flex-wrap justify-center">
                   {dayBills.map((b, i) => (
                     <div key={b.id} className={`w-2 h-2 rounded-full ${b.status === 'paid' ? 'bg-success' : (b.dueDate < todayStr ? 'bg-danger' : 'bg-warning')}`} />
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full text-gray-600 dark:text-gray-300">
            <Icons.ArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Contas a Pagar</h1>
        </div>
        <button onClick={onToggleView} className="p-2 text-primary hover:bg-primary/10 rounded-full">
          {viewCalendar ? <Icons.Receipt /> : <Icons.CalendarIcon />}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {viewCalendar ? (
          renderCalendar()
        ) : (
          <>
            {/* Summary Card */}
            <div className="mb-4 bg-gradient-to-r from-primary to-purple-600 rounded-xl p-5 text-white shadow-lg">
               <p className="text-sm opacity-90">Total {STATUS_FILTERS.find(f => f.id === filter)?.label.toLowerCase()}</p>
               <h2 className="text-3xl font-bold">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === f.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-3 pb-20">
              {filteredBills.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Nenhuma conta encontrada.</div>
              ) : (
                filteredBills.map(bill => {
                  const Icon = CATEGORY_ICONS[bill.category];
                  const isOverdue = bill.status === 'pending' && bill.dueDate < todayStr;

                  return (
                    <div key={bill.id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 flex items-center gap-3 transition-all ${
                      bill.status === 'paid' ? 'border-success opacity-75' : isOverdue ? 'border-danger' : 'border-warning'
                    }`}>
                      <div className={`p-2 rounded-full ${bill.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-gray-800 dark:text-white truncate ${bill.status === 'paid' ? 'line-through' : ''}`}>
                          {bill.name}
                        </h3>
                        <div className="text-xs text-gray-500 flex gap-2">
                           <span className={isOverdue ? 'text-danger font-bold' : ''}>
                             Vence: {new Date(bill.dueDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                           </span>
                           <span>•</span>
                           <span>{CATEGORY_LABELS[bill.category]}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 dark:text-white">R$ {Number(bill.value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <div className="flex gap-2 mt-2 justify-end">
                           <button onClick={() => actions.toggleBillStatus(bill.id)} className={`text-xs px-2 py-1 rounded ${bill.status === 'paid' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                             {bill.status === 'paid' ? 'Reabrir' : 'Pagar'}
                           </button>
                           <button onClick={() => handleEdit(bill)} className="text-gray-400 hover:text-primary">
                             <Icons.Edit size={16}/>
                           </button>
                           <button onClick={() => actions.deleteBill(bill.id)} className="text-gray-400 hover:text-danger">
                             <Icons.Trash2 size={16}/>
                           </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => { resetForm(); setIsModalOpen(true); }}
        className="fixed bottom-6 right-6 bg-primary hover:bg-indigo-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 z-20"
      >
        <Icons.Plus size={28} />
      </button>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <h2 className="text-xl font-bold mb-4 dark:text-white">{editingBill ? 'Editar Conta' : 'Nova Conta'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nome</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Conta de Luz"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Valor (R$)</label>
                   <input
                     required
                     type="number"
                     step="0.01"
                     value={formData.value}
                     onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                     className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Vencimento</label>
                   <input
                     required
                     type="date"
                     value={formData.dueDate}
                     onChange={e => setFormData({...formData, dueDate: e.target.value})}
                     className="w-full p-3 rounded-lg bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white outline-none"
                   />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData({...formData, category: key as BillCategory})}
                      className={`text-xs py-2 rounded-lg border ${
                        formData.category === key
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-medium">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-primary hover:bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-primary/30">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};