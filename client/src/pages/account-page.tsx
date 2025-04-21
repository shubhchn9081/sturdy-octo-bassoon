import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Shield,
  Key,
  Bell,
  CreditCard,
  Wallet,
  History,
  Settings,
  ChevronRight,
  UserCircle,
  Link as LinkIcon,
  Smartphone,
  Globe,
  LockKeyhole,
  Mail,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  Clock
} from 'lucide-react';
import { Link as RouterLink } from 'wouter';

const AccountPage = () => {
  const { user } = useUser();
  const { activeCurrency } = useCurrency();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Placeholder data - In a real app, this would come from API
  const userStats = {
    joined: new Date(2023, 8, 15).toLocaleDateString(), // September 15, 2023
    totalWagered: 67543.28,
    totalDeposited: 12500,
    totalWithdrawn: 8750.25,
    vipLevel: 'Silver',
    vipPoints: 4325,
    nextLevel: 'Gold',
    nextLevelPoints: 10000,
    totalBets: 982,
    favoriteGame: 'Crash'
  };

  const sessions = [
    { device: 'Chrome / Windows', location: 'New York, USA', lastActive: '15 minutes ago', current: true },
    { device: 'Safari / iOS', location: 'New York, USA', lastActive: '2 days ago', current: false },
    { device: 'Firefox / MacOS', location: 'London, UK', lastActive: '5 days ago', current: false }
  ];

  const recentActivity = [
    { type: 'bet', game: 'Crash', amount: 150, outcome: 'win', profit: 225, date: '10 minutes ago' },
    { type: 'withdrawal', method: 'Bitcoin', amount: 1000, status: 'completed', date: '2 hours ago' },
    { type: 'deposit', method: 'Ethereum', amount: 500, status: 'completed', date: '1 day ago' },
    { type: 'bet', game: 'Mines', amount: 75, outcome: 'loss', profit: -75, date: '1 day ago' },
    { type: 'bet', game: 'Limbo', amount: 100, outcome: 'win', profit: 150, date: '2 days ago' }
  ];

  const apiKey = 'sk_live_51KjdT9SJiaCE0QogQcmcFBbT8tWd7CCa';

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Copied!',
        description: successMessage,
      });
    }).catch(() => {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive'
      });
    });
  };

  // Profile Tab Content
  const ProfileContent = () => (
    <div className="space-y-6">
      <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <UserCircle className="mr-2 h-5 w-5 text-[#1375e1]" />
            Profile Information
          </CardTitle>
          <CardDescription className="text-[#7F8990]">
            Manage your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#7F8990]">Username</Label>
              <Input 
                id="username" 
                value={user?.username || ''} 
                className="bg-[#1A3045] border-[#243442] text-white"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#7F8990]">Email</Label>
              <Input 
                id="email" 
                value={user?.email || 'user@example.com'} 
                className="bg-[#1A3045] border-[#243442] text-white"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-[#7F8990]">Date of Birth</Label>
              <Input 
                id="dob" 
                value="1990-01-01" 
                className="bg-[#1A3045] border-[#243442] text-white"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#7F8990]">Phone Number</Label>
              <Input 
                id="phone" 
                value="+1 (555) 123-4567" 
                className="bg-[#1A3045] border-[#243442] text-white"
                readOnly
              />
            </div>
          </div>
          
          <Separator className="bg-[#243442]" />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium">Profile Avatar</h4>
                <p className="text-sm text-[#7F8990]">Change your profile picture</p>
              </div>
              <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
                Upload
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium">Country</h4>
                <p className="text-sm text-[#7F8990]">Your current country is <strong>United States</strong></p>
              </div>
              <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
                Update
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-md font-medium">Preferred Currency</h4>
                <p className="text-sm text-[#7F8990]">Your primary currency is <strong>{activeCurrency}</strong></p>
              </div>
              <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
                Change
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <History className="mr-2 h-5 w-5 text-[#1375e1]" />
            Account Statistics
          </CardTitle>
          <CardDescription className="text-[#7F8990]">
            View your account activity and statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-[#1A3045] p-4 rounded-lg">
              <p className="text-[#7F8990] text-sm">Total Wagered</p>
              <p className="text-xl font-semibold">${userStats.totalWagered.toLocaleString()}</p>
            </div>
            <div className="bg-[#1A3045] p-4 rounded-lg">
              <p className="text-[#7F8990] text-sm">Total Bets</p>
              <p className="text-xl font-semibold">{userStats.totalBets.toLocaleString()}</p>
            </div>
            <div className="bg-[#1A3045] p-4 rounded-lg">
              <p className="text-[#7F8990] text-sm">Favorite Game</p>
              <p className="text-xl font-semibold">{userStats.favoriteGame}</p>
            </div>
            <div className="bg-[#1A3045] p-4 rounded-lg">
              <p className="text-[#7F8990] text-sm">Total Deposited</p>
              <p className="text-xl font-semibold">${userStats.totalDeposited.toLocaleString()}</p>
            </div>
            <div className="bg-[#1A3045] p-4 rounded-lg">
              <p className="text-[#7F8990] text-sm">Total Withdrawn</p>
              <p className="text-xl font-semibold">${userStats.totalWithdrawn.toLocaleString()}</p>
            </div>
            <div className="bg-[#1A3045] p-4 rounded-lg">
              <p className="text-[#7F8990] text-sm">Member Since</p>
              <p className="text-xl font-semibold">{userStats.joined}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0F212E] border-[#243442] text-white">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Clock className="mr-2 h-5 w-5 text-[#1375e1]" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-[#7F8990]">
            Your recent account activity and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="bg-[#1A3045] p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  {activity.type === 'bet' ? (
                    <div className={`p-2 rounded-full mr-3 ${activity.outcome === 'win' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'}`}>
                      {activity.outcome === 'win' ? '+' : '-'} ${Math.abs(activity.profit).toFixed(2)}
                    </div>
                  ) : activity.type === 'deposit' ? (
                    <div className="p-2 rounded-full mr-3 bg-green-900/30 text-green-500">
                      + ${activity.amount.toFixed(2)}
                    </div>
                  ) : (
                    <div className="p-2 rounded-full mr-3 bg-orange-900/30 text-orange-500">
                      - ${activity.amount.toFixed(2)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {activity.type === 'bet' 
                        ? `${activity.game} - ${activity.outcome === 'win' ? 'Won' : 'Lost'} $${activity.amount}`
                        : activity.type === 'deposit' 
                          ? `Deposit - ${activity.method}`
                          : `Withdrawal - ${activity.method}`
                      }
                    </p>
                    <p className="text-sm text-[#7F8990]">{activity.date}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[#7F8990]" />
              </div>
            ))}
            <div className="text-center">
              <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
                View All Activity
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Security Tab Content
  const SecurityContent = () => (
    <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Shield className="mr-2 h-5 w-5 text-[#1375e1]" />
          Security Settings
        </CardTitle>
        <CardDescription className="text-[#7F8990]">
          Manage your account security preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-md font-medium">Password</h4>
            <p className="text-sm text-[#7F8990]">Last changed 3 months ago</p>
          </div>
          <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-md font-medium">Two-Factor Authentication (2FA)</h4>
            <p className="text-sm text-[#7F8990]">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
          </div>
          <Switch 
            checked={twoFactorEnabled} 
            onCheckedChange={setTwoFactorEnabled} 
            className={twoFactorEnabled ? "bg-[#1375e1]" : ""}
          />
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-4">Active Sessions</h4>
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <div key={i} className="bg-[#1A3045] p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-[#7F8990]" />
                    <p className="font-medium">{session.device}</p>
                    {session.current && <Badge className="ml-2 bg-[#1375e1]">Current</Badge>}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-[#7F8990]">
                    <p>{session.location} • {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <Button variant="destructive" size="sm">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-2">Account Verification</h4>
          <p className="text-sm text-[#7F8990] mb-4">Verify your identity to increase your account security and limits</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-[#1A3045] p-3 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#1375e1]" />
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-green-500">Verified</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#243442] text-[#7F8990]" disabled>
                Verified
              </Button>
            </div>
            <div className="flex justify-between items-center bg-[#1A3045] p-3 rounded-lg">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 mr-3 text-[#1375e1]" />
                <div>
                  <p className="font-medium">Phone Verification</p>
                  <p className="text-sm text-yellow-500">Pending</p>
                </div>
              </div>
              <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
                Verify
              </Button>
            </div>
            <div className="flex justify-between items-center bg-[#1A3045] p-3 rounded-lg">
              <div className="flex items-center">
                <UserCircle className="h-5 w-5 mr-3 text-[#1375e1]" />
                <div>
                  <p className="font-medium">ID Verification</p>
                  <p className="text-sm text-[#7F8990]">Not verified</p>
                </div>
              </div>
              <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
                Verify
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // API Keys Tab Content
  const ApiKeysContent = () => (
    <Card className="bg-[#0F212E] border-[#243442] text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Key className="mr-2 h-5 w-5 text-[#1375e1]" />
          API Access
        </CardTitle>
        <CardDescription className="text-[#7F8990]">
          Manage your API keys for programmatic access to our platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-md font-medium mb-2">Your API Key</h4>
          <p className="text-sm text-[#7F8990] mb-4">Use this key to authenticate your API requests</p>
          <div className="bg-[#1A3045] border border-[#243442] rounded-md p-3 flex justify-between items-center">
            <div className="flex-1 font-mono text-sm overflow-hidden">
              {showApiKey ? apiKey : '•'.repeat(apiKey.length)}
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 border-[#243442]"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 border-[#243442]"
                onClick={() => copyToClipboard(apiKey, 'API key copied to clipboard')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-medium">Generate New API Key</h4>
              <p className="text-sm text-[#7F8990]">This will invalidate your existing API key</p>
            </div>
            <Button variant="destructive">
              Regenerate Key
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-medium">API Key Permissions</h4>
              <p className="text-sm text-[#7F8990]">Manage what your API key can access</p>
            </div>
            <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
              Configure
            </Button>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-2">API Documentation</h4>
          <p className="text-sm text-[#7F8990] mb-4">Learn how to integrate with our platform programmatically</p>
          <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
            <LinkIcon className="mr-2 h-4 w-4" />
            View Documentation
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Notifications Tab Content
  const NotificationsContent = () => (
    <Card className="bg-[#0F212E] border-[#243442] text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Bell className="mr-2 h-5 w-5 text-[#1375e1]" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-[#7F8990]">
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-md font-medium mb-4">Communication Channels</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-[#7F8990]">Receive updates via email</p>
              </div>
              <Switch 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
                className={emailNotifications ? "bg-[#1375e1]" : ""}
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-[#7F8990]">Receive updates via text message</p>
              </div>
              <Switch 
                checked={smsNotifications} 
                onCheckedChange={setSmsNotifications} 
                className={smsNotifications ? "bg-[#1375e1]" : ""}
              />
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-[#7F8990]">Login attempts, password changes, etc.</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Deposit Confirmations</p>
                <p className="text-sm text-[#7F8990]">When funds are added to your account</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Withdrawal Updates</p>
                <p className="text-sm text-[#7F8990]">Status changes for your withdrawals</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Promotions & Offers</p>
                <p className="text-sm text-[#7F8990]">New bonuses, tournaments, and special events</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">VIP Updates</p>
                <p className="text-sm text-[#7F8990]">Changes to your VIP status and exclusive offers</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div className="flex justify-end">
          <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Payment Methods Tab Content
  const PaymentMethodsContent = () => (
    <Card className="bg-[#0F212E] border-[#243442] text-white mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-[#1375e1]" />
          Payment Methods
        </CardTitle>
        <CardDescription className="text-[#7F8990]">
          Manage your deposit and withdrawal methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-md font-medium mb-4">Your Cryptocurrencies</h4>
          <div className="space-y-3">
            <div className="bg-[#1A3045] p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-[#F7931A] p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.64 14.9c-1.36 5.49-7 8.83-12.64 7.5-5.65-1.34-9.12-6.97-7.76-12.47 1.36-5.49 7-8.83 12.64-7.5 5.65 1.34 9.12 6.97 7.76 12.47z" fill="currentColor"/>
                    <path d="M17.3 10.7c.23-1.57-.95-2.42-2.58-2.98l.53-2.13-1.3-.32-.52 2.07c-.34-.08-.69-.16-1.04-.24l.52-2.08-1.3-.32-.53 2.13c-.28-.06-.56-.13-.82-.2l-1.79-.45-.34 1.38s.95.22.93.23c.52.13.62.47.6.74l-.6 2.42c.04.01.08.02.13.05l-.13-.03-.85 3.4c-.06.16-.23.4-.59.31.01.02-.93-.23-.93-.23l-.64 1.47 1.7.42c.31.08.62.16.93.24l-.54 2.15 1.3.32.53-2.13c.36.1.7.19 1.04.27l-.53 2.12 1.3.32.54-2.15c2.24.43 3.93.26 4.65-1.77.58-1.64-.03-2.58-1.22-3.19.87-.2 1.52-.77 1.7-1.94zm-3.04 4.23c-.41 1.64-3.19.75-4.1.53l.73-2.94c.9.23 3.8.67 3.37 2.41zm.41-4.26c-.38 1.51-2.69.74-3.44.56l.66-2.66c.75.18 3.17.53 2.78 2.1z" fill="#ffffff"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Bitcoin (BTC)</p>
                  <p className="text-sm text-[#7F8990]">Added on Jan 10, 2024</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
                Manage
              </Button>
            </div>
            <div className="bg-[#1A3045] p-4 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-[#627EEA] p-2 rounded-full mr-3">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#627EEA"/>
                    <path d="M12.338 3v6.647l5.658 2.526L12.338 3z" fill="#ffffff" fillOpacity="0.6"/>
                    <path d="M12.338 3L6.682 12.173l5.656-2.526V3z" fill="#ffffff"/>
                    <path d="M12.338 16.47v4.525l5.66-7.822-5.66 3.296z" fill="#ffffff" fillOpacity="0.6"/>
                    <path d="M12.338 20.995v-4.524l-5.656-3.298 5.656 7.822z" fill="#ffffff"/>
                    <path d="M12.338 15.426l5.658-3.299-5.658-2.526v5.825z" fill="#ffffff" fillOpacity="0.2"/>
                    <path d="M6.682 12.127l5.656 3.299V9.601l-5.656 2.526z" fill="#ffffff" fillOpacity="0.6"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Ethereum (ETH)</p>
                  <p className="text-sm text-[#7F8990]">Added on Feb 5, 2024</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
                Manage
              </Button>
            </div>
          </div>
          <Button className="w-full mt-4 bg-[#1375e1] hover:bg-[#1060c0]">
            Add New Cryptocurrency
          </Button>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-2">Saved Bank Accounts</h4>
          <p className="text-[#7F8990] text-sm mb-4">You have no saved bank accounts.</p>
          <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
            Add Bank Account
          </Button>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-2">Payment History</h4>
          <p className="text-[#7F8990] text-sm mb-4">View your deposit and withdrawal history</p>
          <div className="flex space-x-4">
            <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
              Deposit History
            </Button>
            <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
              Withdrawal History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Transactions Tab Content
  const TransactionsContent = () => (
    <Card className="bg-[#0F212E] border-[#243442] text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <History className="mr-2 h-5 w-5 text-[#1375e1]" />
          Transaction History
        </CardTitle>
        <CardDescription className="text-[#7F8990]">
          View your complete transaction history
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-[#1A3045] w-full justify-start">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#1375e1]">All</TabsTrigger>
              <TabsTrigger value="deposits" className="data-[state=active]:bg-[#1375e1]">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals" className="data-[state=active]:bg-[#1375e1]">Withdrawals</TabsTrigger>
              <TabsTrigger value="bets" className="data-[state=active]:bg-[#1375e1]">Bets</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select defaultValue="all-time">
              <SelectTrigger className="w-full sm:w-[180px] bg-[#1A3045] border-[#243442]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent className="bg-[#1A3045] border-[#243442] text-white">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-[#243442] hover:border-[#1375e1]">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M5.5 1a.5.5 0 0 1 0 1h-2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h2a.5.5 0 0 1 0 1h-2A1.5 1.5 0 0 1 2 13.5v-11A1.5 1.5 0 0 1 3.5 1h2zm6 0a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-2a.5.5 0 0 1 0-1h2zM8 4a.5.5 0 0 1 0 1H4.5a.5.5 0 0 1 0-1H8zm2.5 0a.5.5 0 0 1 0 1H10a.5.5 0 0 1 0-1h.5zm-2.5 3a.5.5 0 0 1 0 1H4.5a.5.5 0 0 1 0-1H8zm2.5 0a.5.5 0 0 1 0 1H10a.5.5 0 0 1 0-1h.5zm-2.5 3a.5.5 0 0 1 0 1H4.5a.5.5 0 0 1 0-1H8zm2.5 0a.5.5 0 0 1 0 1H10a.5.5 0 0 1 0-1h.5z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-[#243442] overflow-hidden">
          <div className="grid grid-cols-5 bg-[#1A3045] p-3 text-[#7F8990] text-sm font-medium">
            <div>Date</div>
            <div>Type</div>
            <div>Method/Game</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          <div className="divide-y divide-[#243442]">
            {[
              { date: '2024-04-21 14:32', type: 'Bet', method: 'Crash', amount: '-$150.00', status: 'Loss' },
              { date: '2024-04-21 12:15', type: 'Withdrawal', method: 'Bitcoin', amount: '-$1,000.00', status: 'Completed' },
              { date: '2024-04-20 18:43', type: 'Deposit', method: 'Ethereum', amount: '+$500.00', status: 'Completed' },
              { date: '2024-04-20 15:21', type: 'Bet', method: 'Mines', amount: '+$225.00', status: 'Win' },
              { date: '2024-04-19 22:05', type: 'Bet', method: 'Limbo', amount: '-$75.00', status: 'Loss' },
              { date: '2024-04-18 13:57', type: 'Deposit', method: 'Bitcoin', amount: '+$2,000.00', status: 'Completed' },
              { date: '2024-04-17 09:32', type: 'Bet', method: 'Dice', amount: '+$120.00', status: 'Win' },
              { date: '2024-04-16 20:11', type: 'Withdrawal', method: 'Ethereum', amount: '-$350.00', status: 'Completed' },
              { date: '2024-04-15 17:28', type: 'Bet', method: 'Crash', amount: '-$200.00', status: 'Loss' },
              { date: '2024-04-14 12:42', type: 'Bet', method: 'Mines', amount: '+$450.00', status: 'Win' },
            ].map((tx, i) => (
              <div key={i} className="grid grid-cols-5 p-3 text-sm hover:bg-[#1A3045] transition-colors">
                <div>{tx.date}</div>
                <div>{tx.type}</div>
                <div>{tx.method}</div>
                <div className={tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                  {tx.amount}
                </div>
                <div className={`flex items-center ${
                  tx.status === 'Win' ? 'text-green-500' : 
                  tx.status === 'Loss' ? 'text-red-500' : 
                  tx.status === 'Completed' ? 'text-blue-500' : 
                  'text-yellow-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    tx.status === 'Win' ? 'bg-green-500' : 
                    tx.status === 'Loss' ? 'bg-red-500' : 
                    tx.status === 'Completed' ? 'bg-blue-500' : 
                    'bg-yellow-500'
                  }`}></div>
                  {tx.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-[#7F8990]">
            Showing 1-10 of 158 transactions
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white" disabled>
              Previous
            </Button>
            <Button variant="outline" className="border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
              Next
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
            Download Transaction History
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Preferences Tab Content
  const PreferencesContent = () => (
    <Card className="bg-[#0F212E] border-[#243442] text-white">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Settings className="mr-2 h-5 w-5 text-[#1375e1]" />
          Account Preferences
        </CardTitle>
        <CardDescription className="text-[#7F8990]">
          Customize your account settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-md font-medium mb-4">Display Options</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-[#7F8990]">Use dark theme throughout the application</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Animations</p>
                <p className="text-sm text-[#7F8990]">Enable animations and transitions</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Compact View</p>
                <p className="text-sm text-[#7F8990]">Show more content with less spacing</p>
              </div>
              <Switch className="" />
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-4">Language & Region</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language" className="text-[#7F8990]">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language" className="bg-[#1A3045] border-[#243442]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A3045] border-[#243442] text-white">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-[#7F8990]">Display Currency</Label>
                <Select defaultValue="usd">
                  <SelectTrigger id="currency" className="bg-[#1A3045] border-[#243442]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A3045] border-[#243442] text-white">
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                    <SelectItem value="btc">BTC (₿)</SelectItem>
                    <SelectItem value="eth">ETH (Ξ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-[#7F8990]">Time Zone</Label>
              <Select defaultValue="auto">
                <SelectTrigger id="timezone" className="bg-[#1A3045] border-[#243442]">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A3045] border-[#243442] text-white">
                  <SelectItem value="auto">Auto-detect (EST)</SelectItem>
                  <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                  <SelectItem value="est">Eastern (UTC-5)</SelectItem>
                  <SelectItem value="cst">Central (UTC-6)</SelectItem>
                  <SelectItem value="mst">Mountain (UTC-7)</SelectItem>
                  <SelectItem value="pst">Pacific (UTC-8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-4">Betting Preferences</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Confirmation on High Bets</p>
                <p className="text-sm text-[#7F8990]">Show confirmation dialog for bets over $100</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Auto-cashout Default</p>
                <p className="text-sm text-[#7F8990]">Automatically set default auto-cashout value</p>
              </div>
              <Switch className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Sound Effects</p>
                <p className="text-sm text-[#7F8990]">Play sound effects for game events</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
          </div>
        </div>
        
        <Separator className="bg-[#243442]" />

        <div>
          <h4 className="text-md font-medium mb-4">Privacy Settings</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-sm text-[#7F8990]">Allow others to view your profile and statistics</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Show in Leaderboards</p>
                <p className="text-sm text-[#7F8990]">Include your results in public leaderboards</p>
              </div>
              <Switch defaultChecked className="bg-[#1375e1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Share Betting Activity</p>
                <p className="text-sm text-[#7F8990]">Show your bets in public activity feed</p>
              </div>
              <Switch className="bg-[#1375e1]" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button className="bg-[#1375e1] hover:bg-[#1060c0]">
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-6 px-4 max-w-screen-xl">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-2">
          <Card className="bg-[#0F212E] border-[#243442] text-white overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16 border-2 border-[#1375e1]">
                  <AvatarImage src="" alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-[#1A3045] text-white">{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg">{user?.username || 'User'}</h3>
                    {userStats.vipLevel !== 'Bronze' && (
                      <Badge className="ml-2 bg-[#1375e1]">VIP</Badge>
                    )}
                  </div>
                  <p className="text-[#7F8990] text-sm">Joined {userStats.joined}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'profile' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'security' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'api' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('api')}
                >
                  <Key className="mr-2 h-4 w-4" />
                  API Keys
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'notifications' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'payment' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('payment')}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Payment Methods
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'transactions' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('transactions')}
                >
                  <History className="mr-2 h-4 w-4" />
                  Transactions
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === 'preferences' ? 'bg-[#1A3045] text-white' : 'text-[#7F8990] hover:bg-[#1A3045] hover:text-white'}`}
                  onClick={() => setActiveTab('preferences')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </Button>
              </div>

              <Separator className="my-4 bg-[#243442]" />

              <div className="space-y-2 text-sm text-[#7F8990]">
                <div className="flex justify-between">
                  <span>Total Wagered</span>
                  <span className="font-medium text-white">${userStats.totalWagered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VIP Level</span>
                  <span className="font-medium text-white">{userStats.vipLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span>VIP Points</span>
                  <span className="font-medium text-white">{userStats.vipPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Level</span>
                  <span className="font-medium text-white">{userStats.nextLevel} ({userStats.nextLevelPoints - userStats.vipPoints} points needed)</span>
                </div>
              </div>

              <Separator className="my-4 bg-[#243442]" />

              <RouterLink href="/wallet">
                <Button className="w-full mb-2 bg-[#1375e1] hover:bg-[#1060c0]">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Button>
              </RouterLink>
              <Button variant="outline" className="w-full border-[#243442] text-[#7F8990] hover:border-[#1375e1] hover:text-white">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && <ProfileContent />}
          {activeTab === 'security' && <SecurityContent />}
          {activeTab === 'api' && <ApiKeysContent />}
          {activeTab === 'notifications' && <NotificationsContent />}
          {activeTab === 'payment' && <PaymentMethodsContent />}
          {activeTab === 'transactions' && <TransactionsContent />}
          {activeTab === 'preferences' && <PreferencesContent />}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;