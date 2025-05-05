// Game utility functions for various games

// Dice game
export function calculateDiceResult(serverSeed: string, clientSeed: string, nonce: number): number {
  // In a real implementation, this would use the provably fair algorithm
  // For now, return a value between 0 and 100
  return parseFloat((Math.random() * 100).toFixed(2));
}

// Mines game
export function placeMines(totalSquares: number, mineCount: number): number[] {
  const mines: number[] = [];
  while (mines.length < mineCount) {
    const mine = Math.floor(Math.random() * totalSquares);
    if (!mines.includes(mine)) {
      mines.push(mine);
    }
  }
  return mines;
}

// Plinko
export function simulatePlinkoPath(rows: number): number[] {
  const path: number[] = [];
  let position = 0;
  
  for (let i = 0; i < rows; i++) {
    // For each row, randomly go left (0) or right (1)
    const direction = Math.round(Math.random());
    position += direction;
    path.push(position);
  }
  
  return path;
}

export function getPlinkoMultiplier(path: number[], risk: string, rows: number): number {
  // Different multiplier tables based on risk level
  const multiplierTables = {
    low: [1, 1.1, 1.3, 1.5, 2, 3, 5, 9, 5, 3, 2, 1.5, 1.3, 1.1, 1],
    medium: [0.5, 0.8, 1, 1.5, 2, 5, 15, 45, 15, 5, 2, 1.5, 1, 0.8, 0.5],
    high: [0.2, 0.3, 0.5, 1, 2, 5, 10, 100, 10, 5, 2, 1, 0.5, 0.3, 0.2]
  };
  
  // Get the final position (index) in the multiplier table
  const finalPosition = path[path.length - 1];
  const table = multiplierTables[risk as keyof typeof multiplierTables] || multiplierTables.medium;
  
  // Adjust based on row count
  const adjustedPosition = Math.min(finalPosition, table.length - 1);
  
  return table[adjustedPosition];
}

// Crash
export function calculateCrashPoint(): number {
  // Generate crash point with 100% RTP (no house edge)
  // Formula: (1 / (1 - random))
  // where random is a number between 0 and 1.0
  const random = Math.min(1.0, Math.random());
  return parseFloat((1 / (1 - random)).toFixed(2));
}

// Limbo
export function calculateLimboResult(): number {
  // Similar to crash but with different distribution
  // Now using 100% RTP (no house edge)
  const random = Math.random();
  return parseFloat((1 / (1 - random)).toFixed(2));
}

// Dragon Tower
export function generateDragonTowerPath(difficulty: string): number[] {
  const heights = {
    easy: 5,
    medium: 8,
    hard: 12
  };
  
  const height = heights[difficulty as keyof typeof heights] || heights.medium;
  const path: number[] = [];
  
  // Generate safe positions for each level
  for (let i = 0; i < height; i++) {
    path.push(Math.floor(Math.random() * 3)); // 3 positions per row
  }
  
  return path;
}

// Blue Samurai (slot game)
export function spinSlotReels(): number[][] {
  // 5 reels with 3 visible symbols each
  const reels: number[][] = [];
  
  for (let i = 0; i < 5; i++) {
    const reel: number[] = [];
    for (let j = 0; j < 3; j++) {
      // 0-9 represent different symbols
      reel.push(Math.floor(Math.random() * 10));
    }
    reels.push(reel);
  }
  
  return reels;
}

export function calculateSlotPaylines(reels: number[][]): number[][] {
  // Simplified payline calculation
  const paylines: number[][] = [];
  
  // Horizontal lines
  for (let row = 0; row < 3; row++) {
    if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
      paylines.push([row, row, row, -1, -1]);
    }
  }
  
  // Diagonal lines
  if (reels[0][0] === reels[1][1] && reels[1][1] === reels[2][2]) {
    paylines.push([0, 1, 2, -1, -1]);
  }
  
  return paylines;
}

// Pump
export function simulatePump(difficulty: string): number {
  // Difficulty affects how high the multiplier can go before popping
  const difficultyModifiers = {
    easy: 5,
    medium: 3,
    hard: 1.5
  };
  
  const modifier = difficultyModifiers[difficulty as keyof typeof difficultyModifiers] || difficultyModifiers.medium;
  
  // Random point where the balloon pops
  return parseFloat((Math.random() * 10 * modifier).toFixed(2));
}

// Hilo
export function dealCard(excludeCard?: number): number {
  // Return card from 0-51 (0-12: clubs, 13-25: diamonds, 26-38: hearts, 39-51: spades)
  let card = Math.floor(Math.random() * 52);
  
  // Make sure we don't deal the same card twice
  while (card === excludeCard) {
    card = Math.floor(Math.random() * 52);
  }
  
  return card;
}

export function isHigher(currentCard: number, nextCard: number): boolean {
  // Compare card ranks (0-12, 13-25, etc.)
  const currentRank = currentCard % 13;
  const nextRank = nextCard % 13;
  
  return nextRank > currentRank;
}
