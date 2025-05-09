
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ApayPaymentForm = () => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please login to continue",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 500) {
      toast({
        title: "Error",
        description: "Minimum recharge amount is ₹500",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add explicit function name and log the request
      console.log('Sending request to create-apay-payment with:', { amount: amountNum, userId: user.id });
      
      const { data, error } = await supabase.functions.invoke('create-apay-payment', {
        body: {
          amount: amountNum,
          userId: user.id
        }
      });

      console.log('Response from create-apay-payment:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.payment_url) {
        throw new Error('Invalid response from payment service');
      }

      // Redirect to payment page
      window.location.href = data.payment_url;
    } catch (error: any) {
      console.error('Detailed error creating payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1">
          Amount (₹)
        </label>
        <Input
          id="amount"
          type="number"
          min="500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (Min: ₹500)"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </Button>
    </form>
  );
};
