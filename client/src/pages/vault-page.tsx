import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/context/UserContext';
import { useLocation } from 'wouter';
import { ArrowLeft, KeyRound, LockIcon, UnlockIcon } from 'lucide-react';

const depositSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  currency: z.enum(["BTC", "ETH", "USDT", "LTC"]),
});

const withdrawSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 
    { message: "Amount must be a positive number" }
  ),
  currency: z.enum(["BTC", "ETH", "USDT", "LTC"]),
});

type DepositFormData = z.infer<typeof depositSchema>;
type WithdrawFormData = z.infer<typeof withdrawSchema>;

export default function VaultPage() {
  const { user, updateBalance } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("deposit");

  const depositForm = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: "",
      currency: "BTC",
    },
  });

  const withdrawForm = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      currency: "BTC",
    },
  });

  // Calculate total vault balance (in this demo we'll show it as 20% of the total balance)
  const vaultBalance = user ? {
    BTC: user.balance.BTC * 0.2,
    ETH: user.balance.ETH * 0.2,
    USDT: user.balance.USDT * 0.2,
    LTC: user.balance.LTC * 0.2
  } : {
    BTC: 0,
    ETH: 0,
    USDT: 0,
    LTC: 0
  };

  const handleDeposit = async (data: DepositFormData) => {
    const amount = parseFloat(data.amount);
    const currency = data.currency as keyof typeof vaultBalance;
    
    if (user && !isNaN(amount) && amount > 0) {
      // In a real app, this would be an API call
      // For demo, we'll just update the balance
      updateBalance(currency, -amount); // Remove from main balance
      
      toast({
        title: "Vault Deposit Successful",
        description: `${amount} ${currency} has been moved to your vault`,
      });
      
      depositForm.reset();
    }
  };

  const handleWithdraw = async (data: WithdrawFormData) => {
    const amount = parseFloat(data.amount);
    const currency = data.currency as keyof typeof vaultBalance;
    
    if (user && !isNaN(amount) && amount > 0) {
      // In a real app, this would be an API call
      // For demo, we'll just update the balance
      updateBalance(currency, amount); // Add to main balance
      
      toast({
        title: "Vault Withdrawal Successful",
        description: `${amount} ${currency} has been moved to your wallet`,
      });
      
      withdrawForm.reset();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-4 flex items-center border-[#243442] text-white hover:bg-[#172B3A]"
        onClick={() => setLocation('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="flex items-center mb-6">
        <KeyRound className="h-6 w-6 text-[#1375e1] mr-3" />
        <div>
          <h1 className="text-3xl font-bold text-white">Vault</h1>
          <p className="text-[#7F8990]">Secure your funds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vault Balance Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Vault Balance</CardTitle>
              <CardDescription className="text-[#7F8990]">
                Keep your funds safe from active betting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#243442] pb-3">
                  <span className="text-[#7F8990]">Bitcoin (BTC)</span>
                  <span className="font-mono">{vaultBalance.BTC.toFixed(8)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#243442] pb-3">
                  <span className="text-[#7F8990]">Ethereum (ETH)</span>
                  <span className="font-mono">{vaultBalance.ETH.toFixed(8)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#243442] pb-3">
                  <span className="text-[#7F8990]">Tether (USDT)</span>
                  <span className="font-mono">{vaultBalance.USDT.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7F8990]">Litecoin (LTC)</span>
                  <span className="font-mono">{vaultBalance.LTC.toFixed(8)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-[#243442] pt-4 flex-col space-y-2">
              <Button 
                className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                onClick={() => setActiveTab("deposit")}
              >
                <LockIcon className="h-4 w-4 mr-2" />
                Deposit to Vault
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-[#243442] text-white hover:bg-[#243442]"
                onClick={() => setActiveTab("withdraw")}
              >
                <UnlockIcon className="h-4 w-4 mr-2" />
                Withdraw from Vault
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Vault Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[#7F8990]">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-[#1375e1] text-white flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</div>
                  <p>Protect your funds from impulsive betting</p>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-[#1375e1] text-white flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</div>
                  <p>Extra security with 2FA requirements for withdrawals</p>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-[#1375e1] text-white flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</div>
                  <p>24-hour time lock option for added peace of mind</p>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-[#1375e1] text-white flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">4</div>
                  <p>Earn interest on your vault deposits (coming soon)</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Deposit/Withdraw Tabs */}
        <div className="lg:col-span-2">
          <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Vault Management</CardTitle>
              <CardDescription className="text-[#7F8990]">
                Move funds between your wallet and vault
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="deposit" className="text-white data-[state=active]:bg-[#1375e1]">
                    Deposit to Vault
                  </TabsTrigger>
                  <TabsTrigger value="withdraw" className="text-white data-[state=active]:bg-[#1375e1]">
                    Withdraw from Vault
                  </TabsTrigger>
                </TabsList>

                {/* Deposit Tab */}
                <TabsContent value="deposit">
                  <Form {...depositForm}>
                    <form onSubmit={depositForm.handleSubmit(handleDeposit)} className="space-y-6">
                      <FormField
                        control={depositForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount to Secure</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter amount to move to vault"
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
                            <div className="grid grid-cols-4 gap-3">
                              {["BTC", "ETH", "USDT", "LTC"].map((currency) => (
                                <Button
                                  key={currency}
                                  type="button"
                                  variant={field.value === currency ? "default" : "outline"}
                                  className={field.value === currency 
                                    ? "bg-[#1375e1] hover:bg-[#0e5dba]" 
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

                      <div className="p-4 bg-[#0F212E] rounded-md mb-6">
                        <h4 className="font-medium mb-2">Current Wallet Balance</h4>
                        <p className="text-[#7F8990] mb-2">
                          {depositForm.watch("currency")}: {
                            user ? user.balance[depositForm.watch("currency") as keyof typeof user.balance].toFixed(
                              depositForm.watch("currency") === "USDT" ? 2 : 8
                            ) : "0.00000000"
                          }
                        </p>
                        <p className="text-xs text-[#7F8990]">
                          * Funds in your vault cannot be used for betting until withdrawn
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                        disabled={depositForm.formState.isSubmitting}
                      >
                        <LockIcon className="h-4 w-4 mr-2" />
                        {depositForm.formState.isSubmitting ? "Processing..." : "Deposit to Vault"}
                      </Button>
                    </form>
                  </Form>
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
                            <FormLabel>Amount to Withdraw</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter amount to withdraw from vault"
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
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <div className="grid grid-cols-4 gap-3">
                              {["BTC", "ETH", "USDT", "LTC"].map((currency) => (
                                <Button
                                  key={currency}
                                  type="button"
                                  variant={field.value === currency ? "default" : "outline"}
                                  className={field.value === currency 
                                    ? "bg-[#1375e1] hover:bg-[#0e5dba]" 
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

                      <div className="p-4 bg-[#0F212E] rounded-md mb-6">
                        <h4 className="font-medium mb-2">Current Vault Balance</h4>
                        <p className="text-[#7F8990] mb-2">
                          {withdrawForm.watch("currency")}: {
                            vaultBalance[withdrawForm.watch("currency") as keyof typeof vaultBalance].toFixed(
                              withdrawForm.watch("currency") === "USDT" ? 2 : 8
                            )
                          }
                        </p>
                        <p className="text-xs text-[#7F8990]">
                          * Withdrawal will move funds back to your main wallet balance
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                        disabled={withdrawForm.formState.isSubmitting}
                      >
                        <UnlockIcon className="h-4 w-4 mr-2" />
                        {withdrawForm.formState.isSubmitting ? "Processing..." : "Withdraw from Vault"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}