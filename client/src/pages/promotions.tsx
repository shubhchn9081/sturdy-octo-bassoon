import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Gift, 
  Trophy, 
  Flag, 
  Calendar,
  Clock,
  Users,
  Star,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const PromotionsPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Sample promotion data
  const promotions = [
    {
      id: 1,
      title: 'Weekly Crypto Race',
      type: 'race',
      description: 'Compete for a share of $25,000 in our weekly crypto race. Place bets on any game to earn points.',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661051/races_usdvri.jpg',
      expiresAt: '2025-04-25T23:59:59Z',
      reward: '$25,000 Prize Pool',
      progress: 65,
      participants: 14823
    },
    {
      id: 2,
      title: 'Welcome Bonus',
      type: 'bonus',
      description: 'Get 100% bonus on your first deposit up to $1,000 in crypto. Use code WELCOME100.',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661051/welcome_bonus_hfgxrr.jpg',
      expiresAt: null,
      reward: '100% Bonus',
      progress: null,
      participants: null
    },
    {
      id: 3,
      title: 'VIP Club',
      type: 'vip',
      description: 'Exclusive rewards and bonuses for VIP members. Level up your account to unlock special perks.',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661051/vip_club_eorpp4.jpg',
      expiresAt: null,
      reward: 'Exclusive Benefits',
      progress: null,
      participants: null
    },
    {
      id: 4,
      title: 'Daily Challenge',
      type: 'challenge',
      description: 'Complete daily tasks to earn rewards. New challenges every day.',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661051/daily_challenge_lmhjy9.jpg',
      expiresAt: '2025-04-19T23:59:59Z',
      reward: 'Up to $100 Daily',
      progress: 40,
      participants: 8721
    },
    {
      id: 5,
      title: 'Weekend Reload',
      type: 'bonus',
      description: 'Get a 50% bonus on all deposits made during the weekend.',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661051/weekend_reload_rk5avt.jpg',
      expiresAt: '2025-04-21T23:59:59Z',
      reward: '50% Reload Bonus',
      progress: null,
      participants: null
    },
    {
      id: 6,
      title: 'Easter Special Race',
      type: 'race',
      description: 'Special Easter race with $50,000 prize pool. Top 1000 players win prizes.',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661051/easter_race_hwftgr.jpg',
      expiresAt: '2025-04-22T23:59:59Z',
      reward: '$50,000 Prize Pool',
      progress: 75,
      participants: 22541
    }
  ];

  const formatTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return 'Ongoing';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m remaining`;
    }
  };

  const filteredPromotions = activeTab === 'all' 
    ? promotions 
    : promotions.filter(promo => promo.type === activeTab);

  return (
    <Layout>
      <div className="container p-4 mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Promotions</h1>
          <p className="text-gray-400">Discover special offers, bonuses, and competitions</p>
        </div>

        {/* Featured promotion banner */}
        <div className="relative rounded-lg overflow-hidden mb-8 bg-gradient-to-r from-purple-900 to-blue-900">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="md:w-2/3">
              <div className="flex items-center gap-2 bg-white/10 text-white text-sm px-3 py-1 rounded-full mb-4 w-fit">
                <Trophy className="h-4 w-4" />
                <span>Limited Time Offer</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">$100,000 Grand Prize Draw</h2>
              <p className="text-white/80 mb-6 max-w-2xl">
                Join our biggest promotion of the year! Every $100 wagered earns you one ticket to the draw.
                The more tickets you have, the higher your chances of winning. Main prize: $50,000 in BTC!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Join Now
                </Button>
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-gradient-to-r from-amber-500 to-purple-500 h-40 w-40 rounded-full flex items-center justify-center text-center">
                <div>
                  <p className="text-white font-bold text-xl">5 DAYS</p>
                  <p className="text-white text-sm">REMAINING</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promotion tabs */}
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 bg-[#172B3A] mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#0F1923]">
              All
            </TabsTrigger>
            <TabsTrigger value="race" className="data-[state=active]:bg-[#0F1923]">
              <Flag className="h-4 w-4 mr-2" />
              Races
            </TabsTrigger>
            <TabsTrigger value="bonus" className="data-[state=active]:bg-[#0F1923]">
              <Gift className="h-4 w-4 mr-2" />
              Bonuses
            </TabsTrigger>
            <TabsTrigger value="challenge" className="data-[state=active]:bg-[#0F1923]">
              <Trophy className="h-4 w-4 mr-2" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="vip" className="data-[state=active]:bg-[#0F1923]">
              <Star className="h-4 w-4 mr-2" />
              VIP
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPromotions.map((promo) => (
                <Card key={promo.id} className="overflow-hidden bg-[#172B3A] border-[#223549] text-white">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={promo.image} 
                      alt={promo.title}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-3 right-3 bg-[#0F1923]/80 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeRemaining(promo.expiresAt)}</span>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      {promo.type === 'race' && <Flag className="h-4 w-4 text-red-400" />}
                      {promo.type === 'bonus' && <Gift className="h-4 w-4 text-green-400" />}
                      {promo.type === 'challenge' && <Trophy className="h-4 w-4 text-amber-400" />}
                      {promo.type === 'vip' && <Star className="h-4 w-4 text-purple-400" />}
                      <CardTitle>{promo.title}</CardTitle>
                    </div>
                    <CardDescription className="text-gray-400">
                      {promo.reward}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-300 line-clamp-3">{promo.description}</p>
                    
                    {promo.progress !== null && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span>{promo.progress}%</span>
                        </div>
                        <Progress value={promo.progress} className="h-2" />
                      </div>
                    )}
                    
                    {promo.participants && (
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                        <Users className="h-3 w-3" />
                        <span>{new Intl.NumberFormat().format(promo.participants)} participants</span>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button className="w-full text-sm bg-[#0F1923] border border-[#223549] hover:bg-[#223549]">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Calendar section */}
        <div className="mt-12 bg-[#172B3A] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#223549]">
                <tr>
                  <th className="text-left py-2 text-sm font-medium text-gray-400">Event</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-400">Type</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-400">Start Date</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-400">End Date</th>
                  <th className="text-right py-2 text-sm font-medium text-gray-400">Reward</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#223549]">
                  <td className="py-3 text-sm font-medium">Monthly Mega Race</td>
                  <td className="py-3 text-sm text-gray-400">Race</td>
                  <td className="py-3 text-sm text-gray-400">May 1, 2025</td>
                  <td className="py-3 text-sm text-gray-400">May 31, 2025</td>
                  <td className="py-3 text-sm text-right text-amber-500">$100,000</td>
                </tr>
                <tr className="border-b border-[#223549]">
                  <td className="py-3 text-sm font-medium">Spring Bonus Spins</td>
                  <td className="py-3 text-sm text-gray-400">Bonus</td>
                  <td className="py-3 text-sm text-gray-400">Apr 25, 2025</td>
                  <td className="py-3 text-sm text-gray-400">May 5, 2025</td>
                  <td className="py-3 text-sm text-right text-amber-500">100 Free Spins</td>
                </tr>
                <tr className="border-b border-[#223549]">
                  <td className="py-3 text-sm font-medium">VIP Tournament</td>
                  <td className="py-3 text-sm text-gray-400">Tournament</td>
                  <td className="py-3 text-sm text-gray-400">May 15, 2025</td>
                  <td className="py-3 text-sm text-gray-400">May 18, 2025</td>
                  <td className="py-3 text-sm text-right text-amber-500">$50,000</td>
                </tr>
                <tr className="border-b border-[#223549]">
                  <td className="py-3 text-sm font-medium">Crypto Cashback Week</td>
                  <td className="py-3 text-sm text-gray-400">Cashback</td>
                  <td className="py-3 text-sm text-gray-400">May 10, 2025</td>
                  <td className="py-3 text-sm text-gray-400">May 17, 2025</td>
                  <td className="py-3 text-sm text-right text-amber-500">15% Cashback</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button variant="outline" className="border-[#223549] hover:bg-[#223549]">
              View Full Calendar
            </Button>
          </div>
        </div>

        {/* FAQ section */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: 'How do races work?',
                answer: 'Races are competitions where players earn points by placing bets. At the end of the race period, the players with the most points receive prizes based on their rank.'
              },
              {
                question: 'What are reload bonuses?',
                answer: 'Reload bonuses are special offers for existing players who make additional deposits. They typically give you extra funds to play with as a percentage of your deposit amount.'
              },
              {
                question: 'How do I enter a promotion?',
                answer: 'Most promotions are entered automatically when you meet the requirements. For some promotions, you may need to opt-in by clicking the "Join Now" button on the promotion page.'
              },
              {
                question: 'How are promotion rewards paid out?',
                answer: 'Promotion rewards are typically paid in the currency you used to participate. Some promotions may have specific payout terms which will be clearly stated in the promotion details.'
              }
            ].map((faq, index) => (
              <Card key={index} className="bg-[#172B3A] border-[#223549] text-white">
                <CardHeader>
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PromotionsPage;