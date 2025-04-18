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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp,
  Clock,
  Calendar,
  Medal,
  Search,
  Filter,
  ArrowUp,
  Star,
  Bookmark
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('forum');

  // Sample forum posts
  const posts = [
    {
      id: 1,
      title: 'Strategy for Maximizing Wins in Crash Game',
      category: 'Strategy',
      author: {
        username: 'CryptoMaster',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=CryptoMaster',
      },
      postedAt: '2025-04-16T14:30:00Z',
      content: `I've been playing Crash for a while now and wanted to share my strategy that's been working well for me. 
      The key is to start with small bets and gradually increase them as you win, while setting strict stop-loss limits.
      I typically cash out at 2x and don't chase huge multipliers. What strategies have been working for you?`,
      likes: 45,
      comments: 23,
      pinned: true,
      tags: ['crash', 'strategy', 'betting', 'cryptocurrency']
    },
    {
      id: 2,
      title: 'Just hit 1000x on Plinko! Unbelievable luck today!',
      category: 'Win',
      author: {
        username: 'LuckyPlayer777',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=LuckyPlayer777',
      },
      postedAt: '2025-04-17T10:15:00Z',
      content: `I still can't believe it! I was playing Plinko with medium risk and hit the 1000x multiplier! 
      Started with a 0.01 BTC bet and walked away with 10 BTC. Best day ever on Stake!`,
      likes: 128,
      comments: 57,
      pinned: false,
      tags: ['plinko', 'big win', 'jackpot', 'crypto gambling']
    },
    {
      id: 3,
      title: 'New to Stake - Best games for beginners?',
      category: 'Discussion',
      author: {
        username: 'NewbieGambler',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=NewbieGambler',
      },
      postedAt: '2025-04-17T18:45:00Z',
      content: `Just joined Stake and I'm overwhelmed by all the game options. 
      Which games would you recommend for a beginner? I'm looking for games with simple mechanics and good RTP.
      Also, any tips for managing my bankroll effectively?`,
      likes: 32,
      comments: 41,
      pinned: false,
      tags: ['beginners', 'game recommendations', 'bankroll management', 'advice']
    },
    {
      id: 4,
      title: 'Monthly Stake Tournament - Registration Open!',
      category: 'Announcement',
      author: {
        username: 'StakeModerator',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=StakeModerator',
        isModerator: true
      },
      postedAt: '2025-04-16T09:00:00Z',
      content: `We're excited to announce our monthly tournament starting on May 1st with a prize pool of $25,000! 
      Registration is now open. Top 100 players by wagering volume will win prizes, with the first place taking home $5,000.
      Good luck to all participants!`,
      likes: 210,
      comments: 89,
      pinned: true,
      tags: ['tournament', 'announcement', 'prizes', 'competition']
    },
    {
      id: 5,
      title: 'Provably Fair - How it really works',
      category: 'Guide',
      author: {
        username: 'TechExplainer',
        avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=TechExplainer',
      },
      postedAt: '2025-04-15T16:20:00Z',
      content: `I've seen a lot of questions about provably fair technology, so I thought I'd create a guide explaining how it works.
      Provably fair uses cryptographic hash functions to ensure that game outcomes can't be manipulated by either the player or the casino.
      Here's a step-by-step breakdown of the process...`,
      likes: 156,
      comments: 37,
      pinned: false,
      tags: ['provably fair', 'guide', 'technology', 'crypto gambling']
    }
  ];

  // Sample forum categories
  const categories = [
    { id: 'general', name: 'General Discussion', posts: 2541, icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'strategy', name: 'Strategy & Tips', posts: 1853, icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'wins', name: 'Wins & Results', posts: 3276, icon: <Medal className="h-4 w-4" /> },
    { id: 'events', name: 'Tournaments & Events', posts: 845, icon: <Calendar className="h-4 w-4" /> },
    { id: 'crypto', name: 'Cryptocurrency', posts: 1294, icon: <Star className="h-4 w-4" /> },
    { id: 'help', name: 'Support & Help', posts: 973, icon: <MessageCircle className="h-4 w-4" /> }
  ];

  // Sample top contributors
  const topContributors = [
    { username: 'CryptoMaster', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=CryptoMaster', posts: 243, likes: 1522 },
    { username: 'StakePro', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=StakePro', posts: 187, likes: 1245 },
    { username: 'GamblingExpert', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=GamblingExpert', posts: 156, likes: 932 },
    { username: 'LuckyWinner', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=LuckyWinner', posts: 129, likes: 876 },
    { username: 'StrategySage', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=StrategySage', posts: 112, likes: 743 }
  ];

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Layout>
      <div className="container p-4 mx-auto">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[#172B3A] to-[#0F1923] rounded-lg p-6 md:p-10 mb-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Stake Community</h1>
            <p className="text-lg text-gray-300">
              Join discussions, share your experiences, and connect with fellow players
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">Create Post</Button>
              <Button variant="outline" className="border-[#223549] hover:bg-[#223549]">
                <Users className="mr-2 h-4 w-4" />
                Join Community
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content - left column */}
          <div className="lg:w-3/4 space-y-6">
            {/* Search and filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  placeholder="Search discussions..." 
                  className="pl-10 h-10 bg-[#172B3A] border-[#223549] text-white"
                />
              </div>
              <Button variant="outline" className="bg-[#172B3A] border-[#223549] hover:bg-[#223549]">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            
            {/* Tabs */}
            <Tabs defaultValue="forum" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 bg-[#172B3A]">
                <TabsTrigger value="forum" className="data-[state=active]:bg-[#0F1923]">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Forum
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-[#0F1923]">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="data-[state=active]:bg-[#0F1923]">
                  <Clock className="h-4 w-4 mr-2" />
                  Recent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forum" className="mt-6">
                {/* Pinned posts */}
                {posts.filter(post => post.pinned).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <ArrowUp className="h-5 w-5 text-amber-500" />
                      Pinned Discussions
                    </h3>
                    <div className="space-y-4">
                      {posts.filter(post => post.pinned).map(post => (
                        <Card key={post.id} className="bg-[#172B3A] border-[#223549] text-white hover:bg-[#1e3549] transition-colors cursor-pointer">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Badge variant="outline" className="bg-[#0F1923] text-white border-none text-xs py-0">
                                    {post.category}
                                  </Badge>
                                  {post.author.isModerator && (
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-xs py-0">
                                      Moderator
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-base sm:text-lg">{post.title}</CardTitle>
                              </div>
                              <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-none">
                                Pinned
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 pb-2">
                            <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="text-xs bg-[#0F1923] text-blue-400 py-1 px-2 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-2 flex justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{post.author.username}</p>
                                <p className="text-xs text-gray-400">{formatDate(post.postedAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-pink-500" />
                                <span className="text-xs">{post.likes}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-4 w-4 text-blue-400" />
                                <span className="text-xs">{post.comments}</span>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Regular posts */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Recent Discussions</h3>
                  <div className="space-y-4">
                    {posts.filter(post => !post.pinned).map(post => (
                      <Card key={post.id} className="bg-[#172B3A] border-[#223549] text-white hover:bg-[#1e3549] transition-colors cursor-pointer">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Badge variant="outline" className="bg-[#0F1923] text-white border-none text-xs py-0">
                              {post.category}
                            </Badge>
                            {post.author.isModerator && (
                              <Badge className="bg-blue-600 hover:bg-blue-700 text-xs py-0">
                                Moderator
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-base sm:text-lg">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 pb-2">
                          <p className="text-sm text-gray-300 line-clamp-3">{post.content}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-[#0F1923] text-blue-400 py-1 px-2 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-2 flex justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{post.author.username}</p>
                              <p className="text-xs text-gray-400">{formatDate(post.postedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4 text-pink-500" />
                              <span className="text-xs">{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-4 w-4 text-blue-400" />
                              <span className="text-xs">{post.comments}</span>
                            </div>
                            <div className="flex items-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button variant="outline" className="border-[#223549] hover:bg-[#223549]">
                      Load More
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <Card className="bg-[#172B3A] border-[#223549] text-white p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Trending Topics</h3>
                  <p className="text-gray-400 mt-2">View the most popular discussions right now</p>
                </Card>
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                <Card className="bg-[#172B3A] border-[#223549] text-white p-6 text-center">
                  <Clock className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Recent Activity</h3>
                  <p className="text-gray-400 mt-2">Stay up to date with the latest posts and comments</p>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar - right column */}
          <div className="lg:w-1/4 space-y-6">
            {/* Categories */}
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2">
                  {categories.map(category => (
                    <div 
                      key={category.id} 
                      className="flex justify-between items-center p-2 rounded-md hover:bg-[#223549] cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-[#0F1923] border-none text-gray-400">
                        {category.posts}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Top contributors */}
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Top Contributors</CardTitle>
                <CardDescription className="text-gray-400">
                  Our most active community members
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {topContributors.map((user, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.username}</p>
                          <p className="text-xs text-gray-400">{user.posts} posts</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-pink-500" />
                        <span className="text-xs">{user.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Community stats */}
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Community Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <p className="text-xs text-gray-400">Members</p>
                    <p className="text-xl font-bold">24,578</p>
                  </div>
                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <p className="text-xs text-gray-400">Online</p>
                    <p className="text-xl font-bold">1,243</p>
                  </div>
                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <p className="text-xs text-gray-400">Topics</p>
                    <p className="text-xl font-bold">8,796</p>
                  </div>
                  <div className="bg-[#0F1923] p-3 rounded-md">
                    <p className="text-xs text-gray-400">Posts Today</p>
                    <p className="text-xl font-bold">153</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Community rules */}
            <Card className="bg-[#172B3A] border-[#223549] text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Community Rules</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-2 text-sm">
                  <p>1. Be respectful to other members</p>
                  <p>2. No spamming or excessive self-promotion</p>
                  <p>3. Don't share personal information</p>
                  <p>4. Keep discussions related to gambling and cryptocurrency</p>
                  <p>5. No illegal content or activities</p>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full border-[#223549] hover:bg-[#223549] text-xs">
                    View Full Rules
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPage;