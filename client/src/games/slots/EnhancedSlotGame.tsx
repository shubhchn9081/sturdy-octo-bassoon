import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { emojiToSymbolId, symbolIdToEmoji, SlotThemeAsset } from '@/lib/slotAssets';
import useSlotAssets from '@/lib/useSlotAssets';
import SlotSymbol from '@/components/ui/slot-symbol';
import BaseSlotGame from './BaseSlotGame';
import { SlotConfiguration } from './BaseSlotGame';
import { Loader2 } from 'lucide-react';

interface EnhancedSlotGameProps {
  gameId: number;
  themeId: string;
  config: SlotConfiguration;
}

/**
 * EnhancedSlotGame wraps the BaseSlotGame component and enhances it with image assets
 */
const EnhancedSlotGame: React.FC<EnhancedSlotGameProps> = ({ gameId, themeId, config }) => {
  const { toast } = useToast();
  const { loading, theme, error } = useSlotAssets(themeId);
  const [enhancedConfig, setEnhancedConfig] = useState<SlotConfiguration | null>(null);
  
  // Convert emoji config to enhanced config with asset IDs
  useEffect(() => {
    if (!theme) return;
    
    try {
      // Create a clone of the original config
      const newConfig = { ...config };
      
      // Convert emoji symbols to symbol IDs
      newConfig.symbols = config.symbols.map(emoji => {
        const symbolId = emojiToSymbolId(themeId, emoji);
        return symbolId || emoji; // Fallback to emoji if no match
      });
      
      // Convert luckySymbol emoji to symbol ID
      const luckySymbolId = emojiToSymbolId(themeId, config.luckySymbol);
      if (luckySymbolId) {
        newConfig.luckySymbol = luckySymbolId;
      }
      
      // Update payouts to use symbol IDs instead of emojis
      newConfig.payouts = config.payouts.map(payout => ({
        ...payout,
        combination: payout.combination.map(emoji => {
          const symbolId = emojiToSymbolId(themeId, emoji);
          return symbolId || emoji; // Fallback to emoji if no match
        })
      }));
      
      // Update special symbols to use symbol IDs
      newConfig.specialSymbols = config.specialSymbols.map(special => ({
        ...special,
        symbol: emojiToSymbolId(themeId, special.symbol) || special.symbol
      }));
      
      setEnhancedConfig(newConfig);
    } catch (e) {
      console.error('Error enhancing slot config:', e);
      toast({
        title: 'Configuration Error',
        description: 'Failed to enhance slot configuration with assets. Using original configuration.',
        variant: 'destructive'
      });
      
      // Use original config as fallback
      setEnhancedConfig(config);
    }
  }, [config, theme, themeId, toast]);
  
  // Render loading state
  if (loading || !enhancedConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-lg p-6 text-white">
        <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold">Loading Assets</h3>
        <p className="text-slate-400">Preparing high-quality slot machine assets...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-slate-900 rounded-lg p-6 text-white">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">❗</span>
        </div>
        <h3 className="text-xl font-semibold">Error Loading Assets</h3>
        <p className="text-slate-400">{error}</p>
        <p className="mt-4 text-sm text-slate-500">Falling back to emoji-based slot machine.</p>
      </div>
    );
  }
  
  // Custom component to render slot symbols with images
  const renderSymbol = (symbol: string, isWinning: boolean = false, isLucky: boolean = false) => {
    return (
      <SlotSymbol 
        themeId={themeId} 
        symbolId={symbol} 
        size="lg" 
        isWinning={isWinning} 
        isLucky={isLucky} 
      />
    );
  };
  
  // Apply custom theme styling from asset library
  const customStyles = {
    container: {
      background: theme?.background || 'linear-gradient(135deg, #1a202c, #0f172a)',
    },
    reelsContainer: {
      background: theme?.reelBackground || 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9), rgba(12, 24, 48, 0.9))',
    }
  };
  
  return (
    <BaseSlotGame 
      config={enhancedConfig} 
      gameId={gameId} 
      customStyles={customStyles}
      renderSymbol={renderSymbol}
    />
  );
};

export default EnhancedSlotGame;