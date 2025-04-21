/**
 * Global type definitions for the application.
 * This file extends the Window interface to include our global
 * balance and bet functions.
 */

import { PlaceBetParams, CompleteBetParams } from '@/hooks/use-balance';
import { UseMutationResult } from '@tanstack/react-query';

// Extend the Window interface to include our global functions
declare global {
  interface Window {
    // Balance functions passed from the CrashFinal component
    placeBetFunction?: {
      placeBet: {
        mutate: (
          params: PlaceBetParams, 
          callbacks?: { 
            onSuccess?: (response: any) => void, 
            onError?: (error: any) => void 
          }
        ) => void
      }
    };
    
    completeBetFunction?: {
      completeBet: {
        mutate: (
          params: CompleteBetParams,
          callbacks?: {
            onSuccess?: (response: any) => void,
            onError?: (error: any) => void
          }
        ) => void
      }
    };
  }
}

// Export as a module to make TypeScript treat this as a module
export {};