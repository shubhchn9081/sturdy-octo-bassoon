/**
 * Slot Machine Asset Manager
 * 
 * This module manages the loading and configuration of slot machine assets
 * from external services.
 */

// Interface for asset mapping
export interface SlotSymbolAsset {
  id: string;        // Symbol identifier (e.g., "7", "cherry", "diamond")
  emoji: string;     // Emoji fallback (used until image loads)
  imageUrl: string;  // URL to the image asset
  name: string;      // Display name for the symbol
  value: number;     // Base value for symbol (used in payouts calculation)
}

// Interface for theme configuration
export interface SlotThemeAsset {
  id: string;
  name: string;
  symbols: SlotSymbolAsset[];
  background?: string;
  reelBackground?: string;
  soundEffects?: {
    spin?: string;
    win?: string;
    bigWin?: string;
    reelStop?: string;
  }
}

// Cosmic Spins Assets (Space Theme)
const cosmicSpinsAssets: SlotThemeAsset = {
  id: 'cosmic-spins',
  name: 'Cosmic Spins',
  symbols: [
    { 
      id: 'planet', 
      emoji: '🪐',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/5229/5229377.png', 
      name: 'Planet', 
      value: 5 
    },
    { 
      id: 'star', 
      emoji: '⭐',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3110/3110061.png', 
      name: 'Star', 
      value: 4 
    },
    { 
      id: 'rocket', 
      emoji: '🚀',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3212/3212567.png', 
      name: 'Rocket', 
      value: 8 
    },
    { 
      id: 'astronaut', 
      emoji: '👨‍🚀',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/4624/4624025.png', 
      name: 'Astronaut', 
      value: 10 
    },
    { 
      id: 'alien', 
      emoji: '👾',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/1047/1047711.png', 
      name: 'Alien', 
      value: 15 
    },
    { 
      id: 'ufo', 
      emoji: '🛸',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/1055/1055318.png', 
      name: 'UFO', 
      value: 20 
    },
    { 
      id: 'meteor', 
      emoji: '☄️',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/7927/7927091.png', 
      name: 'Meteor', 
      value: 7 
    },
    { 
      id: 'galaxy', 
      emoji: '🌌',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3049/3049465.png', 
      name: 'Galaxy', 
      value: 25 
    }
  ],
  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
  reelBackground: 'linear-gradient(to bottom, rgba(30, 58, 138, 0.8), rgba(15, 23, 42, 0.9))'
};

// Temple Quest Assets (Adventure Theme)
const templeQuestAssets: SlotThemeAsset = {
  id: 'temple-quest',
  name: 'Temple Quest',
  symbols: [
    { 
      id: 'temple', 
      emoji: '🏰',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/9289/9289961.png', 
      name: 'Temple', 
      value: 20 
    },
    { 
      id: 'treasure', 
      emoji: '💰',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/6963/6963441.png', 
      name: 'Treasure', 
      value: 25 
    },
    { 
      id: 'map', 
      emoji: '🗺️',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2426/2426643.png', 
      name: 'Map', 
      value: 15 
    },
    { 
      id: 'explorer', 
      emoji: '🧙',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/4350/4350938.png', 
      name: 'Explorer', 
      value: 10 
    },
    { 
      id: 'snake', 
      emoji: '🐍',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/4380/4380458.png', 
      name: 'Snake', 
      value: 7 
    },
    { 
      id: 'torch', 
      emoji: '🔥',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/5637/5637217.png', 
      name: 'Torch', 
      value: 5 
    },
    { 
      id: 'scroll', 
      emoji: '📜',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/4668/4668479.png', 
      name: 'Scroll', 
      value: 4 
    },
    { 
      id: 'shield', 
      emoji: '🛡️',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2271/2271090.png', 
      name: 'Shield', 
      value: 3 
    }
  ],
  background: 'linear-gradient(135deg, #422006 0%, #854d0e 100%)',
  reelBackground: 'linear-gradient(to bottom, rgba(133, 77, 14, 0.8), rgba(66, 32, 6, 0.9))'
};

// Lucky Sevens Assets (Classic Theme)
const luckySevenAssets: SlotThemeAsset = {
  id: 'lucky-sevens',
  name: 'Lucky Sevens',
  symbols: [
    { 
      id: 'seven', 
      emoji: '7️⃣',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2451/2451754.png', 
      name: 'Seven', 
      value: 25 
    },
    { 
      id: 'cherry', 
      emoji: '🍒',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/1141/1141061.png', 
      name: 'Cherry', 
      value: 10 
    },
    { 
      id: 'bell', 
      emoji: '🔔',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3984/3984550.png', 
      name: 'Bell', 
      value: 15 
    },
    { 
      id: 'bar', 
      emoji: '📊',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/138/138528.png', 
      name: 'Bar', 
      value: 20 
    },
    { 
      id: 'diamond', 
      emoji: '💎',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/1170/1170729.png', 
      name: 'Diamond', 
      value: 25 
    },
    { 
      id: 'horseshoe', 
      emoji: '🧲',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/806/806651.png', 
      name: 'Horseshoe', 
      value: 15 
    },
    { 
      id: 'clover', 
      emoji: '🍀',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/362/362466.png', 
      name: 'Clover', 
      value: 10 
    },
    { 
      id: 'crown', 
      emoji: '👑',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png', 
      name: 'Crown', 
      value: 20 
    }
  ],
  background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)',
  reelBackground: 'linear-gradient(to bottom, rgba(63, 63, 70, 0.8), rgba(24, 24, 27, 0.9))'
};

// Dragon's Gold Assets (Fantasy Theme)
const dragonsGoldAssets: SlotThemeAsset = {
  id: 'dragons-gold',
  name: 'Dragon\'s Gold',
  symbols: [
    { 
      id: 'dragon', 
      emoji: '🐉',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2267/2267873.png', 
      name: 'Dragon', 
      value: 25 
    },
    { 
      id: 'gold', 
      emoji: '🏆',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3414/3414859.png', 
      name: 'Gold', 
      value: 20 
    },
    { 
      id: 'sword', 
      emoji: '🗡️',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2976/2976510.png', 
      name: 'Sword', 
      value: 15 
    },
    { 
      id: 'wizard', 
      emoji: '🧙‍♂️',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/4370/4370072.png', 
      name: 'Wizard', 
      value: 15 
    },
    { 
      id: 'castle', 
      emoji: '🏰',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/5172/5172585.png', 
      name: 'Castle', 
      value: 10 
    },
    { 
      id: 'potion', 
      emoji: '🧪',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/5777/5777350.png', 
      name: 'Potion', 
      value: 8 
    },
    { 
      id: 'shield', 
      emoji: '🛡️',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/2604/2604396.png', 
      name: 'Shield', 
      value: 7 
    },
    { 
      id: 'book', 
      emoji: '📕',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3330/3330314.png', 
      name: 'Book', 
      value: 5 
    }
  ],
  background: 'linear-gradient(135deg, #3b0764 0%, #7e22ce 100%)',
  reelBackground: 'linear-gradient(to bottom, rgba(126, 34, 206, 0.8), rgba(59, 7, 100, 0.9))'
};

// Football Frenzy Assets (Sports Theme)
const footballFrenzyAssets: SlotThemeAsset = {
  id: 'football-frenzy',
  name: 'Football Frenzy',
  symbols: [
    { 
      id: 'football', 
      emoji: '⚽',
      imageUrl: 'https://img.icons8.com/fluency/96/football2.png', 
      name: 'Football', 
      value: 20 
    },
    { 
      id: 'trophy', 
      emoji: '🏆',
      imageUrl: 'https://img.icons8.com/fluency/96/trophy.png', 
      name: 'Trophy', 
      value: 25 
    },
    { 
      id: 'whistle', 
      emoji: '🔔',
      imageUrl: 'https://img.icons8.com/fluency/96/whistle.png', 
      name: 'Whistle', 
      value: 15 
    },
    { 
      id: 'jersey', 
      emoji: '👕',
      imageUrl: 'https://img.icons8.com/fluency/96/t-shirt.png', 
      name: 'Jersey', 
      value: 10 
    },
    { 
      id: 'stadium', 
      emoji: '🏟️',
      imageUrl: 'https://img.icons8.com/fluency/96/stadium.png', 
      name: 'Stadium', 
      value: 15 
    },
    { 
      id: 'boots', 
      emoji: '👟',
      imageUrl: 'https://img.icons8.com/fluency/96/sneakers.png', 
      name: 'Boots', 
      value: 8 
    },
    { 
      id: 'goal', 
      emoji: '🥅',
      imageUrl: 'https://img.icons8.com/fluency/96/goal-net.png', 
      name: 'Goal', 
      value: 10 
    },
    { 
      id: 'gloves', 
      emoji: '🧤',
      imageUrl: 'https://img.icons8.com/fluency/96/gloves.png', 
      name: 'Gloves', 
      value: 7 
    }
  ],
  background: 'linear-gradient(135deg, #022c22 0%, #0d9488 100%)',
  reelBackground: 'linear-gradient(to bottom, rgba(13, 148, 136, 0.8), rgba(2, 44, 34, 0.9))'
};

// Map of all themes
export const slotThemes: Record<string, SlotThemeAsset> = {
  'cosmic-spins': cosmicSpinsAssets,
  'temple-quest': templeQuestAssets,
  'lucky-sevens': luckySevenAssets,
  'dragons-gold': dragonsGoldAssets,
  'football-frenzy': footballFrenzyAssets
};

// Helper to get a theme by ID
export function getSlotThemeById(themeId: string): SlotThemeAsset | undefined {
  return slotThemes[themeId];
}

// Helper to get emoji from symbol ID for a specific theme
export function getSymbolEmoji(themeId: string, symbolId: string): string {
  const theme = slotThemes[themeId];
  if (!theme) return '❓';
  
  const symbol = theme.symbols.find(s => s.id === symbolId);
  return symbol ? symbol.emoji : '❓';
}

// Helper to get image URL from symbol ID for a specific theme
export function getSymbolImageUrl(themeId: string, symbolId: string): string | undefined {
  const theme = slotThemes[themeId];
  if (!theme) return undefined;
  
  const symbol = theme.symbols.find(s => s.id === symbolId);
  return symbol ? symbol.imageUrl : undefined;
}

// Symbol component props
export interface SymbolProps {
  themeId: string;
  symbolId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Function to convert emoji to symbol ID
export function emojiToSymbolId(themeId: string, emoji: string): string | undefined {
  const theme = slotThemes[themeId];
  if (!theme) return undefined;
  
  const symbol = theme.symbols.find(s => s.emoji === emoji);
  return symbol ? symbol.id : undefined;
}

// Function to convert symbol ID to emoji
export function symbolIdToEmoji(themeId: string, symbolId: string): string {
  const theme = slotThemes[themeId];
  if (!theme) return '❓';
  
  const symbol = theme.symbols.find(s => s.id === symbolId);
  return symbol ? symbol.emoji : '❓';
}

// Function to load all images for a theme (for preloading)
export function preloadThemeImages(themeId: string): Promise<void[]> {
  const theme = slotThemes[themeId];
  if (!theme) return Promise.resolve([]);
  
  return Promise.all(
    theme.symbols.map(symbol => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Still resolve even if error
        img.src = symbol.imageUrl;
      });
    })
  );
}

// Convert old emoji-based config to new asset-based config
export function convertEmojiConfigToAssetConfig(themeId: string, emojiSymbols: string[]): string[] {
  const theme = slotThemes[themeId];
  if (!theme) return emojiSymbols;
  
  return emojiSymbols.map(emoji => {
    const symbolId = emojiToSymbolId(themeId, emoji);
    return symbolId || emoji; // Fallback to emoji if no match
  });
}

// Attribution notice - IMPORTANT
// The icons used in this demo are provided by Flaticon
// This should be displayed in production applications:
export const attribution = "Icons provided by Flaticon (https://www.flaticon.com)";