
import React, { createContext, useContext, useState, useCallback } from 'react';

interface SearchContextType {
  query: string;
  setQuery: (q: string) => void;
  primary: string;
  setPrimary: (p: string) => void;
  secondary: string;
  setSecondary: (s: string) => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  reset: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [query, setQuery] = useState('');
  const [primary, setPrimary] = useState('ALL');
  const [secondary, setSecondary] = useState('ALL');
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(p => !p), []);
  const reset = useCallback(() => {
    setQuery('');
    setPrimary('ALL');
    setSecondary('ALL');
  }, []);

  return (
    <SearchContext.Provider value={{ query, setQuery, primary, setPrimary, secondary, setSecondary, isOpen, open, close, toggle, reset }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
};
