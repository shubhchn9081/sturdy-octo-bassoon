import React from 'react';
import { useCurrency, type SupportedCurrency } from '@/context/CurrencyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCurrencySymbol } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface CurrencySwitcherProps {
  variant?: 'default' | 'header' | 'game';
  currencies?: SupportedCurrency[];
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ 
  variant = 'default',
  currencies = ['BTC', 'USD', 'INR']
}) => {
  const { activeCurrency, setActiveCurrency } = useCurrency();

  // Different styling based on variant
  const getContainerClasses = () => {
    switch (variant) {
      case 'header':
        return 'flex bg-[#1C2C39] rounded px-2 py-1.5 items-center text-xs cursor-pointer';
      case 'game':
        return 'relative inline-block';
      default:
        return 'inline-flex items-center rounded-md border border-[#243442] bg-[#1C2C39] px-3 py-2 text-sm';
    }
  };

  // Render header variant (used in the main header)
  if (variant === 'header') {
    return (
      <div 
        className={getContainerClasses()}
        onClick={(e) => e.stopPropagation()}
      >
        <Select 
          value={activeCurrency} 
          onValueChange={(value) => setActiveCurrency(value as SupportedCurrency)}
        >
          <SelectTrigger 
            className="border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0 flex items-center" 
          >
            <div className="flex items-center">
              <span className="mr-1 text-white font-mono font-semibold">
                {getCurrencySymbol(activeCurrency)}
              </span>
              <span className="text-white font-mono">{activeCurrency}</span>
              {/* Chevron is already included by SelectTrigger */}
            </div>
          </SelectTrigger>
          <SelectContent className="min-w-[80px] bg-[#172532] border-[#2a3642] text-white z-50">
            {currencies.map(currency => (
              <SelectItem key={currency} value={currency} className="cursor-pointer">
                <div className="flex items-center">
                  <span className="mr-2 font-semibold">{getCurrencySymbol(currency)}</span>
                  <span>{currency}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Game variant (used inside games with a special layout)
  if (variant === 'game') {
    return (
      <div className={getContainerClasses()}>
        <Select 
          value={activeCurrency} 
          onValueChange={(value) => setActiveCurrency(value as SupportedCurrency)}
        >
          <SelectTrigger 
            className="w-[80px] h-full bg-[#172532] border-0 text-white rounded-l-none rounded-r border-l border-[#0B131C]"
          >
            <div className="flex items-center">
              <span className="mr-1">{getCurrencySymbol(activeCurrency)}</span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="min-w-[80px] bg-[#172532] border-[#2a3642] text-white">
            {currencies.map(currency => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Default variant
  return (
    <div className={getContainerClasses()}>
      <Select 
        value={activeCurrency} 
        onValueChange={(value) => setActiveCurrency(value as SupportedCurrency)}
      >
        <SelectTrigger className="border-0 bg-transparent p-0 h-auto shadow-none focus:ring-0">
          <div className="flex items-center">
            <span className="text-white mr-2">{getCurrencySymbol(activeCurrency)}</span>
            <span className="text-white">{activeCurrency}</span>
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-[100px] bg-[#172532] border-[#2a3642] text-white">
          {currencies.map(currency => (
            <SelectItem key={currency} value={currency}>
              <div className="flex items-center">
                <span className="mr-2">{getCurrencySymbol(currency)}</span>
                <span>{currency}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySwitcher;