/**
 * Utility functions for handling bet amounts and conversions
 * This addresses the issue where bet amounts are not properly processed
 */

/**
 * Ensures a bet amount is a valid number
 * Handles various input formats (string, number, etc.) and converts to a numeric value
 * 
 * @param amount - The bet amount to normalize
 * @returns The normalized bet amount as a number
 */
export function normalizeBetAmount(amount: any): number {
  // Handle string inputs (common from form data)
  if (typeof amount === 'string') {
    // Remove commas, currency symbols, etc.
    const cleanedAmount = amount.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleanedAmount);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Handle numeric inputs
  if (typeof amount === 'number') {
    return isNaN(amount) ? 0 : amount;
  }
  
  // Handle object inputs (sometimes they come from JSON parsing)
  if (typeof amount === 'object' && amount !== null) {
    // If the object has a numeric property that represents the amount
    if ('amount' in amount && typeof amount.amount !== 'undefined') {
      return normalizeBetAmount(amount.amount);
    }
    
    // If the object has a toString method, try using that
    if (typeof amount.toString === 'function') {
      const stringValue = amount.toString();
      if (stringValue !== '[object Object]') {
        return normalizeBetAmount(stringValue);
      }
    }
  }
  
  // Default fallback - return 0 for invalid inputs
  return 0;
}

/**
 * Validates a bet amount meets minimum requirements
 * 
 * @param amount - The bet amount to validate
 * @param minBet - The minimum bet amount allowed (default: 100)
 * @returns Object with validation result and message
 */
export function validateBetAmount(amount: number, minBet: number = 100): { valid: boolean; message?: string } {
  // Normalize the amount first
  const normalizedAmount = normalizeBetAmount(amount);
  
  // Check for valid positive number
  if (normalizedAmount <= 0) {
    return { 
      valid: false, 
      message: 'Bet amount must be greater than 0' 
    };
  }
  
  // Check for minimum bet requirement
  if (normalizedAmount < minBet) {
    return { 
      valid: false, 
      message: `Bet amount must be at least ₹${minBet}` 
    };
  }
  
  // Passed all checks
  return { valid: true };
}

/**
 * Converts any bet amount to a canonical number format
 * Use this for all bet processing to ensure consistency
 * 
 * @param amount - The bet amount to canonicalize
 * @param minBet - Optional minimum bet to enforce (default: undefined)
 * @returns The canonicalized bet amount as a number
 */
export function canonicalizeBetAmount(amount: any, minBet?: number): number {
  const normalized = normalizeBetAmount(amount);
  
  // If minBet is provided, enforce the minimum
  if (typeof minBet === 'number' && minBet > 0) {
    return Math.max(normalized, minBet);
  }
  
  return normalized;
}

/**
 * Deep-inspects and extracts a bet amount from a potentially nested object
 * Useful for complex request bodies
 * 
 * @param data - The object to extract bet amount from
 * @returns The extracted bet amount as a number
 */
export function extractBetAmount(data: any): number {
  // If data is a primitive, normalize it directly
  if (typeof data !== 'object' || data === null) {
    return normalizeBetAmount(data);
  }
  
  // Check common property names for bet amounts
  const amountProperties = ['amount', 'betAmount', 'bet', 'value', 'stake'];
  
  for (const prop of amountProperties) {
    if (prop in data && data[prop] !== undefined) {
      return normalizeBetAmount(data[prop]);
    }
  }
  
  // For complex nested objects, try to find any property that might contain the amount
  for (const key in data) {
    if (typeof data[key] === 'object' && data[key] !== null) {
      // Recursively search nested objects
      const nestedAmount = extractBetAmount(data[key]);
      if (nestedAmount > 0) {
        return nestedAmount;
      }
    } else if (
      (typeof data[key] === 'number' || typeof data[key] === 'string') && 
      key.toLowerCase().includes('amount')
    ) {
      // If the property name contains 'amount', it's likely the bet amount
      return normalizeBetAmount(data[key]);
    }
  }
  
  // If no amount found, return 0
  return 0;
}

/**
 * Calculates winnings based on bet amount and multiplier
 * 
 * @param betAmount - The original bet amount
 * @param multiplier - The win multiplier
 * @returns The total winnings amount (original bet × multiplier)
 */
export function calculateWinnings(betAmount: number, multiplier: number): number {
  const normalizedBet = normalizeBetAmount(betAmount);
  const normalizedMultiplier = normalizeBetAmount(multiplier);
  
  return normalizedBet * normalizedMultiplier;
}