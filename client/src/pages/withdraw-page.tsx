import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useWalletBalance } from '@/lib/wallet';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Wallet, 
  Building2,
  ArrowUpRight,
  CheckCircle,
  Shield,
  Loader2,
  IndianRupee
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Define withdrawal form schema
const withdrawalSchema = z.object({
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)), {
      message: 'Amount must be a valid number',
    })
    .refine((val) => parseFloat(val) >= 500, {
      message: 'Minimum withdrawal amount is ₹500',
    })
    .refine((val) => parseFloat(val) <= 50000, {
      message: 'Maximum withdrawal amount is ₹50,000',
    }),
  upiId: z.string()
    .min(1, 'UPI ID is required')
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, {
      message: 'Please enter a valid UPI ID (e.g., name@upi)',
    }),
  fullName: z.string()
    .min(3, 'Full name is required')
    .max(100, 'Name is too long'),
  bankName: z.string()
    .min(1, 'Bank name is required'),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

export default function WithdrawPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: walletData } = useWalletBalance();
  const balance = walletData?.balance ?? 0;
  
  // Quick amounts for selection
  const quickAmounts = [1000, 2000, 5000, 10000];
  
  // Initialize form
  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: '',
      upiId: '',
      fullName: '',
      bankName: '',
    },
  });

  // Handle quick amount selection
  const selectQuickAmount = (amount: number) => {
    if (amount <= balance) {
      form.setValue('amount', amount.toString());
    } else {
      toast({
        title: 'Insufficient balance',
        description: 'You don\'t have enough funds for this amount',
        variant: 'destructive',
      });
    }
  };
  
  // Create withdrawal request mutation
  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormData) => {
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) throw new Error('Invalid amount');
      
      try {
        const response = await apiRequest('POST', '/api/transactions', {
          type: 'withdrawal',
          amount: amount,
          currency: 'INR',
          status: 'pending',
          description: `Withdrawal to UPI: ${data.upiId} (${data.bankName})`,
          txid: `W${Date.now()}${Math.floor(Math.random() * 1000)}`
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to process withdrawal');
        }
        
        return response.json();
      } catch (error) {
        console.error('Withdrawal error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate balance query to refresh user's balance
      queryClient.invalidateQueries({ queryKey: ['/api/user/balance'] });
      
      toast({
        title: 'Withdrawal Requested',
        description: 'Your withdrawal request has been submitted and is being processed.',
      });
      
      // Redirect to a success page or wallet page
      setLocation('/wallet');
    },
    onError: (error: any) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'There was an error processing your withdrawal. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: WithdrawalFormData) => {
    const withdrawalAmount = parseFloat(data.amount);
    
    // Check if user has sufficient balance
    if (withdrawalAmount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You don\'t have enough funds to make this withdrawal.',
        variant: 'destructive',
      });
      return;
    }
    
    // Submit withdrawal request
    withdrawalMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <Button 
        variant="outline" 
        className="mb-4 flex items-center border-[#243442] text-white hover:bg-[#172B3A]"
        onClick={() => setLocation('/wallet')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Wallet
      </Button>
      
      <div className="max-w-md mx-auto">
        <Card className="border-[#243442] bg-[#172B3A] text-white shadow-lg overflow-hidden">
          <CardHeader className="space-y-1 border-b border-[#243442]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-[#1375e1]" /> Withdraw Funds
              </CardTitle>
              <div className="px-2 py-1 bg-[#1375e1]/20 text-[#1375e1] text-xs font-semibold rounded-md flex items-center">
                <Shield className="w-3 h-3 mr-1" /> Secure
              </div>
            </div>
            <CardDescription className="text-[#7F8990]">
              Withdraw your funds instantly via UPI
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="mb-6 p-3 bg-[#0F212E] rounded-md">
              <div className="flex justify-between items-center">
                <Label className="text-sm text-[#7F8990]">Available Balance:</Label>
                <div className="text-lg font-semibold">₹ {balance.toFixed(2)}</div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm flex justify-between">
                        <span>Amount (₹)</span>
                        <span className="text-xs text-[#7F8990]">Min: ₹500 | Max: ₹50,000</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <IndianRupee className="w-4 h-4 text-[#7F8990]" />
                          </div>
                          <Input
                            placeholder="Enter amount"
                            className="pl-9 bg-[#0F212E] border-[#243442] text-white"
                            {...field}
                            min="500"
                            max="50000"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Quick amount selection */}
                <div className="mb-2">
                  <Label className="text-xs text-[#7F8990] mb-2 block">Quick Select:</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant="outline"
                        className={`text-sm py-1 h-auto border-[#243442] 
                          ${form.watch('amount') === quickAmount.toString() 
                            ? "bg-[#0F212E] border-[#1375e1] text-[#1375e1]" 
                            : "text-white hover:bg-[#0F212E]"
                          }`}
                        onClick={() => selectQuickAmount(quickAmount)}
                      >
                        ₹{quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="yourname@upi"
                          className="bg-[#0F212E] border-[#243442] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[#7F8990] text-xs">
                        Enter your UPI ID (e.g., name@paytm, name@okicici)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          className="bg-[#0F212E] border-[#243442] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-[#0F212E] border-[#243442] text-white">
                            <SelectValue placeholder="Select your bank" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0F212E] border-[#243442] text-white">
                            <SelectItem value="SBI">State Bank of India</SelectItem>
                            <SelectItem value="HDFC">HDFC Bank</SelectItem>
                            <SelectItem value="ICICI">ICICI Bank</SelectItem>
                            <SelectItem value="Axis">Axis Bank</SelectItem>
                            <SelectItem value="BOI">Bank of India</SelectItem>
                            <SelectItem value="BOB">Bank of Baroda</SelectItem>
                            <SelectItem value="PNB">Punjab National Bank</SelectItem>
                            <SelectItem value="Kotak">Kotak Mahindra Bank</SelectItem>
                            <SelectItem value="Yes">Yes Bank</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#1375e1] hover:bg-[#1060c0] mt-4"
                  disabled={withdrawalMutation.isPending}
                >
                  {withdrawalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Request Withdrawal
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-start space-y-2 border-t border-[#243442] bg-[#0F212E] p-6 text-xs text-[#7F8990]">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1375e1] mt-0.5" />
              <p><span className="font-medium text-white">Withdrawals are processed instantly</span> 24 hours a day, 7 days a week</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1375e1] mt-0.5" />
              <p>UPI withdrawals are typically processed within 15-30 minutes</p>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-[#1375e1] mt-0.5" />
              <p>You can check the status in your transaction history</p>
            </div>
            <div className="flex items-start space-x-2">
              <Shield className="w-3.5 h-3.5 text-[#1375e1] mt-0.5" />
              <p>All withdrawals are verified for security purposes</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}