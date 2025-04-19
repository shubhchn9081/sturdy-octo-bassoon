import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet as WalletIcon, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Bitcoin,
  DollarSign,
  AlertCircle
} from 'lucide-react';

// Form schemas
const depositSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  currency: z.enum(["BTC", "ETH", "USDT", "LTC"]),
});

type DepositFormData = z.infer<typeof depositSchema>;

// Mock transaction history
const transactions = [
  { id: 1, type: 'deposit', amount: 0.05, currency: 'BTC', status: 'completed', date: '2023-05-15' },
  { id: 2, type: 'withdraw', amount: 0.02, currency: 'BTC', status: 'completed', date: '2023-05-10' },
  { id: 3, type: 'deposit', amount: 0.1, currency: 'ETH', status: 'completed', date: '2023-05-05' },
  { id: 4, type: 'deposit', amount: 100, currency: 'USDT', status: 'pending', date: '2023-05-01' },
];

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('deposit');
  const [cryptoAddresses, setCryptoAddresses] = useState({
    BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    ETH: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    USDT: 'TKFLguUBKtsfvnmT4FJbQZnL2JxrdSoS8S',
    LTC: 'LQ3JMjHaGfVGpY7Y9oyfGNPrKfFNRoGMFr',
  });
  const { toast } = useToast();
  
  // Mock balance data - in a real app, this would come from an API/context
  const balance = {
    BTC: 0.05342,
    ETH: 0.4231,
    USDT: 150.43,
    LTC: 2.123,
  };
  
  const depositForm = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: '',
      currency: 'BTC',
    },
  });
  
  const onDepositSubmit = (data: DepositFormData) => {
    // In a real app, this would make an API request
    toast({
      title: 'Deposit request received',
      description: `Please send ${data.amount} ${data.currency} to the address shown below.`,
    });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Address copied to clipboard',
      description: 'You can now paste the address in your wallet app.',
    });
  };
  
  return (
    <div className="min-h-screen bg-[#0F212E]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
          <WalletIcon className="mr-2 h-8 w-8" />
          Wallet
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <Card className="bg-[#172B3A] border-[#243442] text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Your Balance</CardTitle>
                <CardDescription className="text-[#7F8990]">
                  Available funds in your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(balance).map(([currency, amount]) => (
                  <div key={currency} className="flex justify-between items-center p-3 bg-[#0F212E] rounded-md">
                    <div className="flex items-center">
                      <div className="bg-[#243442] p-2 rounded-full mr-3">
                        {currency === 'BTC' && <Bitcoin className="h-5 w-5 text-yellow-500" />}
                        {currency === 'ETH' && <div className="h-5 w-5 flex items-center justify-center text-purple-500">Ξ</div>}
                        {currency === 'USDT' && <DollarSign className="h-5 w-5 text-green-500" />}
                        {currency === 'LTC' && <div className="h-5 w-5 flex items-center justify-center text-blue-500">Ł</div>}
                      </div>
                      <div>
                        <p className="font-bold">{currency}</p>
                        <p className="text-xs text-[#7F8990]">{currency === 'USDT' ? 'Tether' : 
                          currency === 'BTC' ? 'Bitcoin' : 
                          currency === 'ETH' ? 'Ethereum' : 'Litecoin'}</p>
                      </div>
                    </div>
                    <p className="font-mono font-bold">{amount.toFixed(8)}</p>
                  </div>
                ))}
                
                <Button 
                  className="w-full mt-4 bg-[#1375e1] hover:bg-[#0e5dba]"
                  onClick={() => setActiveTab('deposit')}
                >
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-[#243442] text-white hover:bg-[#243442]"
                  onClick={() => setActiveTab('withdraw')}
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Deposit/Withdraw Tabs */}
          <div className="lg:col-span-2">
            <Card className="bg-[#172B3A] border-[#243442] text-white shadow-xl">
              <CardHeader>
                <Tabs defaultValue="deposit" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="deposit" className="text-white data-[state=active]:bg-[#1375e1]">
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="text-white data-[state=active]:bg-[#1375e1]">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-white data-[state=active]:bg-[#1375e1]">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="deposit">
                    <Form {...depositForm}>
                      <form onSubmit={depositForm.handleSubmit(onDepositSubmit)} className="space-y-4">
                        <FormField
                          control={depositForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <div className="grid grid-cols-4 gap-2">
                                {['BTC', 'ETH', 'USDT', 'LTC'].map((currency) => (
                                  <Button
                                    key={currency}
                                    type="button"
                                    variant={field.value === currency ? "default" : "outline"}
                                    className={field.value === currency 
                                      ? "bg-[#1375e1] hover:bg-[#0e5dba]" 
                                      : "border-[#243442] text-white hover:bg-[#243442]"}
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
                        
                        <FormField
                          control={depositForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`Enter amount in ${depositForm.watch('currency')}`}
                                  {...field}
                                  className="bg-[#0F212E] border-[#243442]"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#1375e1] hover:bg-[#0e5dba]"
                        >
                          Generate Deposit Address
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 p-4 bg-[#0F212E] rounded-md">
                      <h3 className="font-bold mb-2">Your {depositForm.watch('currency')} Deposit Address</h3>
                      <div className="flex items-center">
                        <Input
                          readOnly
                          value={cryptoAddresses[depositForm.watch('currency') as keyof typeof cryptoAddresses]}
                          className="bg-[#243442] border-[#1c2d3a] font-mono"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2" 
                          onClick={() => copyToClipboard(cryptoAddresses[depositForm.watch('currency') as keyof typeof cryptoAddresses])}
                        >
                          Copy
                        </Button>
                      </div>
                      <div className="mt-4 p-3 bg-[#243442] rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-[#7F8990]">
                          Only send {depositForm.watch('currency')} to this address. Sending any other cryptocurrency may result in permanent loss.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="withdraw">
                    <div className="p-6 text-center">
                      <div className="bg-[#0F212E] rounded-md p-6 text-center">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-[#7F8990]" />
                        <h3 className="text-xl font-bold mb-2">Withdrawal Coming Soon</h3>
                        <p className="text-[#7F8990] mb-4">
                          We're still working on the withdrawal functionality. Check back soon!
                        </p>
                        <Button 
                          className="bg-[#1375e1] hover:bg-[#0e5dba]"
                          onClick={() => setActiveTab('deposit')}
                        >
                          Make a Deposit Instead
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#243442]">
                            <th className="text-left py-3 px-4 text-[#7F8990] font-medium">Type</th>
                            <th className="text-left py-3 px-4 text-[#7F8990] font-medium">Amount</th>
                            <th className="text-left py-3 px-4 text-[#7F8990] font-medium">Date</th>
                            <th className="text-left py-3 px-4 text-[#7F8990] font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx) => (
                            <tr key={tx.id} className="border-b border-[#243442]">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  {tx.type === 'deposit' 
                                    ? <ArrowDownLeft className="h-4 w-4 text-green-500 mr-2" /> 
                                    : <ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />}
                                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono">
                                {tx.amount} {tx.currency}
                              </td>
                              <td className="py-3 px-4 text-[#7F8990]">{tx.date}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  tx.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                  tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                                  'bg-red-500/20 text-red-500'
                                }`}>
                                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}