import React, { createContext, useContext, ReactNode } from 'react';

// Define supported currencies - Now only INR is used
export type SupportedCurrency = 'INR';

// Define context type
interface CurrencyContextType {
  activeCurrency: SupportedCurrency;
  setActiveCurrency: (currency: SupportedCurrency) => void;
}

// Create context with default values - Always using INR
export const CurrencyContext = createContext<CurrencyContextType>({
  activeCurrency: 'INR',
  setActiveCurrency: () => {},
});

// Provider component - Simplified since we only support INR now
export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // INR is always the active currency
  const activeCurrency: SupportedCurrency = 'INR';

  // This is a dummy function since we don't actually change currencies anymore
  const setCurrency = (_currency: SupportedCurrency) => {
    console.log('Currency system only supports INR');
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