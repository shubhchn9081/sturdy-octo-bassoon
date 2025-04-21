import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, BookOpen, Info, Gamepad2, PanelRight, DollarSign } from 'lucide-react';

export default function GuidesPage() {
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
            <BookOpen className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">How-to Guides</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Learn everything you need to know about using Stake.com
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <p className="text-[#7F8990] mb-4">
              Whether you're new to online gambling or a seasoned player, our comprehensive guides will help you 
              navigate the platform, understand game mechanics, and make the most of your experience.
            </p>
          </div>

          <h3 className="text-xl font-semibold mb-6">Getting Started</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-12 flex items-center mb-4">
                  <Info className="text-[#1375e1] h-8 w-8" />
                  <h3 className="text-lg font-semibold ml-3">Account Setup</h3>
                </div>
                <ul className="text-[#7F8990] space-y-2">
                  <li className="hover:text-white cursor-pointer">• How to register an account</li>
                  <li className="hover:text-white cursor-pointer">• Verifying your account</li>
                  <li className="hover:text-white cursor-pointer">• Setting up two-factor authentication</li>
                  <li className="hover:text-white cursor-pointer">• Managing your profile</li>
                  <li className="hover:text-white cursor-pointer">• Account security best practices</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-12 flex items-center mb-4">
                  <DollarSign className="text-[#1375e1] h-8 w-8" />
                  <h3 className="text-lg font-semibold ml-3">Deposits & Withdrawals</h3>
                </div>
                <ul className="text-[#7F8990] space-y-2">
                  <li className="hover:text-white cursor-pointer">• Making your first deposit</li>
                  <li className="hover:text-white cursor-pointer">• Cryptocurrency basics for beginners</li>
                  <li className="hover:text-white cursor-pointer">• How to withdraw your winnings</li>
                  <li className="hover:text-white cursor-pointer">• Understanding transaction fees</li>
                  <li className="hover:text-white cursor-pointer">• Troubleshooting payment issues</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-12 flex items-center mb-4">
                  <Gamepad2 className="text-[#1375e1] h-8 w-8" />
                  <h3 className="text-lg font-semibold ml-3">Game Basics</h3>
                </div>
                <ul className="text-[#7F8990] space-y-2">
                  <li className="hover:text-white cursor-pointer">• Understanding house edge</li>
                  <li className="hover:text-white cursor-pointer">• How provably fair works</li>
                  <li className="hover:text-white cursor-pointer">• Reading game statistics</li>
                  <li className="hover:text-white cursor-pointer">• Game rules and strategies</li>
                  <li className="hover:text-white cursor-pointer">• Finding games that suit your style</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-6">Game Guides</h3>

          <Card className="bg-[#0F212E] border-[#243442] text-white mb-10">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="bg-[#1375e1] h-2 w-2 rounded-full mr-2"></span>
                    Crash
                  </h4>
                  <ul className="text-[#7F8990] space-y-2 pl-4">
                    <li className="hover:text-white cursor-pointer">• Understanding crash mechanics</li>
                    <li className="hover:text-white cursor-pointer">• Auto cashout strategies</li>
                    <li className="hover:text-white cursor-pointer">• Bankroll management for crash</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="bg-[#1375e1] h-2 w-2 rounded-full mr-2"></span>
                    Dice
                  </h4>
                  <ul className="text-[#7F8990] space-y-2 pl-4">
                    <li className="hover:text-white cursor-pointer">• Dice rules and payouts</li>
                    <li className="hover:text-white cursor-pointer">• Optimal betting strategies</li>
                    <li className="hover:text-white cursor-pointer">• Advanced dice techniques</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="bg-[#1375e1] h-2 w-2 rounded-full mr-2"></span>
                    Slots
                  </h4>
                  <ul className="text-[#7F8990] space-y-2 pl-4">
                    <li className="hover:text-white cursor-pointer">• How slots RTP works</li>
                    <li className="hover:text-white cursor-pointer">• Understanding volatility</li>
                    <li className="hover:text-white cursor-pointer">• Finding the best slots</li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="bg-[#1375e1] h-2 w-2 rounded-full mr-2"></span>
                    Blackjack
                  </h4>
                  <ul className="text-[#7F8990] space-y-2 pl-4">
                    <li className="hover:text-white cursor-pointer">• Blackjack basic strategy</li>
                    <li className="hover:text-white cursor-pointer">• Card counting fundamentals</li>
                    <li className="hover:text-white cursor-pointer">• Advanced blackjack tactics</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="bg-[#1375e1] h-2 w-2 rounded-full mr-2"></span>
                    Roulette
                  </h4>
                  <ul className="text-[#7F8990] space-y-2 pl-4">
                    <li className="hover:text-white cursor-pointer">• Roulette betting system</li>
                    <li className="hover:text-white cursor-pointer">• Inside vs. outside bets</li>
                    <li className="hover:text-white cursor-pointer">• Roulette strategies explained</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <span className="bg-[#1375e1] h-2 w-2 rounded-full mr-2"></span>
                    Sports Betting
                  </h4>
                  <ul className="text-[#7F8990] space-y-2 pl-4">
                    <li className="hover:text-white cursor-pointer">• Understanding betting odds</li>
                    <li className="hover:text-white cursor-pointer">• Parlay and accumulator bets</li>
                    <li className="hover:text-white cursor-pointer">• Value betting explained</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-xl font-semibold mb-6">Advanced Topics</h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-12 flex items-center mb-4">
                  <PanelRight className="text-[#1375e1] h-8 w-8" />
                  <h3 className="text-lg font-semibold ml-3">VIP Program</h3>
                </div>
                <ul className="text-[#7F8990] space-y-2">
                  <li className="hover:text-white cursor-pointer">• How to reach VIP status</li>
                  <li className="hover:text-white cursor-pointer">• VIP levels and benefits</li>
                  <li className="hover:text-white cursor-pointer">• Rakeback and bonuses explained</li>
                  <li className="hover:text-white cursor-pointer">• VIP account management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6">
                <div className="h-12 flex items-center mb-4">
                  <BookOpen className="text-[#1375e1] h-8 w-8" />
                  <h3 className="text-lg font-semibold ml-3">Responsible Gambling</h3>
                </div>
                <ul className="text-[#7F8990] space-y-2">
                  <li className="hover:text-white cursor-pointer">• Setting personal limits</li>
                  <li className="hover:text-white cursor-pointer">• Signs of problem gambling</li>
                  <li className="hover:text-white cursor-pointer">• Self-exclusion options</li>
                  <li className="hover:text-white cursor-pointer">• Resources for support</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#0F212E] border border-[#243442] rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Can't Find What You're Looking For?</h3>
            <p className="text-[#7F8990] mb-6 max-w-2xl mx-auto">
              If you have specific questions or need additional help, our 24/7 support team is always available to assist you.
            </p>
            <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}