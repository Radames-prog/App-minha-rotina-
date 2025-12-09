import React, { useState } from 'react';
import { useData } from './hooks/useData';
import { ViewState } from './types';
import * as Icons from './components/Icons';
import { BillsModule } from './modules/Bills';
import { ShoppingModule } from './modules/Shopping';

const App: React.FC = () => {
  const { data, loaded, actions } = useData();
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [billsViewCalendar, setBillsViewCalendar] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!loaded) return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 text-primary"><Icons.Zap className="animate-pulse" size={48} /></div>;

  // --- Views ---

  const renderHome = () => (
    <div className="flex flex-col h-full p-6 max-w-md mx-auto justify-center space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
          Minha <span className="text-primary">Rotina+</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400">Organize suas contas e compras.</p>
      </div>

      <div className="grid gap-4 w-full">
        <button
          onClick={() => setView('BILLS_LIST')}
          className="group relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent hover:border-primary/50 transition-all active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icons.Receipt size={80} className="text-primary" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Icons.Receipt size={32} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contas a Pagar</h2>
              <p className="text-sm text-gray-500">
                {data.bills.filter(b => b.status === 'pending').length} pendentes
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView('SHOPPING_LISTS')}
          className="group relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-transparent hover:border-secondary/50 transition-all active:scale-95"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icons.ShoppingCart size={80} className="text-secondary" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
              <Icons.ShoppingCart size={32} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lista de Compras</h2>
              <p className="text-sm text-gray-500">
                {data.shoppingLists.length} listas criadas
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <Icons.Settings />
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold dark:text-white">Configurações</h2>
           <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-gray-800"><Icons.Plus className="rotate-45" /></button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-200">Tema Escuro</span>
            <button onClick={actions.toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 dark:text-yellow-400 text-gray-600">
               {data.theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Dados & Backup</p>
            <button onClick={actions.exportData} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded-lg text-gray-700 dark:text-white mb-2 font-medium">
              Exportar Backup (.json)
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 rounded-lg text-gray-700 dark:text-white font-medium">
              Importar Backup
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  actions.importData(e.target.files[0]);
                  e.target.value = ''; // Reset
                }
              }}
              className="hidden"
              accept=".json"
            />
          </div>
          
           <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
            <button onClick={() => actions.scheduleNotification('Teste', 'Notificações ativadas!')} className="text-xs text-primary underline">
              Testar/Ativar Notificações
            </button>
           </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-slate-900 overflow-hidden relative">
      {view === 'HOME' && renderHome()}

      {(view === 'BILLS_LIST') && (
        <BillsModule
          bills={data.bills}
          actions={actions}
          onBack={() => setView('HOME')}
          viewCalendar={billsViewCalendar}
          onToggleView={() => setBillsViewCalendar(!billsViewCalendar)}
        />
      )}

      {(view === 'SHOPPING_LISTS' || view === 'SHOPPING_DETAIL') && (
        <ShoppingModule
          lists={data.shoppingLists}
          actions={actions}
          onBack={() => setView('HOME')}
          currentListId={selectedListId}
          onSelectKey={(id) => {
             setSelectedListId(id);
             setView(id ? 'SHOPPING_DETAIL' : 'SHOPPING_LISTS');
          }}
        />
      )}

      {isSettingsOpen && renderSettings()}
    </div>
  );
};

export default App;