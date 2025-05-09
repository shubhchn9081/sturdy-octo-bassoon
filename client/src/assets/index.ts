/**
 * APay Integration Package
 * 
 * This package contains all the necessary files for integrating APay payment gateway
 * into a React/Express TypeScript application.
 * 
 * Usage:
 * 1. Server-side: Import and configure the apay.ts router in your Express app
 * 2. Client-side: Use the APay component or ApayPaymentForm in your React app
 * 
 * Key endpoints:
 * - POST /api/apay/create-payment - Create a new payment
 * - POST /api/apay/callback - Handle payment callbacks
 * - GET /api/apay/transaction/:reference - Get transaction status
 * - GET /api/apay/verify/:transactionId - Verify a transaction
 * 
 * @see README.md for full documentation
 */

// Export all the necessary components and types
export * from './client';
export { APay } from './apay-payment';
export { ApayPaymentForm } from './ApayPaymentForm';

// Note: The server-side router needs to be manually integrated into your Express app
