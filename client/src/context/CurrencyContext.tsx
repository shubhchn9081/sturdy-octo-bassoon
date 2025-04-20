import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the supported currencies
export type SupportedCurrency = 'BTC' | 'ETH' | 'USDT' | 'USD' | 'INR';

interface CurrencyContextType {
  activeCurrency: SupportedCurrency;
  setActiveCurrency: (currency: SupportedCurrency) => void;
}

// Create the currency context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Provider component
export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>('BTC');

  // Store the currency preference in localStorage whenever it changes
  const setCurrency = (currency: SupportedCurrency) => {
    setActiveCurrency(currency);
    localStorage.setItem('preferredCurrency', currency);
  };

  // Load the preferred currency from localStorage on mount
  React.useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency') as SupportedCurrency | null;
    if (savedCurrency && ['BTC', 'ETH', 'USDT', 'USD', 'INR'].includes(savedCurrency)) {
      setActiveCurrency(savedCurrency);
    }
  }, []);

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrency: setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};