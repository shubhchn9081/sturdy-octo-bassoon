import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/UserContext';
import { apiRequest } from '@/lib/queryClient';
import { 
  Bitcoin, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CircleDollarSign, 
  Copy,
  CheckCircle2
} from 'lucide-react';

const depositSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  currency: z.enum(["INR", "BTC", "ETH", "USDT", "LTC"]),
});

const withdrawSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
  address: z.string().min(10, "Valid wallet address is required"),
  currency: z.enum(["INR", "BTC", "ETH", "USDT", "LTC"]),
});

type DepositFormData = z.infer<typeof depositSchema>;
type WithdrawFormData = z.infer<typeof withdrawSchema>;

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("deposit");
  const [depositAddress, setDepositAddress] = useState("");
  const [hasCopied, setHasCopied] = useState(false);
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [balanceAmount, setBalanceAmount] = useState<number | null>(null);
  
  // Fetch balance directly from API
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await apiRequest('GET', '/api/user/balance');
        if (response.ok) {
          const data = await response.json();
          setBalanceAmount(data.balance);
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    
    if (user) {
      fetchBalance();
    }
  }, [user]);

  const depositForm = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      currency: "INR", // Changed default to INR
    },
  });

  const withdrawForm = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      address: "",
      currency: "INR", // Changed default to INR
    },
  });

  const handleDeposit = async (data: DepositFormData) => {
    try {
      // Special handling for INR deposits via UPI
      if (data.currency === 'INR') {
        // Show the UPI payment form
        setShowUpiForm(true);
        setUpiId("stake" + Math.floor(Math.random() * 10000) + "@ybl");
        
        toast({
          title: "UPI Payment Initiated",
          description: `Please complete payment of ₹${data.amount} via UPI`,
        });
        return;
      }
      
      // For crypto currencies, generate a deposit address
      const fakeAddress = "bc1q" + Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
      setDepositAddress(fakeAddress);
      
      toast({
        title: "Deposit address generated",
        description: `Send ${data.amount} ${data.currency} to the generated address`,
      });
    } catch (error) {
      toast({
        title: "Failed to process deposit request",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async (data: WithdrawFormData) => {
    try {
      // Special handling for INR withdrawals via UPI
      if (data.currency === 'INR') {
        // Get balance based on format
        let userBalance = 0;
        if (user) {
          if (typeof user.balance === 'number') {
            userBalance = user.balance;
          } else if (typeof user.balance === 'object' && user.balance && 'INR' in user.balance) {
            userBalance = user.balance.INR || 0;
          }
        }
        
        // Simulate withdrawal
        if (user && userBalance >= parseFloat(data.amount)) {
          updateUserBalance('INR', -parseFloat(data.amount));
          
          toast({
            title: "INR Withdrawal successful",
            description: `₹${data.amount} has been sent to UPI ID: ${data.address}`,
            variant: "default",
          });
          withdrawForm.reset({ currency: 'INR', amount: '', address: '' });
        } else {
          toast({
            title: "Insufficient balance",
            description: "You don't have enough INR balance for this withdrawal",
            variant: "destructive",
          });
        }
        return;
      }
      
      // For crypto currencies
      toast({
        title: "Withdrawal pending",
        description: `Withdrawal of ${data.amount} ${data.currency} to ${data.address.substring(0, 10)}... is being processed`,
      });
      withdrawForm.reset({ currency: data.currency, amount: '', address: '' });
    } catch (error) {
      toast({
        title: "Withdrawal failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depositAddress);
    setHasCopied(true);
    toast({
      title: "Address copied",
      description: "Deposit address copied to clipboard",
    });
    setTimeout(() => setHasCopied(false), 3000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
        <p className="text-[#7F8990]">Manage your funds securely</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Cards */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Total Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold font-mono">
                  ₹{balanceAmount !== null ? balanceAmount.toFixed(2) : "0.00"}
                </span>
                <span className="ml-2 text-[#7F8990]">INR</span>
              </div>
              <p className="text-[#7F8990] mt-1">≈ ${balanceAmount !== null ? (balanceAmount / 83).toFixed(2) : "0.00"} USD</p>
            </CardContent>
            <CardFooter className="border-t border-[#243442] pt-4">
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center space-x-2 border-[#243442] text-white hover:bg-[#1375e1] hover:text-white"
                  onClick={() => setActiveTab("deposit")}
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Deposit</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center space-x-2 border-[#243442] text-white hover:bg-[#1375e1] hover:text-white"
                  onClick={() => setActiveTab("withdraw")}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Withdraw</span>
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Additional actions moved from the removed Balances card */}
          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#7F8990] mb-4">Additional account options</p>
            </CardContent>
            <CardFooter className="border-t border-[#243442] pt-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2 border-[#243442] text-white hover:bg-[#172B3A]"
                onClick={() => setActiveTab("convert")}
              >
                <CircleDollarSign className="h-4 w-4" />
                <span>Convert Currency</span>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Deposit/Withdraw/Convert Tabs */}
        <div className="lg:col-span-2">
          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Manage Funds</CardTitle>
              <CardDescription className="text-[#7F8990]">
                Deposit, withdraw, or convert your crypto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-8">
                  <TabsTrigger value="deposit" className="text-white data-[state=active]:bg-[#1375e1]">
                    Deposit
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="text-white data-[state=active]:bg-[#1375e1]">
                    Withdraw
                  </TabsTrigger>
                  <TabsTrigger value="convert" className="text-white data-[state=active]:bg-[#1375e1]">
                    Convert
                  </TabsTrigger>
                </TabsList>

                {/* Deposit Tab */}
                <TabsContent value="deposit">
                  {showUpiForm ? (
                    <div className="bg-[#0F212E] rounded-md p-6 flex flex-col items-center">
                      <h3 className="text-lg font-medium mb-4">UPI Payment</h3>
                      <div className="text-center mb-4">
                        <p className="text-white mb-2">Amount: ₹{depositForm.getValues().amount}</p>
                        <p className="text-[#7F8990] mb-4">Complete payment using any UPI app</p>
                      </div>
                      
                      <div className="w-40 h-40 bg-white p-2 rounded-md mb-4 flex items-center justify-center">
                        {/* This would be an actual QR code in a real app */}
                        <div className="text-black text-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                            <rect width="30" height="30" x="10" y="10" />
                            <rect width="30" height="30" x="60" y="10" />
                            <rect width="30" height="30" x="10" y="60" />
                            <rect width="10" height="10" x="50" y="10" />
                            <rect width="10" height="10" x="50" y="30" />
                            <rect width="10" height="10" x="50" y="60" />
                            <rect width="10" height="10" x="60" y="50" />
                            <rect width="30" height="10" x="60" y="80" />
                            <rect width="10" height="10" x="10" y="50" />
                            <rect width="30" height="10" x="10" y="40" />
                            <rect width="10" height="10" x="40" y="40" />
                            <rect width="10" height="10" x="40" y="60" />
                            <rect width="10" height="10" x="40" y="80" />
                            <rect width="10" height="10" x="30" y="60" />
                            <rect width="10" height="10" x="80" y="60" />
                            <rect width="10" height="10" x="80" y="40" />
                          </svg>
                          <p className="mt-2 font-medium">UPI QR Code</p>
                        </div>
                      </div>
                      
                      <div className="w-full mb-6">
                        <p className="text-center mb-2 text-white font-medium">UPI ID</p>
                        <div 
                          className="bg-[#172B3A] border border-[#243442] p-3 rounded-md w-full flex items-center justify-between cursor-pointer hover:bg-[#1c334a]"
                          onClick={() => {
                            navigator.clipboard.writeText(upiId);
                            toast({
                              title: "UPI ID copied",
                              description: "UPI ID copied to clipboard",
                            });
                          }}
                        >
                          <span className="text-[#e6e6e6] font-mono">{upiId}</span>
                          <Copy className="h-5 w-5 text-[#7F8990]" />
                        </div>
                      </div>
                      
                      <div className="text-[#7F8990] text-sm mb-6">
                        <p>• Open any UPI app like Google Pay, PhonePe, Paytm, etc.</p>
                        <p>• Scan the QR code or pay to the UPI ID</p>
                        <p>• Enter amount ₹{depositForm.getValues().amount} and complete payment</p>
                        <p>• Your account will be credited once payment is confirmed</p>
                      </div>
                      
                      <div className="flex w-full space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowUpiForm(false);
                            // Simulate deposit successful
                            if (depositForm.getValues().amount && user) {
                              const amount = parseFloat(depositForm.getValues().amount);
                              updateUserBalance('INR', amount);
                              toast({
                                title: "Deposit successful",
                                description: `₹${amount} has been added to your account`,
                                variant: "default",
                              });
                              depositForm.reset({ currency: 'INR', amount: '' });
                            }
                          }}
                          className="flex-1 border-[#20b26c] text-[#20b26c] hover:bg-[#20b26c] hover:text-white"
                        >
                          I've Completed Payment
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowUpiForm(false);
                            depositForm.reset({ currency: 'INR', amount: '' });
                          }}
                          className="flex-1 border-[#243442] text-white hover:bg-[#243442]"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : !depositAddress ? (
                    <Form {...depositForm}>
                      <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-6">
                        <FormField
                          control={depositForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter amount to deposit"
                                  {...field}
                                  className="bg-[#0F212E] border-[#243442]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={depositForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <div className="grid grid-cols-5 gap-3">
                                {["INR", "BTC", "ETH", "USDT", "LTC"].map((currency) => (
                                  <Button
                                    key={currency}
                                    type="button"
                                    variant={field.value === currency ? "default" : "outline"}
                                    className={field.value === currency 
                                      ? currency === "INR" ? "bg-[#20b26c] hover:bg-[#1a9b5c]" : "bg-[#1375e1] hover:bg-[#0e5dba]" 
                                      : "border-[#243442] text-white hover:bg-[#243442]"
                                    }
                                    onClick={() => field.onChange(currency)}
                                  >
                                    {currency}
                                  </Button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Special button for INR/UPI */}
                        {depositForm.watch('currency') === 'INR' ? (
                          <Button
                            type="submit"
                            className="w-full bg-[#20b26c] hover:bg-[#1a9b5c]"
                            disabled={depositForm.formState.isSubmitting}
                          >
                            {depositForm.formState.isSubmitting ? "Processing..." : "Deposit via UPI"}
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                            disabled={depositForm.formState.isSubmitting}
                          >
                            {depositForm.formState.isSubmitting ? "Generating address..." : "Generate Deposit Address"}
                          </Button>
                        )}
                      </form>
                    </Form>
                  ) : (
                    <div className="bg-[#0F212E] rounded-md p-6 flex flex-col items-center">
                      <h3 className="text-lg font-medium mb-4">Your Deposit Address</h3>
                      
                      <div className="w-40 h-40 bg-white p-2 rounded-md mb-4">
                        {/* This would be a QR code in a real app */}
                        <div className="w-full h-full flex items-center justify-center bg-black text-white">
                          QR Code
                        </div>
                      </div>
                      
                      <div 
                        className="bg-[#172B3A] border border-[#243442] p-3 rounded-md mb-4 w-full flex items-center justify-between cursor-pointer hover:bg-[#1c334a]"
                        onClick={copyToClipboard}
                      >
                        <span className="font-mono text-sm truncate mr-2">{depositAddress}</span>
                        {hasCopied ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <Copy className="h-5 w-5 text-[#7F8990] flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="text-[#7F8990] text-sm mb-6">
                        <p>• Only send {depositForm.getValues().currency} to this address</p>
                        <p>• Deposits will be credited after 2 confirmations</p>
                        <p>• This address is valid for 24 hours</p>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => setDepositAddress("")}
                        className="border-[#243442] text-white hover:bg-[#243442]"
                      >
                        Generate New Address
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Withdraw Tab */}
                <TabsContent value="withdraw">
                  <Form {...withdrawForm}>
                    <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-6">
                      <FormField
                        control={withdrawForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter amount to withdraw"
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={withdrawForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {withdrawForm.watch('currency') === 'INR' ? 'UPI ID' : 'Recipient Address'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  withdrawForm.watch('currency') === 'INR' 
                                    ? "Enter UPI ID (e.g. name@upi)" 
                                    : "Enter recipient wallet address"
                                }
                                {...field}
                                className="bg-[#0F212E] border-[#243442]"
                              />
                            </FormControl>
                            {withdrawForm.watch('currency') === 'INR' && (
                              <FormDescription className="text-[#7F8990] text-xs mt-1">
                                Enter your UPI ID from Google Pay, PhonePe, Paytm, or other UPI apps
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={withdrawForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <div className="grid grid-cols-5 gap-3">
                              {["INR", "BTC", "ETH", "USDT", "LTC"].map((currency) => (
                                <Button
                                  key={currency}
                                  type="button"
                                  variant={field.value === currency ? "default" : "outline"}
                                  className={field.value === currency 
                                    ? currency === "INR" ? "bg-[#20b26c] hover:bg-[#1a9b5c]" : "bg-[#1375e1] hover:bg-[#0e5dba]" 
                                    : "border-[#243442] text-white hover:bg-[#243442]"
                                  }
                                  onClick={() => field.onChange(currency)}
                                >
                                  {currency}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className={withdrawForm.watch('currency') === 'INR' 
                          ? "w-full bg-[#20b26c] hover:bg-[#1a9b5c]" 
                          : "w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                        }
                        disabled={withdrawForm.formState.isSubmitting}
                      >
                        {withdrawForm.formState.isSubmitting 
                          ? "Processing..." 
                          : withdrawForm.watch('currency') === 'INR'
                            ? "Withdraw to UPI"
                            : "Withdraw Funds"
                        }
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Convert Tab */}
                <TabsContent value="convert">
                  <div className="text-center p-6">
                    <h3 className="text-lg font-medium mb-2">Crypto Conversion</h3>
                    <p className="text-[#7F8990] mb-6">This feature is coming soon!</p>
                    <Button
                      variant="outline"
                      className="border-[#243442] text-white hover:bg-[#172B3A]"
                      onClick={() => setActiveTab("deposit")}
                    >
                      Return to Deposit
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}