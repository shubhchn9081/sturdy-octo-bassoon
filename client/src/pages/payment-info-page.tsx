import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Wallet, ArrowUpDown, Clock, Shield, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiBitcoin, SiEthereum, SiLitecoin, SiDogecoin, SiTether } from 'react-icons/si';

export default function PaymentInfoPage() {
  const [, setLocation] = useLocation();

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
      
      <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg mb-6">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Wallet className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">Payment Information</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Learn about deposits, withdrawals, and payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cryptocurrencies" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="cryptocurrencies" className="text-white data-[state=active]:text-[#1375e1]">Cryptocurrencies</TabsTrigger>
              <TabsTrigger value="deposits" className="text-white data-[state=active]:text-[#1375e1]">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals" className="text-white data-[state=active]:text-[#1375e1]">Withdrawals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cryptocurrencies">
              <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Supported Cryptocurrencies</h3>
                  <p className="text-[#7F8990] mb-6">
                    Stake.com supports a wide range of cryptocurrencies for deposits and withdrawals. 
                    We're continuously working to add more options to provide you with the most flexible experience.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center">
                        <SiBitcoin className="text-[#F7931A] h-10 w-10 mb-2" />
                        <h4 className="font-medium">Bitcoin (BTC)</h4>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center">
                        <SiEthereum className="text-[#627EEA] h-10 w-10 mb-2" />
                        <h4 className="font-medium">Ethereum (ETH)</h4>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center">
                        <SiLitecoin className="text-[#A5A9A9] h-10 w-10 mb-2" />
                        <h4 className="font-medium">Litecoin (LTC)</h4>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center">
                        <SiDogecoin className="text-[#C2A633] h-10 w-10 mb-2" />
                        <h4 className="font-medium">Dogecoin (DOGE)</h4>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center">
                        <SiTether className="text-[#26A17B] h-10 w-10 mb-2" />
                        <h4 className="font-medium">Tether (USDT)</h4>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Benefits of Cryptocurrency</h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <ArrowUpDown className="text-[#1375e1] h-8 w-8 mb-3" />
                        <h4 className="font-medium mb-2">Low Transaction Fees</h4>
                        <p className="text-[#7F8990] text-sm">
                          Enjoy minimal fees compared to traditional payment methods
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Clock className="text-[#1375e1] h-8 w-8 mb-3" />
                        <h4 className="font-medium mb-2">Fast Transactions</h4>
                        <p className="text-[#7F8990] text-sm">
                          Quick deposit and withdrawal times, often within minutes
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-[#172B3A] border-[#243442]">
                      <CardContent className="p-4 flex flex-col items-center text-center">
                        <Shield className="text-[#1375e1] h-8 w-8 mb-3" />
                        <h4 className="font-medium mb-2">Enhanced Privacy</h4>
                        <p className="text-[#7F8990] text-sm">
                          Greater privacy protection compared to traditional banking
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="deposits">
              <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">How to Make a Deposit</h3>
                  <ol className="space-y-4 text-[#7F8990]">
                    <li>
                      <span className="font-medium text-white">Step 1: Access your wallet</span>
                      <p>Go to your account and click on "Wallet" or "Deposit" in the top navigation.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 2: Select cryptocurrency</span>
                      <p>Choose which cryptocurrency you'd like to deposit from the available options.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 3: Get deposit address</span>
                      <p>Copy the unique deposit address or scan the QR code provided.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 4: Send funds</span>
                      <p>From your external wallet or exchange, send the desired amount to the provided address.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 5: Wait for confirmation</span>
                      <p>Depending on the cryptocurrency and network congestion, your funds will appear in your Stake.com account after a certain number of blockchain confirmations.</p>
                    </li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Deposit Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Minimum Deposit</h4>
                      <p className="text-[#7F8990] mb-6">
                        The minimum deposit amount varies by cryptocurrency. Please check the deposit page for specific limits.
                      </p>
                      
                      <h4 className="font-medium text-white mb-3">Processing Time</h4>
                      <p className="text-[#7F8990]">
                        Most deposits are credited after 1-3 blockchain confirmations. The time this takes depends on the cryptocurrency network's current congestion.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-3">Deposit Fees</h4>
                      <p className="text-[#7F8990] mb-6">
                        Stake.com does not charge any fees for deposits. However, blockchain network fees apply and are deducted from the transaction by the network.
                      </p>
                      
                      <h4 className="font-medium text-white mb-3">Important Notes</h4>
                      <ul className="text-[#7F8990] list-disc pl-5 space-y-2">
                        <li>Always double-check the deposit address before sending funds</li>
                        <li>Make sure you're sending the correct cryptocurrency to the matching address</li>
                        <li>Deposits sent to the wrong address may be permanently lost</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="withdrawals">
              <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">How to Withdraw</h3>
                  <ol className="space-y-4 text-[#7F8990]">
                    <li>
                      <span className="font-medium text-white">Step 1: Access withdrawal page</span>
                      <p>Navigate to your account and click on "Wallet" or "Withdraw" in the top navigation.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 2: Select cryptocurrency</span>
                      <p>Choose which cryptocurrency you'd like to withdraw from your available balances.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 3: Enter withdrawal address</span>
                      <p>Carefully input the destination wallet address where you want to receive your funds.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 4: Enter amount</span>
                      <p>Specify the amount you wish to withdraw. The system will display any applicable fees.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 5: Confirm withdrawal</span>
                      <p>Review all details and confirm the withdrawal. You may need to complete additional security verification.</p>
                    </li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Withdrawal Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">Minimum Withdrawal</h4>
                      <p className="text-[#7F8990] mb-6">
                        The minimum withdrawal amount varies by cryptocurrency. This is to ensure that withdrawal amounts are economically sensible relative to network fees.
                      </p>
                      
                      <h4 className="font-medium text-white mb-3">Processing Time</h4>
                      <p className="text-[#7F8990]">
                        Most withdrawals are processed within 10 minutes to 1 hour. During peak times or for security reasons, some withdrawals may take longer to process.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-3">Withdrawal Fees</h4>
                      <p className="text-[#7F8990] mb-6">
                        Withdrawal fees vary by cryptocurrency and are dynamic based on current network conditions. The exact fee will be displayed before you confirm your withdrawal.
                      </p>
                      
                      <h4 className="font-medium text-white mb-3">Security Measures</h4>
                      <p className="text-[#7F8990]">
                        For your protection, large withdrawals may require additional verification. We use multi-level approval systems to ensure the security of all transactions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-[#172B3A] border border-[#243442] rounded-lg p-4">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-[#1375e1] mt-0.5 mr-3 flex-shrink-0" />
                      <p className="text-[#7F8990] text-sm">
                        <span className="font-medium text-white">Note about wager requirements: </span> 
                        If you've received bonuses or promotions, you may need to meet certain wagering requirements before withdrawing. 
                        Check your bonus terms or contact support for specific details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}