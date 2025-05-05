import React, { useState } from 'react';
import { SlotSymbol } from '@shared/schema';

interface GalacticSpinsGameProps {
  reels: SlotSymbol[][];
  isSpinning: boolean;
  spinResults: any;
  onSpin: () => void;
  soundEnabled: boolean;
}

// Simple placeholder implementation for the Galactic Spins game
// This will be enhanced with full PixiJS integration when those issues are resolved
const GalacticSpinsGame: React.FC<GalacticSpinsGameProps> = ({
  reels,
  isSpinning,
  spinResults,
  onSpin,
  soundEnabled
}) => {
  const getSymbolEmoji = (symbol: SlotSymbol): string => {
    const symbolMap: Record<SlotSymbol, string> = {
      'planet': '🪐',
      'star': '⭐',
      'rocket': '🚀',
      'alien': '👽',
      'asteroid': '☄️',
      'comet': '💫',
      'galaxy': '🌌',
      'blackhole': '⚫',
      'wild': '🃏'
    };
    
    return symbolMap[symbol] || '❓';
  };
  
  const getSymbolColor = (symbol: SlotSymbol): string => {
    const colorMap: Record<SlotSymbol, string> = {
      'planet': 'text-blue-400',
      'star': 'text-yellow-400',
      'rocket': 'text-red-500',
      'alien': 'text-green-400',
      'asteroid': 'text-amber-700',
      'comet': 'text-amber-400',
      'galaxy': 'text-purple-400',
      'blackhole': 'text-gray-800',
      'wild': 'text-purple-600'
    };
    
    return colorMap[symbol] || 'text-gray-400';
  };
  
  const getSymbolBackground = (symbol: SlotSymbol): string => {
    const bgMap: Record<SlotSymbol, string> = {
      'planet': 'bg-blue-900',
      'star': 'bg-yellow-900',
      'rocket': 'bg-red-900',
      'alien': 'bg-green-900',
      'asteroid': 'bg-amber-900',
      'comet': 'bg-amber-800',
      'galaxy': 'bg-purple-900',
      'blackhole': 'bg-gray-900',
      'wild': 'bg-purple-900'
    };
    
    return bgMap[symbol] || 'bg-gray-800';
  };
  
  return (
    <div className="w-full h-[400px] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 bg-[#050A1C]">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `opacity ${Math.random() * 4 + 2}s infinite alternate`
            }}
          />
        ))}
      </div>
      
      {/* Game title */}
      <h2 className="text-2xl font-bold text-[#44CCFF] mb-4 relative z-10">GALACTIC SPINS</h2>
      
      {/* Slot machine reels */}
      <div className="grid grid-cols-5 gap-2 mb-6 relative z-10">
        {reels.map((reel, reelIndex) => (
          <div key={reelIndex} className="relative">
            <div className="w-16 h-48 bg-[#161B36] rounded-md flex flex-col overflow-hidden border border-[#2A3F7A]">
              {reel.map((symbol, symbolIndex) => (
                <div 
                  key={symbolIndex}
                  className={`flex-1 flex items-center justify-center ${getSymbolBackground(symbol)} border-b border-[#2A3F7A] last:border-b-0`}
                >
                  <div className={`text-3xl ${getSymbolColor(symbol)} ${isSpinning ? 'animate-pulse' : ''}`}>
                    {getSymbolEmoji(symbol)}
                  </div>
                </div>
              ))}
            </div>
            
            {spinResults?.win && spinResults?.expandingWilds.includes(reelIndex) && (
              <div className="absolute inset-0 bg-purple-600 bg-opacity-30 flex items-center justify-center rounded-md z-20 animate-pulse">
                <div className="text-white font-bold text-lg rotate-12">WILD</div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Win display */}
      {spinResults?.win && (
        <div className="text-center mb-4 relative z-10">
          <div className="text-2xl text-yellow-400 font-bold animate-bounce">
            WIN! {spinResults.winAmount.toFixed(2)} INR
          </div>
          {spinResults.bonusTriggered && (
            <div className="text-lg text-purple-400 font-bold mt-1">
              BONUS ROUND TRIGGERED!
            </div>
          )}
        </div>
      )}
      
      {/* Spin button */}
      <button
        onClick={onSpin}
        disabled={isSpinning}
        className={`px-8 py-3 rounded-full font-bold text-white relative z-10 ${
          isSpinning 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-[#44CCFF] to-[#3388FF] hover:opacity-90'
        }`}
      >
        {isSpinning ? 'SPINNING...' : 'SPIN'}
      </button>
      
      {/* Sound indicator */}
      <div className="absolute bottom-2 right-2 text-gray-400 text-sm">
        {soundEnabled ? '🔊 Sound On' : '🔇 Sound Off'}
      </div>
    </div>
  );
};

export default GalacticSpinsGame;