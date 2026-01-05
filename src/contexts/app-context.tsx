'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AgriRecord, AppSettings, LivestockType } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

type State = {
  records: AgriRecord[];
  settings: AppSettings;
};

type Action =
  | { type: 'ADD_RECORD'; payload: AgriRecord }
  | { type: 'UPDATE_RECORD'; payload: AgriRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'DELETE_RECORDS'; payload: string[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ALL_DATA'; payload: State };

type AppContextType = State & {
  dispatch: React.Dispatch<Action>;
  getRecords: (type: LivestockType) => AgriRecord[];
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
    case 'ADD_RECORD':
      return { ...state, records: [...state.records, action.payload] };
    case 'UPDATE_RECORD':
      return {
        ...state,
        records: state.records.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'DELETE_RECORD':
      return { ...state, records: state.records.filter((r) => r.id !== action.payload) };
    case 'DELETE_RECORDS':
      return { ...state, records: state.records.filter((r) => !action.payload.includes(r.id)) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_ALL_DATA':
      return action.payload;
    default:
      return state;
  }
}

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [storedState, setStoredState] = useLocalStorage<State>('agri-finance-pro-data', {
    records: [],
    settings: defaultSettings,
  });

  const [state, dispatch] = useReducer(appReducer, storedState);

  const enhancedDispatch: React.Dispatch<Action> = (action) => {
    const newState = appReducer(state, action);
    setStoredState(newState);
    dispatch(action);
  };
  
  const getRecords = (type: LivestockType) => {
    return state.records.filter(record => record.type === type);
  };

  return (
    <AppContext.Provider value={{ ...state, dispatch: enhancedDispatch, getRecords }}>
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
