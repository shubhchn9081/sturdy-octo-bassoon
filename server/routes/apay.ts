import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { log } from '../vite';

// APay payment gateway integration
const router = Router();

// APay credentials
const APAY_API_KEY = 'bf98021c67b8c6e602e1dc79e9f5e5d2';
const APAY_PROJECT_ID = '8726739';
const APAY_WEBHOOK_ID = '6800481';
const APAY_WEBHOOK_ACCESS_KEY = 'a4ca3d00c3c9c72d05a31c9d61b65ab3';
const APAY_WEBHOOK_PRIVATE_KEY = 'b29ba4c0f2b873b7a9d5d5fca88f5a1d';

// API endpoint for APay
const APAY_ENDPOINT = 'https://pay-crm.com';

// Callback and redirect URLs
const APAY_CALLBACK_URL = '/apay/callback';
const APAY_SUCCESS_REDIRECT = '/payment-success';
const APAY_FAILURE_REDIRECT = '/payment-failure';

// Generate a unique transaction ID
function generateTransactionId(): string {
  return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create a new payment request
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { amount, userId, transactionId } = req.body;
    
    // Validate required fields
    if (!amount || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required parameters' 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be greater than 0' 
      });
    }
    
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    // Create a transaction record with "pending" status
    const finalTransactionId = transactionId || generateTransactionId();
    await storage.createTransaction({
      userId,
      type: 'deposit',
      amount,
      currency: 'INR',
      status: 'pending',
      txid: finalTransactionId,
      description: 'Deposit via APay'
    });
    
    // Get base URL for callback and return URLs
    const baseUrl = req.protocol + '://' + req.get('host');
    
    // Prepare payment request to APay
    try {
      // Create payload according to APay documentation
      const paymentPagePayload = {
        amount: amount,
        currency: 'INR',
        payment_system: ['upi_fast', 'upi_p2p'],
        custom_transaction_id: finalTransactionId,
        custom_user_id: userId.toString(),
        return_url: `${baseUrl}${APAY_SUCCESS_REDIRECT}?ref=${finalTransactionId}`,
        webhook_id: APAY_WEBHOOK_ID,
        language: 'EN'
      };
      
      log(`Making API call to APay for payment creation`, 'apay');
      
      // Make the API call to APay
      const endpoint = `${APAY_ENDPOINT}/Remotes/create-payment-page`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'apikey': APAY_API_KEY
        },
        body: JSON.stringify(paymentPagePayload)
      });
      
      // Handle the response
      const paymentResponse = await response.json();
      
      if (!response.ok || !paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to create payment with APay');
      }
      
      log(`Successfully created payment with APay`, 'apay');
      
      // Return the payment URL to the client
      return res.status(200).json({
        success: true,
        payment_id: paymentResponse.order_id,
        payment_url: paymentResponse.url
      });
    } catch (err: any) {
      log(`APay API error: ${err.message}`, 'apay');
      throw err;
    }
  } catch (error: any) {
    console.error('APay payment creation error:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: process.env.NODE_ENV === 'production' 
        ? 'Payment service temporarily unavailable. Please try again later.' 
        : error?.message || 'Internal server error'
    });
  }
});

// Handle payment callback from APay
router.post('/callback', async (req: Request, res: Response) => {
  try {
    // Expected callback parameters from APay
    const { 
      order_id, // Our transactionId
      status, 
      amount, 
      payment_id,
      webhook_id, 
      access_key,
      utr_number, // Unique transaction reference from bank
      payment_method
    } = req.body;
    
    // Log the received callback data
    log(`Received APay callback: ${JSON.stringify(req.body)}`, 'apay');
    
    // Verify webhook credentials
    if (webhook_id !== APAY_WEBHOOK_ID || access_key !== APAY_WEBHOOK_ACCESS_KEY) {
      log(`Invalid webhook credentials. Expected webhook_id: ${APAY_WEBHOOK_ID}`, 'apay');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    if (!order_id || !status) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    // Map APay status to our internal status
    let internalStatus = status;
    if (status === 'COMPLETED' || status === 'SUCCESSFUL') {
      internalStatus = 'completed';
    } else if (status === 'FAILED' || status === 'DECLINED') {
      internalStatus = 'failed';
    }
    
    // Find the transaction by txid
    const transactions = await storage.getAllTransactions();
    const transaction = transactions.find(t => t.txid === order_id);
    
    if (!transaction) {
      log(`Transaction not found for order_id ${order_id}`, 'apay');
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    // Update transaction status
    const updatedTransaction = await storage.updateTransactionStatus(transaction.id, internalStatus);
    
    // If payment is successful, update user balance
    if (internalStatus === 'completed') {
      const user = await storage.getUser(transaction.userId);
      
      if (user) {
        const creditAmount = Number(amount || transaction.amount);
        await storage.updateUserBalance(user.id, creditAmount);
        log(`Updated balance for user ${user.id} with amount ₹${creditAmount}`, 'apay');
      }
    }
    
    // Log the successful processing
    log(`APay payment callback processed: order_id=${order_id}, status=${internalStatus}, payment_id=${payment_id}`, 'apay');
    
    // Always return 200 to APay to acknowledge receipt
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('APay callback error:', error);
    // Still return 200 to avoid APay retrying (we'll handle errors internally)
    log(`APay callback error: ${error?.message}`, 'apay');
    return res.status(200).json({ success: true, internal_error: true });
  }
});

// Get transaction status by reference ID
router.get('/transaction/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // Find all transactions for the user
    const transactions = await storage.getUserTransactions(req.user.id);
    
    // Find the specific transaction by txid
    const transaction = transactions.find(t => t.txid === reference);
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      transaction 
    });
  } catch (error: any) {
    console.error('Get transaction error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error?.message || 'Internal server error' 
    });
  }
});

export default router;