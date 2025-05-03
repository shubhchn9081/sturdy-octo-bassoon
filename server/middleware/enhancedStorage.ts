/**
 * Enhanced storage middleware to improve balance updates with consistent number conversions
 */
import { storage } from '../storage';
import { normalizeBetAmount } from '../utils/betUtils';

// Store the original method so we can call it
const originalUpdateUserBalance = storage.updateUserBalance;

// Override the updateUserBalance method with our enhanced version
storage.updateUserBalance = async (id: number, amount: any, currency: string = 'INR') => {
  // Use our robust normalization to ensure amount is always a proper number
  const normalizedAmount = normalizeBetAmount(amount);
  
  // Ensure currency is uppercase
  const normalizedCurrency = currency ? currency.toUpperCase() : 'INR';
  
  // Add Logging for troubleshooting
  console.log(`Enhanced updateUserBalance - User ID: ${id}, Original amount: ${amount}, Normalized: ${normalizedAmount}, Currency: ${normalizedCurrency}`);
  
  // Get the user's current balance for logging
  const user = await storage.getUser(id);
  if (user) {
    let currentBalance = 0;
    if (typeof user.balance === 'number') {
      currentBalance = user.balance;
    } else if (typeof user.balance === 'object' && user.balance !== null) {
      const balanceObj = user.balance as Record<string, number>;
      currentBalance = balanceObj[normalizedCurrency] || 0;
    }
    console.log(`Current balance before update: ${currentBalance}, Will be after: ${currentBalance + normalizedAmount}`);
  }
  
  // Call the original method with our normalized values
  return originalUpdateUserBalance.call(storage, id, normalizedAmount, normalizedCurrency);
};

// Store the original setUserBalance method if it exists
const originalSetUserBalance = storage.setUserBalance;

// Override setUserBalance too if it exists
if (originalSetUserBalance) {
  storage.setUserBalance = async (id: number, exactAmount: any, currency: string = 'INR') => {
    // Use our robust normalization to ensure amount is always a proper number
    const normalizedAmount = normalizeBetAmount(exactAmount);
    
    // Ensure currency is uppercase
    const normalizedCurrency = currency ? currency.toUpperCase() : 'INR';
    
    // Add Logging for troubleshooting
    console.log(`Enhanced setUserBalance - User ID: ${id}, Original amount: ${exactAmount}, Normalized: ${normalizedAmount}, Currency: ${normalizedCurrency}`);
    
    // Call the original method with our normalized values
    return originalSetUserBalance.call(storage, id, normalizedAmount, normalizedCurrency);
  };
}

// Export the enhanced storage object (same reference as the original)
export { storage as enhancedStorage };