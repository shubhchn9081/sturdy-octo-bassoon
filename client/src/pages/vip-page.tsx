import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Trophy, 
  Clock, 
  MessageSquare, 
  Car, 
  Palmtree as PalmIcon, 
  Zap, 
  Gamepad2, 
  ShieldCheck,
  Crown,
  Gift,
  Star,
  Sparkles,
  Diamond
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function VIPPage() {
  const [, setLocation] = useLocation();
  const [rotatingText, setRotatingText] = useState('exclusive rewards');
  
  // Create a rotating text effect for luxury terms
  useEffect(() => {
    const luxuryTerms = [
      'exclusive rewards',
      'premium service',
      'luxury prizes',
      'VIP treatment',
      'priority access'
    ];
    
    const interval = setInterval(() => {
      const currentIndex = luxuryTerms.indexOf(rotatingText);
      const nextIndex = (currentIndex + 1) % luxuryTerms.length;
      setRotatingText(luxuryTerms[nextIndex]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [rotatingText]);

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-6 flex items-center border-[#243442] text-white hover:bg-[#172B3A]"
        onClick={() => setLocation('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      {/* Hero section with premium styling */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0c1824] to-[#162c3f] mb-10 shadow-xl shadow-black/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1375e1] opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1375e1] opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4 blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-full h-full max-w-md max-h-md bg-[#4cd964] opacity-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        
        <div className="relative z-10 px-8 py-20 md:py-24 flex flex-col items-center">
          <div className="absolute top-5 right-5 flex items-center space-x-1.5 bg-[#0F212E]/80 rounded-full px-3 py-1.5 border border-[#243442]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-green-400">Online VIP Support</span>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] p-3 rounded-full mr-3 shadow-lg shadow-blue-900/20">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              ELITE VIP PROGRAM
            </h2>
          </div>
          
          <div className="w-24 h-1 bg-gradient-to-r from-[#1375e1] to-[#4cd964] rounded-full mb-6"></div>
          
          <h3 className="text-xl md:text-2xl text-center font-light text-white/90 mb-2 w-full max-w-2xl">
            Experience the ultimate gaming journey with <span className="font-semibold text-[#4cd964]">{rotatingText}</span>
          </h3>
          
          <p className="text-[#7F8990] mb-8 max-w-2xl text-center">
            Join our exclusive VIP program and unlock extraordinary premium benefits, personalized services, 
            and luxury rewards reserved only for our most valued players.
          </p>
          
          <Button 
            className="bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] hover:from-[#1060c0] hover:to-[#0a4e9a] text-white px-8 py-6 text-xl font-medium rounded-lg shadow-lg shadow-blue-900/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/40 hover:transform hover:scale-105 group"
            onClick={() => setLocation('/recharge')}
          >
            <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            Become a VIP
          </Button>
        </div>
        
        {/* Qualification indicators */}
        <div className="relative z-10 bg-gradient-to-r from-[#0F212E]/90 to-[#0F212E]/95 border-t border-[#243442] px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h3 className="text-lg font-medium text-white mb-4 md:mb-0">
              Qualify for VIP Status:
            </h3>
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1375e1] to-[#0d5bb2] flex items-center justify-center shadow-md shadow-blue-900/20 mr-3">
                  <span className="text-white font-bold">₹</span>
                </div>
                <div>
                  <div className="text-[#7F8990] text-sm">Deposit & Wager</div>
                  <div className="text-white font-bold">₹100,000<span className="text-[#4cd964]">+</span></div>
                </div>
              </div>
              
              <div className="hidden sm:block h-10 w-px bg-[#243442]"></div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1375e1] to-[#0d5bb2] flex items-center justify-center shadow-md shadow-blue-900/20 mr-3">
                  <span className="text-white font-bold">$</span>
                </div>
                <div>
                  <div className="text-[#7F8990] text-sm">Deposit & Wager</div>
                  <div className="text-white font-bold">$1,500<span className="text-[#4cd964]">+</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg lg:w-2/3">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Star className="h-6 w-6 text-[#1375e1]" />
              <CardTitle className="text-2xl font-bold ml-3">Exclusive VIP Benefits</CardTitle>
            </div>
            <CardDescription className="text-[#7F8990]">
              Enjoy premium perks designed for our most valuable players
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Main benefits with enhanced premium styling */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-[#0F212E] to-[#132a3a] border-[#243442] hover:border-[#1375e1] text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 bg-gradient-to-br from-[#132a3a] to-[#0d1c27] p-3 rounded-full ring-2 ring-[#1375e1]/10 group-hover:ring-[#1375e1]/30 transition-all shadow-inner">
                      <Zap className="h-7 w-7 text-[#1375e1] group-hover:text-[#4cd964] transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-[#4cd964] transition-colors duration-300">Priority Withdrawals</h3>
                      <p className="text-[#7F8990]">Get your funds within 10 minutes</p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-16">
                    <p className="text-[#7F8990]">
                      As a VIP member, your withdrawal requests are processed with the highest priority. 
                      We guarantee that all VIP withdrawals will be processed within just 10 minutes.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Instant processing</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Dedicated payment channels</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-[#0F212E] to-[#132a3a] border-[#243442] hover:border-[#1375e1] text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 bg-gradient-to-br from-[#132a3a] to-[#0d1c27] p-3 rounded-full ring-2 ring-[#1375e1]/10 group-hover:ring-[#1375e1]/30 transition-all shadow-inner">
                      <MessageSquare className="h-7 w-7 text-[#1375e1] group-hover:text-[#4cd964] transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-[#4cd964] transition-colors duration-300">Dedicated Support Agent</h3>
                      <p className="text-[#7F8990]">Personal assistance 24/7</p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-16">
                    <p className="text-[#7F8990]">
                      Enjoy the luxury of having a dedicated VIP support agent who knows your preferences and 
                      gaming habits. Your personal agent is available 24/7 to assist you.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Priority response</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Personalized service</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-[#0F212E] to-[#132a3a] border-[#243442] hover:border-[#1375e1] text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 bg-gradient-to-br from-[#132a3a] to-[#0d1c27] p-3 rounded-full ring-2 ring-[#1375e1]/10 group-hover:ring-[#1375e1]/30 transition-all shadow-inner">
                      <Gamepad2 className="h-7 w-7 text-[#1375e1] group-hover:text-[#4cd964] transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-[#4cd964] transition-colors duration-300">Exclusive Game Access</h3>
                      <p className="text-[#7F8990]">Be the first to play new games</p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-16">
                    <p className="text-[#7F8990]">
                      Get exclusive early access to new game releases before they're available to regular players. 
                      VIP members also gain access to special VIP-only games.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Early access to new titles</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">VIP-exclusive game modes</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-[#0F212E] to-[#132a3a] border-[#243442] hover:border-[#1375e1] text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/10 group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 bg-gradient-to-br from-[#132a3a] to-[#0d1c27] p-3 rounded-full ring-2 ring-[#1375e1]/10 group-hover:ring-[#1375e1]/30 transition-all shadow-inner">
                      <ShieldCheck className="h-7 w-7 text-[#1375e1] group-hover:text-[#4cd964] transition-colors duration-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold group-hover:text-[#4cd964] transition-colors duration-300">Higher Betting Limits</h3>
                      <p className="text-[#7F8990]">Play with no restrictions</p>
                    </div>
                  </div>
                  <div className="space-y-3 pl-16">
                    <p className="text-[#7F8990]">
                      VIP members enjoy significantly higher betting limits across all games. 
                      Play with the stakes that match your style without restrictions.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Custom betting limits</span>
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-[#1375e1] rounded-full mr-2"></div>
                        <span className="text-[#a3b3bf]">Tailored to your profile</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] hover:from-[#1060c0] hover:to-[#0a4e9a] text-white py-6 text-lg font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/30 group"
              onClick={() => setLocation('/recharge')}
            >
              <Crown className="h-5 w-5 mr-2 text-yellow-300 group-hover:animate-pulse" />
              Become a VIP Today
            </Button>
          </CardContent>
        </Card>
        
        {/* Sidebar with VIP benefits */}
        <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg lg:w-1/3">
          <CardHeader>
            <div className="flex items-center mb-2">
              <Diamond className="h-6 w-6 text-[#1375e1]" />
              <CardTitle className="text-xl font-bold ml-3">VIP Status Benefits</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#132a3a] to-[#0d1c27] flex items-center justify-center mr-4 ring-2 ring-[#1375e1]/20">
                <Clock className="h-5 w-5 text-[#1375e1]" />
              </div>
              <div>
                <h4 className="font-medium text-white">Fast Withdrawals</h4>
                <p className="text-sm text-[#7F8990]">Process within 10 minutes</p>
              </div>
            </div>
            
            <Separator className="bg-[#243442]" />
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#132a3a] to-[#0d1c27] flex items-center justify-center mr-4 ring-2 ring-[#1375e1]/20">
                <MessageSquare className="h-5 w-5 text-[#1375e1]" />
              </div>
              <div>
                <h4 className="font-medium text-white">Personal Support</h4>
                <p className="text-sm text-[#7F8990]">Dedicated agent available 24/7</p>
              </div>
            </div>
            
            <Separator className="bg-[#243442]" />
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#132a3a] to-[#0d1c27] flex items-center justify-center mr-4 ring-2 ring-[#1375e1]/20">
                <Gamepad2 className="h-5 w-5 text-[#1375e1]" />
              </div>
              <div>
                <h4 className="font-medium text-white">New Game Access</h4>
                <p className="text-sm text-[#7F8990]">Early access to latest games</p>
              </div>
            </div>
            
            <Separator className="bg-[#243442]" />
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#132a3a] to-[#0d1c27] flex items-center justify-center mr-4 ring-2 ring-[#1375e1]/20">
                <Gift className="h-5 w-5 text-[#1375e1]" />
              </div>
              <div>
                <h4 className="font-medium text-white">Exclusive Gifts</h4>
                <p className="text-sm text-[#7F8990]">Luxury presents for VIPs</p>
              </div>
            </div>
            
            <Separator className="bg-[#243442]" />
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#132a3a] to-[#0d1c27] flex items-center justify-center mr-4 ring-2 ring-[#1375e1]/20">
                <Star className="h-5 w-5 text-[#1375e1]" />
              </div>
              <div>
                <h4 className="font-medium text-white">Higher Cashback</h4>
                <p className="text-sm text-[#7F8990]">Premium rebate rates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium giveaways with enhanced styling */}
      <h3 className="text-2xl font-bold mb-6 flex items-center text-white">
        <Gift className="h-6 w-6 mr-2 text-[#1375e1]" />
        Exclusive VIP Giveaways
      </h3>
      
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-gradient-to-br from-[#0a1825] via-[#0c1c29] to-[#122436] border-[#243442] text-white overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 group">
          <div className="relative p-6">
            {/* Background elements for luxury feel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1375e1] opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gradient-to-r from-blue-500 to-blue-600 opacity-5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <Badge className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium px-3 py-1 rounded-full">
                Exclusive
              </Badge>
              
              <div className="flex items-center mb-6">
                <div className="mr-4 bg-gradient-to-br from-[#132a3a]/90 to-[#0d1c27]/90 p-4 rounded-full ring-2 ring-[#1375e1]/30 shadow-lg shadow-blue-900/20 group-hover:ring-[#1375e1]/50 transition-all">
                  <Car className="h-8 w-8 text-[#1375e1] group-hover:text-[#4cd964] transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#4cd964] transition-colors duration-300">Win a BMW X7</h3>
                  <p className="text-[#7F8990]">Luxury SUV giveaway for VIPs only</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[#a3b3bf] leading-relaxed">
                  VIP members are automatically entered into our exclusive BMW X7 giveaway. 
                  This prestigious luxury SUV could be yours! The draw takes place twice a year, 
                  and only VIP members are eligible to participate.
                </p>
                
                <div className="flex items-center justify-between bg-[#0F212E]/80 rounded-lg p-3 border border-[#243442]">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1375e1] to-[#0d5bb2] flex items-center justify-center mr-2">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Next Draw</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] text-white">
                    July 2025
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#0a1825] via-[#0c1c29] to-[#122436] border-[#243442] text-white overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 group">
          <div className="relative p-6">
            {/* Background elements for luxury feel */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1375e1] opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gradient-to-r from-blue-500 to-blue-600 opacity-5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <Badge className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-medium px-3 py-1 rounded-full">
                Exclusive
              </Badge>
              
              <div className="flex items-center mb-6">
                <div className="mr-4 bg-gradient-to-br from-[#132a3a]/90 to-[#0d1c27]/90 p-4 rounded-full ring-2 ring-[#1375e1]/30 shadow-lg shadow-blue-900/20 group-hover:ring-[#1375e1]/50 transition-all">
                  <PalmIcon className="h-8 w-8 text-[#1375e1] group-hover:text-[#4cd964] transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-[#4cd964] transition-colors duration-300">Dubai Vacation</h3>
                  <p className="text-[#7F8990]">All-expenses-paid luxury trip for two</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-[#a3b3bf] leading-relaxed">
                  Experience the luxury of Dubai with our all-expenses-paid trip for two. 
                  Five-star accommodation, exclusive experiences, and VIP treatment throughout your stay. 
                  Monthly draws held exclusively for our valued VIP members.
                </p>
                
                <div className="flex items-center justify-between bg-[#0F212E]/80 rounded-lg p-3 border border-[#243442]">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1375e1] to-[#0d5bb2] flex items-center justify-center mr-2">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-white">Frequency</span>
                  </div>
                  <Badge className="bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] text-white">
                    Monthly Draws
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Call-to-action section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#0F212E] to-[#162c3f] p-8 text-center shadow-lg shadow-black/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1375e1] opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1375e1] opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3 blur-2xl"></div>
        
        <div className="relative z-10">
          <h3 className="text-3xl font-bold mb-4 text-white">Ready to Experience VIP Luxury?</h3>
          <p className="text-[#7F8990] mb-8 max-w-2xl mx-auto leading-relaxed">
            Deposit and wager <span className="text-[#4cd964] font-medium">₹100,000</span> or <span className="text-[#4cd964] font-medium">$1,500</span> to automatically qualify for VIP status. 
            Join today and start enjoying exclusive benefits, priority service, and premium rewards!
          </p>
          
          <Button 
            className="bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] hover:from-[#1060c0] hover:to-[#0a4e9a] text-white px-10 py-7 text-xl font-medium rounded-lg shadow-xl shadow-blue-900/30 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/40 hover:transform hover:scale-105 group"
            onClick={() => setLocation('/recharge')}
          >
            <Sparkles className="h-6 w-6 mr-3 text-yellow-300 group-hover:animate-pulse" />
            Become a VIP
          </Button>
          
          <p className="text-[#7F8990] mt-6 text-sm">
            Have questions? <span className="text-[#1375e1] cursor-pointer hover:underline" onClick={() => setLocation('/support')}>Contact our support team</span>
          </p>
        </div>
      </div>
    </div>
  );
}