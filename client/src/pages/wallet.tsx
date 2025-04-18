import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ClipboardCopy, 
  History, 
  RefreshCcw, 
  ShieldCheck,
  Coins
} from 'lucide-react';

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const [copied, setCopied] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('bitcoin');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const walletAddress = 'bc1qxy2kgdygjrsqtzf2ln0yxw3t0velhdk6n73ee3';
  const currencies = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', balance: 0.0325 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', balance: 0.521 },
    { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', balance: 2.34 },
    { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', balance: 552.12 },
    { id: 'solana', name: 'Solana', symbol: 'SOL', balance: 4.75 },
  ];

  const transactions = [
    { id: 1, type: 'deposit', currency: 'BTC', amount: 0.0125, status: 'completed', date: '2025-04-15T10:30:00', confirmations: 6 },
    { id: 2, type: 'withdrawal', currency: 'ETH', amount: 0.25, status: 'completed', date: '2025-04-10T14:22:00', confirmations: 12 },
    { id: 3, type: 'deposit', currency: 'BTC', amount: 0.0075, status: 'completed', date: '2025-03-22T08:45:00', confirmations: 6 },
    { id: 4, type: 'withdrawal', currency: 'DOGE', amount: 150.5, status: 'completed', date: '2025-03-15T16:10:00', confirmations: 10 },
    { id: 5, type: 'deposit', currency: 'SOL', amount: 1.2, status: 'completed', date: '2025-03-08T11:05:00', confirmations: 8 },
  ];

  return (
    <Layout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Balance info */}
          <div className="md:w-1/3 space-y-4">
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-xl">Your Balance</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  Manage your cryptocurrencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0F1923] p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Balance (USD)</span>
                    <Button variant="ghost" size="sm" className="h-6 p-0">
                      <RefreshCcw className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-2xl font-bold mt-1">$1,245.32</p>
                </div>

                <Separator className="my-4 bg-[#223549]" />

                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Your Cryptocurrencies</p>
                  
                  {currencies.map((currency) => (
                    <div 
                      key={currency.id} 
                      className={`flex justify-between items-center p-3 rounded-md ${
                        selectedCurrency === currency.id ? 'bg-[#2E4358]' : 'bg-[#0F1923]'
                      } cursor-pointer`}
                      onClick={() => setSelectedCurrency(currency.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#172B3A] flex items-center justify-center">
                          {currency.symbol.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{currency.name}</p>
                          <p className="text-xs text-gray-400">{currency.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{currency.balance} {currency.symbol}</p>
                        <p className="text-xs text-gray-400">
                          ${(currency.balance * (currency.id === 'bitcoin' ? 30000 : 
                            currency.id === 'ethereum' ? 2000 : 
                            currency.id === 'litecoin' ? 80 :
                            currency.id === 'dogecoin' ? 0.12 :
                            currency.id === 'solana' ? 120 : 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                  <CardTitle className="text-sm">Security Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-[#0F1923] p-3 rounded-md">
                    <div className="h-8 w-8 rounded-full bg-[#172B3A] flex items-center justify-center text-amber-500">
                      !
                    </div>
                    <div>
                      <p className="text-sm font-medium">Enable 2FA</p>
                      <p className="text-xs text-gray-400">Protect your account with two-factor authentication</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#0F1923] p-3 rounded-md">
                    <div className="h-8 w-8 rounded-full bg-[#172B3A] flex items-center justify-center text-green-500">
                      ✓
                    </div>
                    <div>
                      <p className="text-sm font-medium">Strong Password</p>
                      <p className="text-xs text-gray-400">Your password meets security requirements</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Deposit/Withdraw */}
          <div className="md:w-2/3">
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader>
                <Tabs defaultValue="deposit" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 bg-[#0F1923]">
                    <TabsTrigger value="deposit" className="data-[state=active]:bg-[#172B3A]">
                      <ArrowDownLeft className="h-4 w-4 mr-2" />
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#172B3A]">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Withdraw
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="data-[state=active]:bg-[#172B3A]">
                      <History className="h-4 w-4 mr-2" />
                      Transactions
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="deposit" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Deposit {currencies.find(c => c.id === selectedCurrency)?.name}</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-[#172B3A] p-4 rounded-md">
                          <Label className="text-sm text-gray-400">Deposit Address</Label>
                          <div className="flex mt-2">
                            <Input 
                              readOnly 
                              value={walletAddress} 
                              className="flex-1 bg-[#0F1923] border-[#223549] text-gray-300"
                            />
                            <Button 
                              variant="outline" 
                              className="ml-2 bg-[#0F1923] border-[#223549] hover:bg-[#223549]"
                              onClick={() => copyToClipboard(walletAddress)}
                            >
                              <ClipboardCopy className="h-4 w-4" />
                            </Button>
                          </div>
                          {copied && (
                            <p className="text-xs text-green-400 mt-1">Address copied to clipboard!</p>
                          )}
                          <p className="text-xs text-gray-400 mt-3">
                            Only send {currencies.find(c => c.id === selectedCurrency)?.name} ({currencies.find(c => c.id === selectedCurrency)?.symbol}) to this address. 
                            Sending any other cryptocurrency may result in permanent loss.
                          </p>
                        </div>
                        
                        <div className="bg-[#172B3A] p-4 rounded-md">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">QR Code</h4>
                            <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
                              {currencies.find(c => c.id === selectedCurrency)?.symbol}
                            </span>
                          </div>
                          <div className="flex justify-center py-4">
                            <div className="h-48 w-48 bg-white flex items-center justify-center text-black">
                              QR Code for {currencies.find(c => c.id === selectedCurrency)?.symbol} address
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Important Information</h4>
                          <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
                            <li>Minimum deposit amount: 0.0001 {currencies.find(c => c.id === selectedCurrency)?.symbol}</li>
                            <li>Deposits typically require 1-6 network confirmations</li>
                            <li>Unconfirmed transactions will appear as pending in your transaction history</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="withdraw" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Withdraw {currencies.find(c => c.id === selectedCurrency)?.name}</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-[#172B3A] p-4 rounded-md">
                          <div className="flex justify-between mb-2">
                            <Label className="text-sm text-gray-400">Available Balance</Label>
                            <span className="text-sm">
                              {currencies.find(c => c.id === selectedCurrency)?.balance} {currencies.find(c => c.id === selectedCurrency)?.symbol}
                            </span>
                          </div>
                          
                          <Label className="text-sm text-gray-400">Recipient Address</Label>
                          <Input 
                            placeholder={`Enter ${currencies.find(c => c.id === selectedCurrency)?.symbol} address`}
                            className="mt-1 bg-[#0F1923] border-[#223549]"
                          />
                          
                          <div className="flex items-end gap-2 mt-3">
                            <div className="flex-1">
                              <Label className="text-sm text-gray-400">Amount</Label>
                              <Input 
                                type="number" 
                                placeholder="0.00"
                                className="mt-1 bg-[#0F1923] border-[#223549]"
                              />
                            </div>
                            <Button variant="outline" className="bg-[#0F1923] border-[#223549] hover:bg-[#223549]">
                              MAX
                            </Button>
                          </div>
                          
                          <div className="mt-3">
                            <Label className="text-sm text-gray-400">Network Fee</Label>
                            <Select defaultValue="medium">
                              <SelectTrigger className="bg-[#0F1923] border-[#223549]">
                                <SelectValue placeholder="Select fee" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#172B3A] border-[#223549]">
                                <SelectItem value="low">Low (slower)</SelectItem>
                                <SelectItem value="medium">Medium (recommended)</SelectItem>
                                <SelectItem value="high">High (faster)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-400 mt-1">
                              Estimated fee: 0.0001 {currencies.find(c => c.id === selectedCurrency)?.symbol}
                            </p>
                          </div>
                        </div>
                        
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Withdraw {currencies.find(c => c.id === selectedCurrency)?.symbol}
                        </Button>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Important Information</h4>
                          <ul className="text-sm text-gray-400 space-y-2 list-disc pl-4">
                            <li>Minimum withdrawal: 0.001 {currencies.find(c => c.id === selectedCurrency)?.symbol}</li>
                            <li>Maximum withdrawal: {currencies.find(c => c.id === selectedCurrency)?.balance} {currencies.find(c => c.id === selectedCurrency)?.symbol}</li>
                            <li>Withdrawals may require email confirmation</li>
                            <li>Always double-check the destination address before confirming</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Transaction History</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-[#223549]">
                            <tr>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Type</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Date</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Amount</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Status</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Confirmations</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-[#223549]">
                                <td className="py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    {tx.type === 'deposit' ? 
                                      <ArrowDownLeft className="h-4 w-4 text-green-400" /> :
                                      <ArrowUpRight className="h-4 w-4 text-amber-500" />
                                    }
                                    <span className="capitalize">{tx.type}</span>
                                  </div>
                                </td>
                                <td className="py-3 text-sm text-gray-400">
                                  {new Date(tx.date).toLocaleString()}
                                </td>
                                <td className="py-3 text-sm">
                                  <span className={tx.type === 'deposit' ? 'text-green-400' : 'text-amber-500'}>
                                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                                  </span>
                                </td>
                                <td className="py-3 text-sm">
                                  <span className="px-2 py-1 rounded-full text-xs bg-green-400/20 text-green-400">
                                    {tx.status}
                                  </span>
                                </td>
                                <td className="py-3 text-sm">
                                  {tx.confirmations}/6
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-center mt-4">
                        <Button variant="outline" className="bg-[#172B3A] border-[#223549] hover:bg-[#223549]">
                          Load More
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WalletPage;