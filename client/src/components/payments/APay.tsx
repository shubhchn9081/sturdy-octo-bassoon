import { useState } from "react";
import { useAuth } from "@/context/UserContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, IndianRupee, ArrowRight, CheckCircle, MapPin } from "lucide-react";

// Generate a unique ID for transactions
function generateUniqueId(): string {
  return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// APay required credentials - these match the server-side credentials
const APAY_PROJECT_ID = '9440140';
const APAY_WEBHOOK_ID = '6898076';

export function APay() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  
  // Quick selection amounts
  const quickAmounts = [500, 1000, 2000, 5000];
  
  const initiatePaymentMutation = useMutation({
    mutationFn: async (paymentData: { amount: number; userId: number; transactionId: string }) => {
      const response = await apiRequest("POST", "/api/apay/create-payment", paymentData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment initiation failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.payment_url) {
        // Show a toast before redirecting
        toast({
          title: "Redirecting to APay",
          description: "You'll now be taken to the secure APay payment gateway",
          variant: "default",
        });
        
        // Redirect to the APay payment page
        window.location.href = data.payment_url;
      } else {
        toast({
          title: "Payment Error",
          description: "There was an issue creating your payment. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add funds to your account.",
        variant: "destructive",
      });
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }
    
    if (parsedAmount < 100) {
      toast({
        title: "Amount too low",
        description: "Minimum deposit amount is ₹100.",
        variant: "destructive",
      });
      return;
    }
    
    if (parsedAmount > 10000) {
      toast({
        title: "Amount too high",
        description: "Maximum deposit amount is ₹10,000.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a unique transaction ID
    const transactionId = generateUniqueId();
    
    // Initiate payment through APay
    initiatePaymentMutation.mutate({
      amount: parsedAmount,
      userId: user.id,
      transactionId,
    });
  };
  
  // Set a quick amount
  const selectQuickAmount = (amount: number) => {
    setAmount(amount.toString());
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-secondary rounded-t-lg space-y-1.5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Add Funds
          </CardTitle>
          <div className="px-2 py-1 bg-yellow-400 text-black text-xs font-semibold rounded-md flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> APay Verified
          </div>
        </div>
        <CardDescription>
          Securely add funds to your cricket wallet using APay's UPI payment gateway
        </CardDescription>
      </CardHeader>
      
      <CardContent className="mt-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="amount" className="text-sm font-medium mb-1.5 flex justify-between">
              <span>Amount (₹)</span>
              <span className="text-xs text-neutral-400">Min: ₹100 | Max: ₹10,000</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="w-4 h-4 text-neutral-400" />
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                min="100"
                max="10000"
                step="100"
                required
              />
            </div>
          </div>
          
          {/* Quick amount selection */}
          <div className="mb-6">
            <Label className="text-xs text-neutral-500 mb-2 block">Quick Select:</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  type="button"
                  variant="outline"
                  className={`text-sm py-1 h-auto ${
                    parseFloat(amount) === quickAmount ? "bg-primary/10 border-primary" : ""
                  }`}
                  onClick={() => selectQuickAmount(quickAmount)}
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Payment button */}
          <Button 
            type="submit" 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
            disabled={initiatePaymentMutation.isPending}
          >
            {initiatePaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Proceed to APay <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          
          {/* Payment provider info */}
          <div className="mt-3 flex items-center justify-center text-xs text-neutral-400">
            <MapPin className="w-3 h-3 mr-1" />
            <span>Payment processed by APay UPI Gateway (ID: {APAY_PROJECT_ID})</span>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start border-t pt-4 pb-5 space-y-2 text-xs text-neutral-400">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5" />
          <p>Your payment is secured with end-to-end encryption using APay's API key</p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5" />
          <p>Secure callback verification with webhook ID {APAY_WEBHOOK_ID}</p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5" />
          <p>Your funds will be instantly credited to your wallet after payment</p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5" />
          <p>Payment receipt will be available in your transaction history</p>
        </div>
      </CardFooter>
    </Card>
  );
}