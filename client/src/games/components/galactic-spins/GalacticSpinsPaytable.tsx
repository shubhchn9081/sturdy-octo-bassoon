import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rocket, Star, Zap } from 'lucide-react';

const GalacticSpinsPaytable: React.FC = () => {
  return (
    <div className="text-white">
      <Tabs defaultValue="symbols" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="symbols">Symbols & Payouts</TabsTrigger>
          <TabsTrigger value="features">Special Features</TabsTrigger>
          <TabsTrigger value="rules">Game Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="symbols" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">High-Value Symbols</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#E97EFF] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#BF5DCF] flex items-center justify-center">
                      <span className="text-white font-bold">W</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Wild Symbol</h4>
                  <p className="text-sm text-gray-400">Substitutes for all symbols except Scatter. Full reel expanding wild feature on random spins.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="w-8 h-8">
                    <Rocket className="text-[#FF5533] w-full h-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Rocket</h4>
                  <p className="text-sm text-gray-400">
                    5 of a kind: <span className="text-yellow-400">50×</span><br />
                    4 of a kind: <span className="text-yellow-400">20×</span><br />
                    3 of a kind: <span className="text-yellow-400">5×</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="w-8 h-8">
                    <Star className="text-[#FFF177] w-full h-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Star (Scatter)</h4>
                  <p className="text-sm text-gray-400">
                    3+ Scatters: Trigger Free Spins<br />
                    5 of a kind: <span className="text-yellow-400">25×</span><br />
                    4 of a kind: <span className="text-yellow-400">10×</span><br />
                    3 of a kind: <span className="text-yellow-400">3×</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#6A95EA] flex items-center justify-center">
                    <span className="text-white font-bold">P</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Planet</h4>
                  <p className="text-sm text-gray-400">
                    5 of a kind: <span className="text-yellow-400">15×</span><br />
                    4 of a kind: <span className="text-yellow-400">7×</span><br />
                    3 of a kind: <span className="text-yellow-400">2×</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#9EFF6E] flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Alien</h4>
                  <p className="text-sm text-gray-400">
                    5 of a kind: <span className="text-yellow-400">10×</span><br />
                    4 of a kind: <span className="text-yellow-400">5×</span><br />
                    3 of a kind: <span className="text-yellow-400">1.5×</span>
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold pt-2">Low-Value Symbols</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-[#E97EFF] text-white flex items-center justify-center font-bold">G</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Galaxy</h4>
                  <p className="text-sm text-gray-400">
                    5: <span className="text-yellow-400">5×</span><br />
                    4: <span className="text-yellow-400">2×</span><br />
                    3: <span className="text-yellow-400">1×</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-[#AA8866] text-white flex items-center justify-center font-bold">A</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Asteroid</h4>
                  <p className="text-sm text-gray-400">
                    5: <span className="text-yellow-400">3×</span><br />
                    4: <span className="text-yellow-400">1.5×</span><br />
                    3: <span className="text-yellow-400">0.8×</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 bg-[#101834] p-3 rounded-md">
                <div className="w-12 h-12 bg-[#161D40] rounded-md flex items-center justify-center">
                  <div className="h-8 w-8 rounded-full bg-[#FFAA33] text-white flex items-center justify-center font-bold">C</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">Comet</h4>
                  <p className="text-sm text-gray-400">
                    5: <span className="text-yellow-400">2×</span><br />
                    4: <span className="text-yellow-400">1×</span><br />
                    3: <span className="text-yellow-400">0.5×</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Special Features</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#101834] p-4 rounded-md">
                <h4 className="text-lg font-bold flex items-center">
                  <Zap className="mr-2 text-yellow-400" /> Free Spins
                </h4>
                <p className="mt-2 text-gray-300">
                  Land 3 or more Scatter (Star) symbols anywhere on the reels to trigger the Free Spins bonus:
                </p>
                <ul className="mt-2 space-y-1 text-gray-300 list-disc list-inside">
                  <li>3 Scatters: 10 Free Spins</li>
                  <li>4 Scatters: 15 Free Spins</li>
                  <li>5 Scatters: 20 Free Spins</li>
                </ul>
                <p className="mt-2 text-gray-300">
                  During Free Spins, all wins are multiplied by 2x. Free Spins can be retriggered by landing additional Scatters.
                </p>
              </div>
              
              <div className="bg-[#101834] p-4 rounded-md">
                <h4 className="text-lg font-bold flex items-center">
                  <Zap className="mr-2 text-purple-400" /> Expanding Wilds
                </h4>
                <p className="mt-2 text-gray-300">
                  Wild symbols can randomly expand to cover an entire reel, substituting for all symbols except Scatters. This feature has a chance to activate on any spin.
                </p>
                <p className="mt-2 text-gray-300">
                  During Free Spins, the chance of Expanding Wilds appearing is doubled.
                </p>
              </div>
              
              <div className="bg-[#101834] p-4 rounded-md">
                <h4 className="text-lg font-bold flex items-center">
                  <Zap className="mr-2 text-blue-400" /> Cosmic Multiplier
                </h4>
                <p className="mt-2 text-gray-300">
                  Each winning spin has a chance to trigger a random win multiplier of 2x, 3x, 5x, or 10x. The multiplier is applied to the total win of that spin.
                </p>
              </div>
              
              <div className="bg-[#101834] p-4 rounded-md">
                <h4 className="text-lg font-bold flex items-center">
                  <Zap className="mr-2 text-red-400" /> Black Hole Respins
                </h4>
                <p className="mt-2 text-gray-300">
                  Land 3 Black Hole symbols anywhere on the reels to trigger the Black Hole Respins feature. All Black Hole symbols remain in place, and you receive 3 respins.
                </p>
                <p className="mt-2 text-gray-300">
                  Each new Black Hole that lands during respins remains fixed and resets respins to 3. When respins end, all Black Hole symbols reveal a random prize ranging from 1x to 50x your bet.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Game Rules</h3>
            
            <div className="bg-[#101834] p-4 rounded-md space-y-3">
              <h4 className="font-bold">Game Layout</h4>
              <p className="text-gray-300">
                Galactic Spins is a 5-reel, 3-row video slot with 20 paylines.
              </p>
              
              <h4 className="font-bold">How To Play</h4>
              <ol className="list-decimal list-inside text-gray-300 space-y-1">
                <li>Select your bet amount by adjusting the bet value.</li>
                <li>Choose the number of paylines you wish to play (1-20).</li>
                <li>Click the "SPIN" button to start the game.</li>
                <li>The reels will spin and stop to determine your result.</li>
                <li>Any winning combinations will be highlighted and paid according to the paytable.</li>
              </ol>
              
              <h4 className="font-bold">Winning Combinations</h4>
              <p className="text-gray-300">
                Winning combinations are formed by landing identical symbols on adjacent reels from left to right along an active payline, starting with the leftmost reel.
              </p>
              <p className="text-gray-300">
                The only exception is the Scatter (Star) symbol, which pays in any position on the reels.
              </p>
              
              <h4 className="font-bold">Return to Player (RTP)</h4>
              <p className="text-gray-300">
                Galactic Spins has a theoretical Return to Player (RTP) of 96.5%.
              </p>
              
              <h4 className="font-bold">Maximum Win</h4>
              <p className="text-gray-300">
                The maximum possible win is 1,000x your total bet.
              </p>
              
              <h4 className="font-bold">Autoplay</h4>
              <p className="text-gray-300">
                The Autoplay feature allows you to automatically play a number of game rounds at the current bet level. It will continue until the selected number of rounds is completed or until you stop it manually.
              </p>
              
              <h4 className="font-bold">Malfunction</h4>
              <p className="text-gray-300">
                Malfunction voids all pays and plays. In case of a game malfunction, all bets and wins will be void.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GalacticSpinsPaytable;