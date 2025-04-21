import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  CalendarDays, 
  Gift, 
  Trophy, 
  Zap,
  Users,
  Timer,
  Coins
} from 'lucide-react';

export const PromotionsPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Promotions</h1>
        <p className="text-[#7F8990]">Discover the latest promotions, bonuses, and special offers.</p>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-8">
        <TabsList className="bg-[#0F212E] border border-[#243442] p-1 mb-6">
          <TabsTrigger 
            value="all"
            className={`px-4 py-2 ${activeTab === 'all' ? 'bg-[#1375e1] text-white' : 'text-[#7F8990]'}`}
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="casino"
            className={`px-4 py-2 ${activeTab === 'casino' ? 'bg-[#1375e1] text-white' : 'text-[#7F8990]'}`}
          >
            Casino
          </TabsTrigger>
          <TabsTrigger 
            value="sports"
            className={`px-4 py-2 ${activeTab === 'sports' ? 'bg-[#1375e1] text-white' : 'text-[#7F8990]'}`}
          >
            Sports
          </TabsTrigger>
          <TabsTrigger 
            value="vip"
            className={`px-4 py-2 ${activeTab === 'vip' ? 'bg-[#1375e1] text-white' : 'text-[#7F8990]'}`}
          >
            VIP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Welcome Bonus */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#1375e1] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#FFD700] text-black font-medium">
                  New Users
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Welcome Bonus
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Get a 100% bonus on your first deposit up to $1,000! Start your journey with extra funds.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Valid until December 31, 2025</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Claim Now
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Rakeback */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#42275a] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coins className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#1375e1] text-white font-medium">
                  Weekly
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Weekly Rakeback
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Earn up to 15% rakeback on your weekly losses. The more you play, the more you get back!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>Credited every Monday</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Tournaments */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#614385] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#ff9500] text-white font-medium">
                  Daily
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Daily Tournaments
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Compete in daily tournaments with prize pools up to $10,000. Show off your skills and win big!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>500+ participants daily</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Join Tournament
                </Button>
              </CardContent>
            </Card>

            {/* Reload Bonus */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#396afc] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-20 w-20 text-white opacity-75" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Reload Bonus
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Get a 50% bonus on all deposits made during the weekend. Reload your account and play more!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Every weekend</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Reload Now
                </Button>
              </CardContent>
            </Card>

            {/* Refer a Friend */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#2c3e50] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-20 w-20 text-white opacity-75" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Refer a Friend
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Invite friends and earn 25% of their rakeback for life! The more friends you refer, the more you earn.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Coins className="h-4 w-4 mr-1" />
                  <span>Unlimited referrals</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Get Referral Link
                </Button>
              </CardContent>
            </Card>

            {/* Loyalty Points */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#16222A] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-20 w-20 text-white opacity-75" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Loyalty Points
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Earn loyalty points with every bet you place. Redeem them for bonus cash, free spins, or merchandise!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Coins className="h-4 w-4 mr-1" />
                  <span>1 point for every $10 wagered</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  View Rewards Shop
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="casino" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Casino Welcome Bonus */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#1375e1] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#FFD700] text-black font-medium">
                  New Users
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Casino Welcome Package
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Get a 100% bonus on your first deposit plus 200 free spins on our most popular slots!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Valid until December 31, 2025</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Claim Now
                </Button>
              </CardContent>
            </Card>

            {/* Free Spins */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#614385] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#1375e1] text-white font-medium">
                  Weekly
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Weekly Free Spins
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Deposit at least $50 and get 50 free spins on a featured slot game every week!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>New games featured every Friday</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Get Free Spins
                </Button>
              </CardContent>
            </Card>

            {/* Slot Tournaments */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#396afc] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#ff9500] text-white font-medium">
                  Daily
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Slot Tournaments
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Spin to win in our daily slot tournaments! The highest multiplier wins $5,000 in cash prizes.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>300+ participants daily</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Join Tournament
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sports" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Free Bet */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#1375e1] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#FFD700] text-black font-medium">
                  New Users
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-[#1375e1]" />
                  $50 Free Bet
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Sign up and place your first bet of $50 or more. If it loses, get a free bet of equal value!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Valid for new users only</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Claim Free Bet
                </Button>
              </CardContent>
            </Card>

            {/* Acca Boost */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#2c3e50] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="h-20 w-20 text-white opacity-75" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Acca Boost
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Get up to 50% extra on your accumulator wins! The more selections you add, the bigger the boost.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>Available on all sports</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Bet Now
                </Button>
              </CardContent>
            </Card>

            {/* Early Payout */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#614385] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-20 w-20 text-white opacity-75" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-[#1375e1]" />
                  Early Payout
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Get your bet paid out early if your team goes 2 goals ahead in soccer or 15 points ahead in basketball!
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Zap className="h-4 w-4 mr-1" />
                  <span>Instant settlement</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vip" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* VIP Welcome */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#1375e1] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gift className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#FFD700] text-black font-medium">
                  VIP Only
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-[#1375e1]" />
                  VIP Welcome Gift
                </h3>
                <p className="text-[#7F8990] mb-4">
                  New VIP members receive a special welcome gift pack including bonus cash and exclusive merchandise.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span>Upon reaching VIP status</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  View VIP Program
                </Button>
              </CardContent>
            </Card>

            {/* VIP Tournaments */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#614385] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Trophy className="h-20 w-20 text-white opacity-75" />
                </div>
                <Badge className="absolute top-3 right-3 bg-[#1375e1] text-white font-medium">
                  Monthly
                </Badge>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-[#1375e1]" />
                  VIP Tournaments
                </h3>
                <p className="text-[#7F8990] mb-4">
                  Exclusive high-stakes tournaments for VIP members with prize pools up to $100,000.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Limited to 100 players</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Join VIP Tournament
                </Button>
              </CardContent>
            </Card>

            {/* Cashback */}
            <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden hover:border-[#1375e1] transition-all">
              <div className="h-48 bg-gradient-to-r from-[#1A3045] to-[#2c3e50] relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Coins className="h-20 w-20 text-white opacity-75" />
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Coins className="mr-2 h-5 w-5 text-[#1375e1]" />
                  VIP Cashback
                </h3>
                <p className="text-[#7F8990] mb-4">
                  VIP members receive up to 20% weekly cashback on all losses, credited directly to your account.
                </p>
                <div className="flex items-center text-sm text-[#7F8990] mb-4">
                  <Timer className="h-4 w-4 mr-1" />
                  <span>Processed every Monday</span>
                </div>
                <Button className="w-full bg-[#1375e1] hover:bg-[#1060c0]">
                  Check Cashback
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-[#0F212E] border border-[#243442] rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Don't Miss Out on Exclusive Offers!</h3>
        <p className="text-[#7F8990] mb-6 max-w-2xl mx-auto">
          Subscribe to our newsletter to receive the latest promotions and exclusive offers directly to your inbox.
        </p>
        <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
          Subscribe Now
        </Button>
      </div>
    </div>
  );
};

export default PromotionsPage;