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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ClipboardCopy, Edit2, Lock, LogOut, UserRound, History, Gift, Activity, Settings } from 'lucide-react';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="container p-4 mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - User info */}
          <div className="md:w-1/3 space-y-4">
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Profile</CardTitle>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=stake" />
                    <AvatarFallback>ST</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="text-lg font-bold">Stake_User123</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs bg-[#2E4358] text-gray-400 py-1 px-2 rounded-full">
                        User ID: 124578
                      </span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => copyToClipboard('124578')}
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </Button>
                    </div>
                    {copied && (
                      <div className="text-xs text-green-400 mt-1">
                        Copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4 bg-[#223549]" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Account Details</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Security</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">Logout</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-[#223549]" />

                <div className="space-y-3">
                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Account Level</span>
                      <span className="text-sm">Bronze</span>
                    </div>
                    <div className="mt-2 h-2 bg-[#223549] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">Progress: 15%</span>
                      <span className="text-xs text-gray-400">Next: Silver</span>
                    </div>
                  </div>

                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Wagered</span>
                      <span className="text-sm">₿ 1.25</span>
                    </div>
                  </div>

                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Bets</span>
                      <span className="text-sm">478</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Activity tabs */}
          <div className="md:w-2/3">
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader>
                <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 bg-[#0F1923]">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-[#172B3A]">Overview</TabsTrigger>
                    <TabsTrigger value="betting-history" className="data-[state=active]:bg-[#172B3A]">History</TabsTrigger>
                    <TabsTrigger value="bonuses" className="data-[state=active]:bg-[#172B3A]">Bonuses</TabsTrigger>
                    <TabsTrigger value="statistics" className="data-[state=active]:bg-[#172B3A]">Statistics</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-[#0F1923] border-[#223549]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-400" />
                            <CardTitle className="text-sm">Recent Activity</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {[1, 2, 3].map((item) => (
                              <div key={item} className="flex justify-between items-center py-1">
                                <div className="flex flex-col">
                                  <span className="text-sm">Played Dice</span>
                                  <span className="text-xs text-gray-400">Today, 15:30</span>
                                </div>
                                <span className={`text-sm ${item % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {item % 2 === 0 ? '+₿ 0.0035' : '-₿ 0.0025'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-[#0F1923] border-[#223549]">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-purple-400" />
                            <CardTitle className="text-sm">Active Bonuses</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-[#172B3A] p-3 rounded-md">
                              <div className="flex justify-between">
                                <span className="text-sm">Weekly Bonus</span>
                                <span className="text-sm text-amber-500">₿ 0.05</span>
                              </div>
                              <div className="mt-2 h-2 bg-[#223549] rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: "35%" }}></div>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-xs text-gray-400">Wagered: ₿ 0.175</span>
                                <span className="text-xs text-gray-400">Required: ₿ 0.5</span>
                              </div>
                            </div>
                            <div className="flex justify-center">
                              <Button variant="outline" className="text-xs bg-[#172B3A] border-[#223549] hover:bg-[#223549]">
                                View All Bonuses
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-[#0F1923] border-[#223549]">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-green-400" />
                          <CardTitle className="text-sm">Betting Summary</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-[#172B3A] p-3 rounded-md">
                            <span className="text-xs text-gray-400">Total Bets</span>
                            <p className="text-lg font-bold">478</p>
                          </div>
                          <div className="bg-[#172B3A] p-3 rounded-md">
                            <span className="text-xs text-gray-400">Total Wagered</span>
                            <p className="text-lg font-bold">₿ 1.25</p>
                          </div>
                          <div className="bg-[#172B3A] p-3 rounded-md">
                            <span className="text-xs text-gray-400">Net Profit</span>
                            <p className="text-lg font-bold text-green-400">+₿ 0.083</p>
                          </div>
                          <div className="bg-[#172B3A] p-3 rounded-md">
                            <span className="text-xs text-gray-400">Avg. Bet Size</span>
                            <p className="text-lg font-bold">₿ 0.0026</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="betting-history" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Betting History</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-[#223549]">
                            <tr>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Game</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Time</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Bet</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Multiplier</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-400">Profit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...Array(8)].map((_, i) => (
                              <tr key={i} className="border-b border-[#223549]">
                                <td className="py-3 text-sm">
                                  {['Dice', 'Crash', 'Limbo', 'Mines', 'Plinko', 'Wheel'][i % 6]}
                                </td>
                                <td className="py-3 text-sm text-gray-400">
                                  {new Date(Date.now() - i * 3600000).toLocaleString()}
                                </td>
                                <td className="py-3 text-sm">₿ {(0.001 + i * 0.0005).toFixed(4)}</td>
                                <td className="py-3 text-sm">{(1 + i * 0.5).toFixed(2)}x</td>
                                <td className={`py-3 text-sm text-right ${i % 2 ? 'text-green-400' : 'text-red-400'}`}>
                                  {i % 2 ? '+' : '-'}₿ {(0.001 + i * 0.0008).toFixed(4)}
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

                <TabsContent value="bonuses" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Active Bonuses</h3>
                      
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="bg-[#172B3A] p-4 rounded-md">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{['Weekly Bonus', 'First Deposit Bonus', 'VIP Reward'][i]}</h4>
                                <p className="text-sm text-gray-400">Expires in {5 - i} days</p>
                              </div>
                              <span className="text-amber-500 font-bold">₿ {(0.05 * (i + 1)).toFixed(2)}</span>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-400">Wagering progress</span>
                                <span>{25 * (i + 1)}%</span>
                              </div>
                              <div className="h-2 bg-[#223549] rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${25 * (i + 1)}%` }}></div>
                              </div>
                              <div className="flex justify-between mt-1 text-xs text-gray-400">
                                <span>Wagered: ₿ {(0.25 * (i + 1)).toFixed(2)}</span>
                                <span>Required: ₿ {(1 * (i + 1)).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Completed Bonuses</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-[#223549]">
                            <tr>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Bonus Type</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Completed</th>
                              <th className="text-left py-2 text-sm font-medium text-gray-400">Amount</th>
                              <th className="text-right py-2 text-sm font-medium text-gray-400">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...Array(5)].map((_, i) => (
                              <tr key={i} className="border-b border-[#223549]">
                                <td className="py-3 text-sm">
                                  {['Weekly Bonus', 'Reload Bonus', 'Daily Race Reward', 'VIP Bonus', 'Promotion'][i]}
                                </td>
                                <td className="py-3 text-sm text-gray-400">
                                  {new Date(Date.now() - i * 86400000 * 3).toLocaleDateString()}
                                </td>
                                <td className="py-3 text-sm">₿ {(0.02 + i * 0.01).toFixed(3)}</td>
                                <td className="py-3 text-sm text-right text-green-400">
                                  Claimed
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="statistics" className="mt-0">
                  <div className="space-y-4">
                    <div className="bg-[#0F1923] p-4 rounded-md">
                      <h3 className="text-lg font-bold mb-4">Overall Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#172B3A] p-3 rounded-md">
                          <span className="text-xs text-gray-400">Total Bets</span>
                          <p className="text-lg font-bold">478</p>
                        </div>
                        <div className="bg-[#172B3A] p-3 rounded-md">
                          <span className="text-xs text-gray-400">Win Rate</span>
                          <p className="text-lg font-bold">51.4%</p>
                        </div>
                        <div className="bg-[#172B3A] p-3 rounded-md">
                          <span className="text-xs text-gray-400">Net Profit</span>
                          <p className="text-lg font-bold text-green-400">+₿ 0.083</p>
                        </div>
                        <div className="bg-[#172B3A] p-3 rounded-md">
                          <span className="text-xs text-gray-400">Highest Win</span>
                          <p className="text-lg font-bold text-green-400">₿ 0.0324</p>
                        </div>
                      </div>
                      
                      <h4 className="font-medium mb-3">Betting by Game</h4>
                      <div className="space-y-3">
                        {['Dice', 'Crash', 'Mines', 'Plinko', 'Limbo'].map((game, i) => (
                          <div key={i} className="bg-[#172B3A] p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <span>{game}</span>
                              <span className={`text-sm ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {i % 2 === 0 ? '+' : '-'}₿ {(0.01 + i * 0.005).toFixed(4)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="w-full max-w-[200px]">
                                <div className="h-2 bg-[#223549] rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${i % 2 === 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`} 
                                    style={{ width: `${70 - i * 10}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400 ml-3">{120 - i * 20} bets</span>
                            </div>
                          </div>
                        ))}
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

export default ProfilePage;