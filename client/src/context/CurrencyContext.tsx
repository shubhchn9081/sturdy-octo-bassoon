import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define supported currencies
export type SupportedCurrency = 'BTC' | 'ETH' | 'USDT' | 'USD' | 'INR';

// Define context type
interface CurrencyContextType {
  activeCurrency: SupportedCurrency;
  setActiveCurrency: (currency: SupportedCurrency) => void;
}

// Create context with default values
export const CurrencyContext = createContext<CurrencyContextType>({
  activeCurrency: 'INR',
  setActiveCurrency: () => {},
});

// Provider component
export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with stored preference or default to INR
  const [activeCurrency, setActiveCurrencyState] = useState<SupportedCurrency>(() => {
    const storedCurrency = localStorage.getItem('activeCurrency');
    return (storedCurrency as SupportedCurrency) || 'INR';
  });

  // Update currency and store in localStorage
  const setCurrency = (currency: SupportedCurrency) => {
    setActiveCurrencyState(currency);
    localStorage.setItem('activeCurrency', currency);
  };

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrency: setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook for using the currency context
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  
  return context;
};