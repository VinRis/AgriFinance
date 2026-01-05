'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AgriTransaction, AppSettings, LivestockType } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

type State = {
  transactions: AgriTransaction[];
  settings: AppSettings;
};

type Action =
  | { type: 'ADD_TRANSACTION'; payload: AgriTransaction }
  | { type: 'UPDATE_TRANSACTION'; payload: AgriTransaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

type AppContextType = State & {
  dispatch: React.Dispatch<Action>;
  getTransactions: (type: LivestockType) => AgriTransaction[];
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
  farmName: 'My Farm',
  managerName: 'Farm Manager',
  location: 'Green Valley',
  currency: 'USD',
};

function appReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [storedState, setStoredState] = useLocalStorage<State>('agri-finance-pro-data', {
    transactions: [],
    settings: defaultSettings,
  });

  const [state, dispatch] = useReducer(appReducer, storedState);

  const enhancedDispatch: React.Dispatch<Action> = (action) => {
    const newState = appReducer(state, action);
    setStoredState(newState);
    dispatch(action);
  };
  
  const getTransactions = (type: LivestockType) => {
    return state.transactions.filter(transaction => transaction.livestockType === type);
  };

  return (
    <AppContext.Provider value={{ ...state, dispatch: enhancedDispatch, getTransactions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
