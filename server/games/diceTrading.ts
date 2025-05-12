import { calculateDiceRoll } from './provably-fair';
import { gameOutcomeControl } from '../middleware/gameOutcomeControl';

export interface DiceTradingParams {
  betAmount: number;
  minRange: number;  // Min value of the range
  maxRange: number;  // Max value of the range
}

export interface DiceTradingOutcome {
  result: number;     // The random dice result (0-100)
  win: boolean;       // Whether the player won
  minRange: number;   // Min value of player's range
  maxRange: number;   // Max value of player's range
  multiplier: number; // Payout multiplier
}

export function generateDiceTradingOutcome(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  params: DiceTradingParams,
  isControlled: boolean = false,
  controlOptions: any = {}
): DiceTradingOutcome {
  let result: number;
  let win: boolean;
  
  const rangeSize = params.maxRange - params.minRange;
  const multiplier = 100 / rangeSize;
  
  // Check if the game outcome should be controlled
  if (isControlled && controlOptions) {
    // Handle admin-controlled outcome (force win/lose or specific result)
    if (controlOptions.forceWin) {
      // For a forced win, generate a random number within the player's range
      result = Math.floor(Math.random() * (params.maxRange - params.minRange + 1)) + params.minRange;
      win = true;
    } else if (controlOptions.forceLose) {
      // For a forced loss, generate a random number outside the player's range
      if (Math.random() < 0.5 && params.minRange > 0) {
        // Generate below the range
        result = Math.floor(Math.random() * params.minRange);
      } else {
        // Generate above the range
        result = Math.floor(Math.random() * (100 - params.maxRange)) + params.maxRange + 1;
      }
      win = false;
    } else if (controlOptions.exactResult !== undefined) {
      // Use the exact specified result
      result = controlOptions.exactResult;
      win = result >= params.minRange && result <= params.maxRange;
    } else {
      // If no specific control is specified, fall back to fair generation
      result = calculateDiceRoll(serverSeed, clientSeed, nonce);
      win = result >= params.minRange && result <= params.maxRange;
    }
  } else {
    // Fair outcome generation
    result = calculateDiceRoll(serverSeed, clientSeed, nonce);
    win = result >= params.minRange && result <= params.maxRange;
  }
  
  return {
    result,
    win,
    minRange: params.minRange,
    maxRange: params.maxRange,
    multiplier
  };
}