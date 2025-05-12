import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, IndianRupee, ArrowRight, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Generate a unique ID for transactions
function generateUniqueId(): string {
  return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function APay() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<string>("");
  
  // Quick selection amounts
  const quickAmounts = [500, 1000, 2000, 5000, 10000];
  
  const initiatePaymentMutation = useMutation({
    mutationFn: async (paymentData: { amount: number; userId: number; transactionId: string }) => {
      const response = await apiRequest("POST", "/apay/create-payment", paymentData);
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
          title: "Redirecting to payment",
          description: "You'll be taken to the secure payment page",
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
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }
    
    if (parsedAmount < 500) {
      toast({
        title: "Amount too low",
        description: "Minimum deposit amount is ₹500.",
        variant: "warning",
      });
      return;
    }
    
    if (parsedAmount > 50000) {
      toast({
        title: "Amount too high",
        description: "Maximum deposit amount is ₹50,000.",
        variant: "warning",
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
    <Card className="w-full border-[#243442] bg-[#172B3A] text-white shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#57FBA2]" /> Add Funds
          </CardTitle>
          <div className="px-2 py-1 bg-[#57FBA2] text-black text-xs font-semibold rounded-md flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> Secure
          </div>
        </div>
        <CardDescription className="text-[#7F8990]">
          Fast and secure deposits via UPI, PhonePe, Paytm and more
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="amount" className="text-sm font-medium mb-1.5 flex justify-between">
              <span>Amount (₹)</span>
              <span className="text-xs text-[#7F8990]">Min: ₹500 | Max: ₹50,000</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IndianRupee className="w-4 h-4 text-[#7F8990]" />
              </div>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9 bg-[#243442] border-[#3A4A59] text-white"
                min="500"
                max="50000"
                step="100"
                required
              />
            </div>
          </div>
          
          {/* Quick amount selection */}
          <div className="mb-6">
            <Label className="text-xs text-[#7F8990] mb-2 block">Quick Select:</Label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => {
                if (quickAmount === 2000) {
                  return (
                    <div key={quickAmount} className="relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10 bg-[#FF9900] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center shadow-md whitespace-nowrap">
                        <TrendingUp className="w-2 h-2 mr-0.5" />
                        POPULAR
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className={`text-sm py-1 pt-3 h-auto border-[#3A4A59] w-full
                          ${parseFloat(amount) === quickAmount 
                            ? "bg-[#243442] border-[#FF9900] text-[#FF9900] ring-2 ring-[#FF9900]/30" 
                            : "text-white hover:bg-[#243442] border-[#FF9900] ring-1 ring-[#FF9900]/20"
                          }`}
                        onClick={() => selectQuickAmount(quickAmount)}
                        title="Most players choose this amount!"
                      >
                        ₹{quickAmount}
                      </Button>
                    </div>
                  );
                }
                
                return (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    className={`text-sm py-1 h-auto border-[#3A4A59] 
                      ${parseFloat(amount) === quickAmount 
                        ? "bg-[#243442] border-[#57FBA2] text-[#57FBA2]" 
                        : "text-white hover:bg-[#243442]"
                      }`}
                    onClick={() => selectQuickAmount(quickAmount)}
                  >
                    ₹{quickAmount}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Payment button */}
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#57FBA2] to-[#4BDF8D] hover:from-[#4BDF8D] hover:to-[#40CF80] text-black"
            disabled={initiatePaymentMutation.isPending}
          >
            {initiatePaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start border-t border-[#243442] pt-4 pb-5 space-y-2 text-xs text-[#7F8990]">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-[#57FBA2] mt-0.5" />
          <p>UPI, PhonePe, Paytm and more payment options available</p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-[#57FBA2] mt-0.5" />
          <p>Secure payment with end-to-end encryption</p>
        </div>
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-3.5 h-3.5 text-[#57FBA2] mt-0.5" />
          <p>Instant credit to your wallet after payment</p>
        </div>
        <div className="flex items-start space-x-2">
          <Shield className="w-3.5 h-3.5 text-[#57FBA2] mt-0.5" />
          <p>All transactions are verified and secure</p>
        </div>
      </CardFooter>
    </Card>
  );
}