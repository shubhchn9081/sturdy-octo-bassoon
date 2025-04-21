import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Code } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FairnessPage() {
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
            <Shield className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">Provably Fair System</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Learn how our provably fair system ensures transparency and fairness in all games
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">What is Provably Fair?</h3>
            <p className="text-[#7F8990] mb-4">
              Provably Fair is a cryptographic system that allows players to verify the fairness of each game outcome. 
              It ensures that neither the player nor the casino can predict or manipulate the result of any game.
            </p>
            <p className="text-[#7F8990] mb-4">
              Our provably fair system uses a combination of server seeds, client seeds, and nonce values to generate 
              game outcomes that can be independently verified by players.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Shield className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Transparent</h3>
                <p className="text-[#7F8990] text-sm">
                  Every bet's outcome can be verified independently using our open verification tools.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <CheckCircle className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Fair</h3>
                <p className="text-[#7F8990] text-sm">
                  Our system mathematically guarantees that game outcomes cannot be manipulated.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Code className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Verifiable</h3>
                <p className="text-[#7F8990] text-sm">
                  Players can verify all past bets and confirm the integrity of the outcome.
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="how-it-works" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="how-it-works" className="text-white data-[state=active]:text-[#1375e1]">How It Works</TabsTrigger>
              <TabsTrigger value="verification" className="text-white data-[state=active]:text-[#1375e1]">Verification</TabsTrigger>
              <TabsTrigger value="faq" className="text-white data-[state=active]:text-[#1375e1]">FAQ</TabsTrigger>
            </TabsList>
            
            <TabsContent value="how-it-works">
              <Card className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">The Provably Fair Process</h3>
                  <ol className="space-y-4 text-[#7F8990]">
                    <li>
                      <span className="font-medium text-white">Step 1: Server Seed Generation</span>
                      <p>Before each round, our server generates a random server seed and creates a hash of it (SHA-256). The hash is shown to the player before the game starts.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 2: Client Seed Input</span>
                      <p>Players can provide their own client seed or use an automatically generated one. This seed is combined with the server seed to determine the game's outcome.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 3: Game Outcome Generation</span>
                      <p>The server and client seeds, along with a nonce (round number), are combined using a cryptographic function to generate the game's outcome.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Step 4: Verification</span>
                      <p>After the game, the server reveals the original unhashed server seed. Players can verify that it matches the previously provided hash and use it to recalculate the game outcome.</p>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verification">
              <Card className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Verifying Game Outcomes</h3>
                  <p className="text-[#7F8990] mb-4">
                    To verify any game outcome, follow these steps:
                  </p>
                  <ol className="space-y-4 text-[#7F8990]">
                    <li>
                      <span className="font-medium text-white">Find your bet in the bet history</span>
                      <p>Navigate to your bet history in your account dashboard to find the specific bet you want to verify.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Get the verification data</span>
                      <p>Click on the bet to view its details, including the server seed, client seed, and nonce value.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Use our verification tool</span>
                      <p>Enter the server seed, client seed, and nonce into our verification tool to recalculate the outcome.</p>
                    </li>
                    <li>
                      <span className="font-medium text-white">Compare the results</span>
                      <p>The calculated result should match the outcome of your original bet, confirming its fairness.</p>
                    </li>
                  </ol>
                  <div className="mt-6">
                    <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
                      Open Verification Tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq">
              <Card className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-white mb-2">Can I change my client seed?</h4>
                      <p className="text-[#7F8990]">Yes, you can change your client seed at any time through your account settings.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">How do I know the server isn't predicting my client seed?</h4>
                      <p className="text-[#7F8990]">The server seed is generated and hashed before you provide your client seed, making it impossible for the server to predict or manipulate the outcome based on your input.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">Are all games provably fair?</h4>
                      <p className="text-[#7F8990]">All our in-house games utilize the provably fair system. Some third-party games may use different RNG (Random Number Generator) systems that are certified by independent testing agencies.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">What cryptographic functions do you use?</h4>
                      <p className="text-[#7F8990]">We use SHA-256 for hashing and HMAC-SHA512 for combining the server seed, client seed, and nonce to generate provably fair outcomes.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-2">What happens if I don't provide a client seed?</h4>
                      <p className="text-[#7F8990]">If you don't provide a client seed, our system will automatically generate one for you, which you can still use to verify your game outcomes.</p>
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