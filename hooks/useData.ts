import { useState, useEffect, useCallback } from 'react';
import { AppData, Bill, ShoppingList, ShoppingItem } from '../types';

const STORAGE_KEY = 'MINHA_ROTINA_DATA_V1';

const INITIAL_DATA: AppData = {
  bills: [],
  shoppingLists: [],
  theme: 'light',
};

export const useData = () => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        // Detect system theme
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
           setData(prev => ({ ...prev, theme: 'dark' }));
        }
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save to LocalStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Apply theme
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [data, loaded]);

  // --- Actions ---

  const toggleTheme = () => {
    setData(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  // Bills
  const addBill = (bill: Bill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, bill] }));
  };

  const updateBill = (updatedBill: Bill) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === updatedBill.id ? updatedBill : b)
    }));
  };

  const deleteBill = (id: string) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id)
    }));
  };

  const toggleBillStatus = (id: string) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === id ? { ...b, status: b.status === 'pending' ? 'paid' : 'pending' } : b)
    }));
  };

  // Shopping Lists
  const addShoppingList = (name: string) => {
    const newList: ShoppingList = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      items: []
    };
    setData(prev => ({ ...prev, shoppingLists: [...prev.shoppingLists, newList] }));
    return newList.id;
  };

  const deleteShoppingList = (id: string) => {
    setData(prev => ({
      ...prev,
      shoppingLists: prev.shoppingLists.filter(l => l.id !== id)
    }));
  };

  const updateShoppingList = (list: ShoppingList) => {
     setData(prev => ({
      ...prev,
      shoppingLists: prev.shoppingLists.map(l => l.id === list.id ? list : l)
    }));
  }

  // Backup / Restore
  const exportData = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_minha_rotina_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        if (parsed.bills && parsed.shoppingLists) {
          setData(parsed);
          alert('Backup restaurado com sucesso!');
        } else {
          alert('Arquivo inválido.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo.');
      }
    };
    reader.readAsText(file);
  };

  // Notification logic (Simple implementation)
  const scheduleNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }, []);

  return {
    data,
    loaded,
    actions: {
      toggleTheme,
      addBill,
      updateBill,
      deleteBill,
      toggleBillStatus,
      addShoppingList,
      deleteShoppingList,
      updateShoppingList,
      exportData,
      importData,
      scheduleNotification
    }
  };
};