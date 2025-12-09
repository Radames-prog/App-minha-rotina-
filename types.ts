export type ViewState = 'HOME' | 'BILLS_LIST' | 'BILLS_CALENDAR' | 'SHOPPING_LISTS' | 'SHOPPING_DETAIL' | 'SETTINGS';

export type BillCategory = 'water' | 'electricity' | 'internet' | 'card' | 'rent' | 'other';

export interface Bill {
  id: string;
  name: string;
  value: number;
  dueDate: string; // ISO Date string YYYY-MM-DD
  category: BillCategory;
  status: 'pending' | 'paid';
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  note?: string;
  done: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
  items: ShoppingItem[];
}

export interface AppData {
  bills: Bill[];
  shoppingLists: ShoppingList[];
  theme: 'light' | 'dark';
}

// Helper types for UI
export interface IconProps {
  className?: string;
  size?: number;
  onClick?: () => void;
}