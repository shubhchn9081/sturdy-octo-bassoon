import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, Trophy, Award, Gift, Star, Diamond, Crown } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function VIPClubPage() {
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
            <Trophy className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">VIP Club</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Exclusive rewards and benefits for our most valued players
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <p className="text-[#7F8990] mb-4">
              The Stake VIP Club is our way of rewarding our most loyal players with exclusive perks, personalized services, 
              and generous bonuses. As you play on Stake.com, you'll automatically progress through our VIP levels, 
              unlocking new benefits at each tier.
            </p>
          </div>

          <div className="bg-[#0F212E] border border-[#243442] rounded-lg p-6 mb-10">
            <h3 className="text-xl font-semibold mb-4">Your VIP Progress</h3>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Bronze</span>
                <span>Silver</span>
                <span>Gold</span>
                <span>Platinum</span>
                <span>Diamond</span>
              </div>
              <Progress value={25} className="h-2 bg-[#243442] [&>*]:bg-[#1375e1]" />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-[#172B3A] border border-[#243442] rounded-lg p-4">
                <h4 className="text-sm text-[#7F8990] mb-1">Current Level</h4>
                <p className="text-lg font-semibold">Bronze</p>
              </div>
              <div className="bg-[#172B3A] border border-[#243442] rounded-lg p-4">
                <h4 className="text-sm text-[#7F8990] mb-1">Wagered Amount</h4>
                <p className="text-lg font-semibold">$2,500</p>
              </div>
              <div className="bg-[#172B3A] border border-[#243442] rounded-lg p-4">
                <h4 className="text-sm text-[#7F8990] mb-1">Next Level</h4>
                <p className="text-lg font-semibold">Silver <span className="text-sm text-[#7F8990]">($7,500 more)</span></p>
              </div>
            </div>
            <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
              View My VIP Benefits
            </Button>
          </div>

          <h3 className="text-xl font-semibold mb-6">VIP Levels & Benefits</h3>

          <div className="space-y-6 mb-10">
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-[#18293B] p-6 md:w-48 flex flex-col items-center justify-center text-center">
                  <Award className="h-12 w-12 text-[#CD7F32] mb-2" /> {/* Bronze color */}
                  <h3 className="font-bold text-xl mb-1">Bronze</h3>
                  <p className="text-sm text-[#7F8990]">$1,000+ Wagered</p>
                </div>
                <CardContent className="p-6 flex-1">
                  <h4 className="font-semibold mb-3">Benefits Include:</h4>
                  <ul className="text-[#7F8990] space-y-2">
                    <li>• Weekly rakeback: 2%</li>
                    <li>• Monthly bonus: Up to $50</li>
                    <li>• Priority support</li>
                    <li>• Bronze badge on your profile</li>
                  </ul>
                </CardContent>
              </div>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-[#18293B] p-6 md:w-48 flex flex-col items-center justify-center text-center">
                  <Award className="h-12 w-12 text-[#C0C0C0] mb-2" /> {/* Silver color */}
                  <h3 className="font-bold text-xl mb-1">Silver</h3>
                  <p className="text-sm text-[#7F8990]">$10,000+ Wagered</p>
                </div>
                <CardContent className="p-6 flex-1">
                  <h4 className="font-semibold mb-3">Benefits Include:</h4>
                  <ul className="text-[#7F8990] space-y-2">
                    <li>• Weekly rakeback: 5%</li>
                    <li>• Monthly bonus: Up to $250</li>
                    <li>• Dedicated account manager</li>
                    <li>• Enhanced withdrawal limits</li>
                    <li>• Silver badge on your profile</li>
                  </ul>
                </CardContent>
              </div>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-[#18293B] p-6 md:w-48 flex flex-col items-center justify-center text-center">
                  <Award className="h-12 w-12 text-[#FFD700] mb-2" /> {/* Gold color */}
                  <h3 className="font-bold text-xl mb-1">Gold</h3>
                  <p className="text-sm text-[#7F8990]">$50,000+ Wagered</p>
                </div>
                <CardContent className="p-6 flex-1">
                  <h4 className="font-semibold mb-3">Benefits Include:</h4>
                  <ul className="text-[#7F8990] space-y-2">
                    <li>• Weekly rakeback: 10%</li>
                    <li>• Monthly bonus: Up to $1,000</li>
                    <li>• VIP-exclusive promotions</li>
                    <li>• Priority withdrawals</li>
                    <li>• Gold badge on your profile</li>
                    <li>• Higher betting limits</li>
                  </ul>
                </CardContent>
              </div>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-[#18293B] p-6 md:w-48 flex flex-col items-center justify-center text-center">
                  <Diamond className="h-12 w-12 text-[#E5E4E2] mb-2" /> {/* Platinum color */}
                  <h3 className="font-bold text-xl mb-1">Platinum</h3>
                  <p className="text-sm text-[#7F8990]">$250,000+ Wagered</p>
                </div>
                <CardContent className="p-6 flex-1">
                  <h4 className="font-semibold mb-3">Benefits Include:</h4>
                  <ul className="text-[#7F8990] space-y-2">
                    <li>• Weekly rakeback: 15%</li>
                    <li>• Monthly bonus: Up to $5,000</li>
                    <li>• Custom bonuses and offers</li>
                    <li>• VIP-exclusive tournaments</li>
                    <li>• Platinum badge on your profile</li>
                    <li>• Personalized gifts</li>
                    <li>• 24/7 VIP support</li>
                  </ul>
                </CardContent>
              </div>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="bg-[#18293B] p-6 md:w-48 flex flex-col items-center justify-center text-center">
                  <Crown className="h-12 w-12 text-[#B9F2FF] mb-2" /> {/* Diamond color */}
                  <h3 className="font-bold text-xl mb-1">Diamond</h3>
                  <p className="text-sm text-[#7F8990]">$1,000,000+ Wagered</p>
                </div>
                <CardContent className="p-6 flex-1">
                  <h4 className="font-semibold mb-3">Benefits Include:</h4>
                  <ul className="text-[#7F8990] space-y-2">
                    <li>• Weekly rakeback: 20%</li>
                    <li>• Monthly bonus: Up to $25,000</li>
                    <li>• Invitations to exclusive events</li>
                    <li>• Sports and entertainment tickets</li>
                    <li>• Diamond badge on your profile</li>
                    <li>• Luxury gifts</li>
                    <li>• Dedicated VIP host</li>
                    <li>• Unlimited withdrawal limits</li>
                  </ul>
                </CardContent>
              </div>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-6">Exclusive VIP Features</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Gift className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Personalized Bonuses</h3>
                <p className="text-[#7F8990] text-sm">
                  Receive custom bonuses tailored to your playing style and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Star className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">VIP Events</h3>
                <p className="text-[#7F8990] text-sm">
                  Get invited to exclusive events, including sporting events and VIP parties.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Trophy className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Exclusive Tournaments</h3>
                <p className="text-[#7F8990] text-sm">
                  Participate in high-stakes tournaments available only to VIP members.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#0F212E] border border-[#243442] rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Have Questions About the VIP Program?</h3>
            <p className="text-[#7F8990] mb-6 max-w-2xl mx-auto">
              Contact our VIP team to learn more about the benefits and how to progress to higher VIP levels.
            </p>
            <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
              Contact VIP Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}