import { CupAndBallOutcome } from "@shared/schema";
import { createHash } from "crypto";

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  easy: {
    shuffleMoves: 5,
    animationSpeed: 1.5, // seconds
    payoutMultiplier: 1.5
  },
  medium: {
    shuffleMoves: 10,
    animationSpeed: 1.0, // seconds
    payoutMultiplier: 2.0
  },
  hard: {
    shuffleMoves: 15,
    animationSpeed: 0.7, // seconds
    payoutMultiplier: 3.0
  }
};

// Types for our game
interface CupAndBallBetParams {
  difficulty: keyof typeof DIFFICULTY_LEVELS;
  selectedCup: number; // 0, 1, or 2 (left, middle, right)
  betAmount: number;
}

// Generate a random number between min and max based on a seed
function generateRandomNumber(min: number, max: number, seed: string): number {
  const hash = createHash("sha256").update(seed).digest("hex");
  const decimalValue = parseInt(hash.substring(0, 8), 16);
  
  // Normalize to [0, 1) range
  const normalizedValue = decimalValue / 0xffffffff;
  
  // Scale to the desired range
  return Math.floor(normalizedValue * (max - min + 1)) + min;
}

// Generate shuffle moves
function generateShuffleMoves(numMoves: number, seed: string): number[] {
  const moves: number[] = [];
  
  for (let i = 0; i < numMoves; i++) {
    // Each shuffle is a pair of cups to swap (0-1, 1-2, or 0-2)
    const moveSeed = `${seed}-move-${i}`;
    const moveType = generateRandomNumber(0, 2, moveSeed);
    
    // 0: swap cups 0-1, 1: swap cups 1-2, 2: swap cups 0-2
    moves.push(moveType);
  }
  
  return moves;
}

// Process the cup and ball bet
export function processCupAndBallBet(
  params: CupAndBallBetParams,
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  forcedOutcome?: {
    forcedBallPosition?: number;
    forceLose?: boolean;
  }
): {
  outcome: CupAndBallOutcome;
  payout: number;
} {
  // Validate input
  if (params.selectedCup < 0 || params.selectedCup > 2) {
    throw new Error("Invalid cup selection. Must be 0, 1, or 2.");
  }
  
  if (!DIFFICULTY_LEVELS[params.difficulty]) {
    throw new Error("Invalid difficulty level");
  }
  
  // Combined seed for this game
  const combinedSeed = `${serverSeed}-${clientSeed}-${nonce}`;
  
  // Initial ball position (0, 1, or 2)
  let ballPosition: number;
  
  // If we have a forced outcome, use it
  if (forcedOutcome && typeof forcedOutcome.forcedBallPosition === 'number') {
    ballPosition = forcedOutcome.forcedBallPosition;
    if (ballPosition < 0 || ballPosition > 2) {
      throw new Error("Invalid forced ball position");
    }
  } else {
    // Generate random initial position
    ballPosition = generateRandomNumber(0, 2, `${combinedSeed}-initial`);
  }
  
  // Generate shuffle moves based on the difficulty
  const difficultySettings = DIFFICULTY_LEVELS[params.difficulty];
  const shuffleMoves = generateShuffleMoves(difficultySettings.shuffleMoves, combinedSeed);
  
  // Simulate the shuffling to determine final ball position
  let currentBallPosition = ballPosition;
  
  for (const moveType of shuffleMoves) {
    // Apply the shuffle move
    if (moveType === 0) { // Swap cups 0-1
      if (currentBallPosition === 0) currentBallPosition = 1;
      else if (currentBallPosition === 1) currentBallPosition = 0;
    } else if (moveType === 1) { // Swap cups 1-2
      if (currentBallPosition === 1) currentBallPosition = 2;
      else if (currentBallPosition === 2) currentBallPosition = 1;
    } else { // Swap cups 0-2
      if (currentBallPosition === 0) currentBallPosition = 2;
      else if (currentBallPosition === 2) currentBallPosition = 0;
    }
  }
  
  // Determine if player won
  let win = params.selectedCup === currentBallPosition;
  
  // If there's a force lose override, apply it
  if (forcedOutcome && forcedOutcome.forceLose) {
    win = false;
    
    // If player would have won, move the ball to a different cup
    if (params.selectedCup === currentBallPosition) {
      currentBallPosition = (currentBallPosition + 1) % 3;
    }
  }
  
  // Calculate payout
  const payoutMultiplier = DIFFICULTY_LEVELS[params.difficulty].payoutMultiplier;
  const payout = win ? params.betAmount * payoutMultiplier : 0;
  
  // Create outcome object
  const outcome: CupAndBallOutcome = {
    ballPosition: currentBallPosition,
    selectedCup: params.selectedCup,
    difficulty: params.difficulty,
    win,
    shuffleMoves
  };
  
  return {
    outcome,
    payout
  };
}