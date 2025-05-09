
import { supabase } from "@/integrations/supabase/client";

interface CreateDepositParams {
  amount: number;
  userId: string;
  transactionId: string;
}

interface APayDepositResponse {
  success: boolean;
  status: string;
  order_id: string;
  data: {
    paymentpage_url: string;
  };
}

export const createDeposit = async ({ amount, userId, transactionId }: CreateDepositParams) => {
  try {
    // Get API credentials from Supabase
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('active_market')
      .select('current_market')
      .eq('id', 'c0f77477-4ac2-4a16-8132-b79b42a44188') // Fixed UUID for API key
      .single();

    const { data: projectIdData, error: projectIdError } = await supabase
      .from('active_market')
      .select('current_market')
      .eq('id', 'c0f77477-4ac2-4a16-8132-b79b42a44199') // Fixed UUID for project ID
      .single();

    if (apiKeyError || projectIdError || !apiKeyData?.current_market || !projectIdData?.current_market) {
      throw new Error('A-Pay configuration not found');
    }

    const response = await fetch(`https://gate.apay.ltd/api/v1/create-deposit?project_id=${projectIdData.current_market}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKeyData.current_market}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        payment_system: 'upi_fast',
        custom_transaction_id: transactionId,
        custom_user_id: userId,
        webhook_id: '1', // You can configure this in your A-Pay dashboard
        data: {}
      })
    });

    const data: APayDepositResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating deposit:', error);
    throw error;
  }
};

export const getDepositStatus = async (orderId: string) => {
  try {
    const { data: projectIdData, error: projectIdError } = await supabase
      .from('active_market')
      .select('current_market')
      .eq('id', 'c0f77477-4ac2-4a16-8132-b79b42a44199') // Fixed UUID for project ID
      .single();

    if (projectIdError || !projectIdData?.current_market) {
      throw new Error('A-Pay configuration not found');
    }

    const response = await fetch(`https://gate.apay.ltd/api/v1/deposit-info?project_id=${projectIdData.current_market}&order_id=${orderId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking deposit status:', error);
    throw error;
  }
};
