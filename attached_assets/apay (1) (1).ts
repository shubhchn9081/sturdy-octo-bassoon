import express, { Router, Request, Response } from 'express';
import cors from 'cors';
import { storage } from './storage';
import { log } from './vite';

// APay payment gateway integration
const router = Router();

// Enable CORS
router.use(cors());

// Real APay credentials
const APAY_API_KEY = 'd6a870ecdd68ed30951e601442d620ca';
const APAY_PROJECT_ID = '9440140';
const APAY_WEBHOOK_ID = '6898076';
const APAY_WEBHOOK_ACCESS_KEY = 'e6f1ac0ea5d105be8fc0b044744b36d3';
const APAY_WEBHOOK_PRIVATE_KEY = 'f3769c2fb80ac01c36ddd589a0fd9279';

// Set the correct API endpoint for APay based on APay documentation
// APay only accepts requests from upino.in domain
const APAY_ENDPOINT = 'https://pay-crm.com';

// Callback and redirect URLs
const APAY_CALLBACK_URL = '/apay/callback';
const APAY_SUCCESS_REDIRECT = '/payment-success';
const APAY_FAILURE_REDIRECT = '/payment-failure';

// Base URL for the application in production environment
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://upino.in' 
  : undefined; // Will be determined from request in non-production

interface PaymentRequest {
  amount: number;
  userId: number;
  transactionId: string;
}

interface APAYResponse {
  success: boolean;
  payment_id?: string;
  payment_url?: string;
  error?: string;
}

interface APAYPaymentPayload {
  amount: number;
  currency: string;
  order_id: string;
  customer_id: string;
  customer_email?: string;
  customer_phone?: string;
  description: string;
  return_url: string;
  callback_url: string;
  webhook_id: string;
}

// Create a new payment request
router.post('/create-payment', async (req: Request, res: Response) => {
  try {
    const { amount, userId, transactionId } = req.body as PaymentRequest;
    
    if (!amount || !userId || !transactionId) {
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
    await storage.createTransaction({
      userId,
      type: 'deposit',
      amount,
      status: 'pending',
      reference: transactionId,
      timestamp: new Date(),
      description: 'Deposit via APay'
    });
    
    // Always use the production URL for APay requirements
    const baseUrl = 'https://upino.in';
    
    // Construct the APay payload as per the documented flow
    const apayPayload: APAYPaymentPayload = {
      amount: amount,
      currency: 'INR',
      order_id: transactionId,
      customer_id: userId.toString(),
      customer_phone: user.phone || '',
      description: 'Wallet recharge on Upino Cricket',
      return_url: `${baseUrl}${APAY_SUCCESS_REDIRECT}?ref=${transactionId}`,
      callback_url: `${baseUrl}${APAY_CALLBACK_URL}`,
      webhook_id: APAY_WEBHOOK_ID
    };
    
    log(`Preparing payment request for transaction ${transactionId}`, 'apay');
    log(`API Key: ${APAY_API_KEY.substring(0, 8)}...`, 'apay');
    log(`Project ID: ${APAY_PROJECT_ID}, Webhook ID: ${APAY_WEBHOOK_ID}`, 'apay');
    log(`Payload: ${JSON.stringify(apayPayload)}`, 'apay');
    
    // Use the correct API endpoint for APay based on documentation
    const endpoint = '/Remotes/create-payment-page';
    log(`Making API call to endpoint: ${endpoint}`, 'apay');
    
    let paymentResponse;
    try {
      // Create payload according to APay documentation
      const paymentPagePayload = {
        amount: amount,
        currency: 'INR',
        payment_system: ['upi_fast', 'upi_p2p'],
        custom_transaction_id: transactionId,
        custom_user_id: userId.toString(),
        return_url: `${baseUrl}${APAY_SUCCESS_REDIRECT}?ref=${transactionId}`,
        webhook_id: APAY_WEBHOOK_ID,
        language: 'EN'
      };
      
      paymentResponse = await makeAPICall(endpoint, paymentPagePayload);
      
      if (!paymentResponse || !paymentResponse.success) {
        throw new Error('Failed to create payment with APay');
      }
      
      log(`Successfully created payment with endpoint: ${endpoint}`, 'apay');
    } catch (err: any) {
      log(`Failed with endpoint ${endpoint}: ${err.message}`, 'apay');
      throw err;
    }
    
    // Map APay response format to our expected format based on documentation
    return res.status(200).json({
      success: true,
      payment_id: paymentResponse.order_id,
      payment_url: paymentResponse.url
    });
  } catch (error: any) {
    console.error('APay payment creation error:', error);
    
    // For security, don't expose internal API errors directly to clients
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
      internalStatus = 'success';
    } else if (status === 'FAILED' || status === 'DECLINED') {
      internalStatus = 'failed';
    }
    
    // Update transaction status using order_id as our reference
    const transaction = await storage.updateTransactionStatus(order_id, internalStatus);
    
    if (!transaction) {
      log(`Transaction not found for order_id ${order_id}`, 'apay');
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    // If payment is successful, update user balance
    if (internalStatus === 'success') {
      const user = await storage.getUser(transaction.userId);
      
      if (user) {
        const creditAmount = Number(amount || transaction.amount);
        await storage.updateUserBalance(user.id, creditAmount);
        log(`Updated balance for user ${user.id} with amount ₹${creditAmount}`, 'apay');
        
        // Store additional payment details
        // This would be implemented in a real system to track payment_id, utr_number, etc.
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
    
    // Find the specific transaction
    const transaction = transactions.find(t => t.reference === reference);
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    // For successful transactions, verify with APay
    if (transaction.status === 'success' || transaction.status === 'completed') {
      try {
        // We could potentially verify the transaction with APay here
        // This would involve calling their transaction status API
        // For now, we'll trust our database status
      } catch (verifyError) {
        log(`Error verifying transaction with APay: ${verifyError}`, 'apay');
        // We still return the transaction even if verification fails
      }
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

// Verify payment status with APay API (used for reconciliation)
router.get('/verify/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    
    // Only admins can check payment statuses directly with APay
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }
    
    // Call APay's payment status API to verify the payment
    const verificationResult = await makeAPICall('/v1/payments/status', {
      order_id: transactionId,
      project_id: APAY_PROJECT_ID
    });
    
    if (!verificationResult.success) {
      throw new Error(verificationResult.error || 'Failed to verify payment with APay');
    }
    
    return res.status(200).json({
      success: true,
      verification: verificationResult
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to verify payment'
    });
  }
});

// Make API call to APay
async function makeAPICall(path: string, data: any) {
  // Make sure path starts with a slash
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  
  try {
    // Check if the request includes project_id as query parameter
    const hasQueryParams = apiPath.includes('?');
    const queryParams = hasQueryParams ? '' : `?project_id=${APAY_PROJECT_ID}`;
    const fullPath = `${apiPath}${queryParams}`;
    
    log(`Attempting API call to ${APAY_ENDPOINT}${fullPath}`, 'apay');
    log(`Request payload: ${JSON.stringify(data)}`, 'apay');
    
    const endpoint = `${APAY_ENDPOINT}${fullPath}`;
    
    // Add detailed debugging for the request
    log(`Full request URL: ${endpoint}`, 'apay');
    log(`apikey: ${APAY_API_KEY.substring(0, 8)}...`, 'apay');
    
    // Don't add apikey and project_id to body - use bearer token and query params instead
    const requestData = {
      ...data
    };
    
    // Use the correct headers according to APay's documentation - apikey header
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apikey': APAY_API_KEY,
      'User-Agent': 'Upino-Cricket-App/1.0',
      'Origin': 'https://upino.in',
      'Referer': 'https://upino.in/'
    };
    
    // Make the API call
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData)
    });
    
    // Get full response details
    const responseText = await response.text();
    log(`APay API response (${response.status}): ${responseText}`, 'apay');
    
    // Enhanced error handling
    if (!response.ok) {
      const statusCode = response.status;
      let errorMessage = `APay API error (${statusCode})`;
      
      // Interpret common error codes
      if (statusCode === 401) {
        errorMessage = `Authentication failed: Invalid API key or project ID (${statusCode})`;
      } else if (statusCode === 403) {
        errorMessage = `Authorization failed: IP address not whitelisted or insufficient permissions (${statusCode})`;
      } else if (statusCode === 404) {
        errorMessage = `API endpoint not found: Check the path '${apiPath}' (${statusCode})`;
      } else if (statusCode === 400) {
        errorMessage = `Bad request: Invalid parameters or payload (${statusCode})`;
      } else if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
        errorMessage = `APay server error: The payment service is experiencing issues (${statusCode})`;
      }
      
      // Add the response text if available
      if (responseText) {
        errorMessage += `: ${responseText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse the response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      
      // If we got here, the API call was successful
      log(`Successfully called APay API at endpoint: ${APAY_ENDPOINT}`, 'apay');
      
      return responseData;
    } catch (parseError) {
      // If response isn't JSON, wrap it
      log(`Failed to parse APay response as JSON: ${responseText}`, 'apay');
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error: any) {
    // Log the error
    log(`Failed API call to ${APAY_ENDPOINT}${apiPath}: ${error.message}`, 'apay');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      throw new Error(`Cannot connect to APay API endpoint. The service may be down or the endpoint URL is incorrect.`);
    }
    throw error;
  }
}

export default router;