import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  Search, 
  HelpCircle, 
  Wallet, 
  Shield, 
  LifeBuoy, 
  FileText, 
  MessageSquare,
  ChevronRight,
  BookOpen,
  AlertCircle,
  Settings,
  Gift
} from 'lucide-react';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const faqCategories = [
    {
      id: 'account',
      name: 'Account',
      icon: <Settings className="h-5 w-5 text-blue-400" />,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'To create an account, click on the "Sign Up" button in the top right corner of the homepage. Fill in your email address, create a strong password, and follow the verification steps.'
        },
        {
          question: 'How do I verify my account?',
          answer: 'Verification is completed in steps: email verification, phone verification, and KYC verification. Each step can be completed from your account settings page.'
        },
        {
          question: 'How do I change my username?',
          answer: 'You can change your username once every 30 days. Go to your account settings, find the "Profile" tab, and click on "Edit" next to your current username.'
        },
        {
          question: 'How do I enable two-factor authentication?',
          answer: 'Go to your account settings, navigate to the "Security" tab, and click on "Enable 2FA". Follow the instructions to set up authentication with an app like Google Authenticator or Authy.'
        }
      ]
    },
    {
      id: 'payments',
      name: 'Deposits & Withdrawals',
      icon: <Wallet className="h-5 w-5 text-green-400" />,
      faqs: [
        {
          question: 'What cryptocurrencies do you accept?',
          answer: 'We accept Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Bitcoin Cash (BCH), Ripple (XRP), Dogecoin (DOGE), and several other cryptocurrencies. Check the deposit page for the full list.'
        },
        {
          question: 'How long do deposits take?',
          answer: 'Cryptocurrency deposits typically require 1-6 network confirmations to be credited to your account. This usually takes between 10 minutes and 1 hour, depending on the cryptocurrency and network congestion.'
        },
        {
          question: 'Are there any deposit fees?',
          answer: 'We don\'t charge any fees for deposits. However, blockchain transactions require network fees which are paid by the sender.'
        },
        {
          question: 'How long do withdrawals take to process?',
          answer: 'Most withdrawals are processed automatically within minutes. In some cases, manual approval may be required, which can take up to 24 hours.'
        }
      ]
    },
    {
      id: 'bonuses',
      name: 'Bonuses & Promotions',
      icon: <Gift className="h-5 w-5 text-purple-400" />,
      faqs: [
        {
          question: 'How do I claim a bonus?',
          answer: 'Most bonuses are credited automatically when you meet the eligibility criteria. For deposit bonuses, make sure to select the bonus when making your deposit. Special promotions may require you to enter a code or opt-in.'
        },
        {
          question: 'What are wagering requirements?',
          answer: 'Wagering requirements specify how many times you need to wager a bonus amount before it becomes withdrawable. For example, a 30x requirement on a $10 bonus means you need to wager $300 before you can withdraw the bonus funds.'
        },
        {
          question: 'How long do I have to complete wagering requirements?',
          answer: 'The time period varies depending on the bonus. Typically, you have between 7 and 30 days to complete the wagering requirements. Check the specific bonus terms for details.'
        },
        {
          question: 'What games contribute to wagering requirements?',
          answer: 'Different games contribute differently to wagering requirements. Typically, slots contribute 100%, while table games may contribute 10-50%. Check the bonus terms for specific contribution percentages.'
        }
      ]
    },
    {
      id: 'games',
      name: 'Games & Betting',
      icon: <BookOpen className="h-5 w-5 text-amber-400" />,
      faqs: [
        {
          question: 'What is provably fair gaming?',
          answer: 'Provably fair is a technology that allows you to verify the fairness of each game outcome. It uses cryptographic methods to ensure that neither the player nor the casino can know the outcome of a game before it's played, and that the outcome cannot be manipulated.'
        },
        {
          question: 'How do I verify game fairness?',
          answer: 'Each game has a "Verify" button that allows you to check the fairness of the outcome. This typically involves comparing the game's server seed, client seed, and nonce using a cryptographic algorithm.'
        },
        {
          question: 'What is RTP (Return to Player)?',
          answer: 'RTP (Return to Player) is the percentage of all wagered money that will be paid back to players over time. For example, a game with a 96% RTP will, on average, return $96 for every $100 wagered over millions of plays.'
        },
        {
          question: 'What is the house edge?',
          answer: 'The house edge is the mathematical advantage that the casino has over players. It's essentially 100% minus the RTP. For example, if a game has a 96% RTP, the house edge is 4%.'
        }
      ]
    },
    {
      id: 'security',
      name: 'Security & Privacy',
      icon: <Shield className="h-5 w-5 text-red-400" />,
      faqs: [
        {
          question: 'How is my personal information protected?',
          answer: 'We use industry-standard encryption to protect all personal data. We never store your full payment details, and sensitive information is kept in encrypted databases with strict access controls.'
        },
        {
          question: 'What should I do if I suspect unauthorized access to my account?',
          answer: 'Immediately change your password, enable two-factor authentication if not already enabled, and contact our support team with details of the suspected breach.'
        },
        {
          question: 'Do you share my information with third parties?',
          answer: 'We only share information with third parties when necessary to provide our services, for legal compliance, or with your explicit consent. See our Privacy Policy for full details.'
        },
        {
          question: 'How can I view my login history?',
          answer: 'You can view your login history in your account settings under the "Security" tab. This shows recent logins with timestamps, IP addresses, and device information.'
        }
      ]
    }
  ];

  const guides = [
    {
      id: 1,
      title: 'Getting Started Guide',
      description: 'Learn the basics of using Stake.com',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661351/getting_started_esfgyj.jpg',
      category: 'Beginner'
    },
    {
      id: 2,
      title: 'Cryptocurrency Deposit Guide',
      description: 'How to deposit crypto into your account',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661351/crypto_deposit_hqpovg.jpg',
      category: 'Payments'
    },
    {
      id: 3,
      title: 'Maximizing Bonuses',
      description: 'Tips for getting the most from promotions',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661351/bonuses_bzcbfz.jpg',
      category: 'Bonuses'
    },
    {
      id: 4,
      title: 'Understanding Provably Fair',
      description: 'Learn how our fair gaming technology works',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661351/provably_fair_nkbixk.jpg',
      category: 'Games'
    },
    {
      id: 5,
      title: 'Account Security Best Practices',
      description: 'Keep your account safe and secure',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661351/security_kwqy1g.jpg',
      category: 'Security'
    },
    {
      id: 6,
      title: 'VIP Program Overview',
      description: 'Everything about our VIP levels and benefits',
      image: 'https://res.cloudinary.com/dwrzsglhc/image/upload/v1713661351/vip_program_hcbrfd.jpg',
      category: 'VIP'
    }
  ];

  // Filter FAQs based on search query
  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <Layout>
      <div className="container p-4 mx-auto">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-[#172B3A] to-[#0F1923] rounded-lg p-6 md:p-10 mb-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white">Help Center</h1>
            <p className="text-lg text-gray-300">
              Find answers to common questions or get in touch with our support team
            </p>
            
            <div className="relative max-w-xl mx-auto mt-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search for answers..." 
                className="pl-10 h-12 bg-[#0F1923] border-[#223549] text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick help categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {[
            { icon: <HelpCircle className="h-6 w-6" />, label: 'General' },
            { icon: <Wallet className="h-6 w-6" />, label: 'Payments' },
            { icon: <Shield className="h-6 w-6" />, label: 'Security' },
            { icon: <Settings className="h-6 w-6" />, label: 'Account' },
            { icon: <Gift className="h-6 w-6" />, label: 'Bonuses' },
            { icon: <AlertCircle className="h-6 w-6" />, label: 'Problems' },
          ].map((item, index) => (
            <Card 
              key={index} 
              className="bg-[#172B3A] border-[#223549] text-white hover:bg-[#223549] transition-colors cursor-pointer"
              onClick={() => setSearchQuery(item.label)}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <div className="p-3 rounded-full bg-[#0F1923] text-blue-400 mb-2">
                  {item.icon}
                </div>
                <p className="text-sm font-medium">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="faq" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-[#172B3A] mb-6">
            <TabsTrigger value="faq" className="data-[state=active]:bg-[#0F1923]">
              <HelpCircle className="h-4 w-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-[#0F1923]">
              <FileText className="h-4 w-4 mr-2" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-[#0F1923]">
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="mt-0">
            {searchQuery && filteredFaqs.length === 0 ? (
              <div className="bg-[#172B3A] rounded-lg p-8 text-center">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-gray-400 mb-4">We couldn't find any answers matching "{searchQuery}"</p>
                <Button onClick={() => setSearchQuery('')} variant="outline" className="border-[#223549] hover:bg-[#223549]">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {(searchQuery ? filteredFaqs : faqCategories).map((category) => (
                  <Card key={category.id} className="bg-[#172B3A] border-[#223549] text-white overflow-hidden">
                    <CardHeader className="bg-[#0F1923]">
                      <div className="flex items-center gap-2">
                        {category.icon}
                        <CardTitle>{category.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${index}`} className="border-b-[#223549]">
                            <AccordionTrigger className="text-left text-base font-medium hover:no-underline hover:text-white py-4">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-300 py-2">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guides" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Card key={guide.id} className="bg-[#172B3A] border-[#223549] text-white overflow-hidden">
                  <div className="relative h-40">
                    <img src={guide.image} alt={guide.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {guide.category}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {guide.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="ghost" className="px-0 text-blue-400 hover:text-blue-300 hover:bg-transparent">
                      Read Guide
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contact" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="bg-[#172B3A] border-[#223549] text-white">
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription className="text-gray-400">
                      Fill out the form and our team will get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
                          <Input id="name" placeholder="Your name" className="bg-[#0F1923] border-[#223549]" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                          <Input id="email" type="email" placeholder="Your email" className="bg-[#0F1923] border-[#223549]" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-gray-300">Subject</label>
                        <Input id="subject" placeholder="How can we help?" className="bg-[#0F1923] border-[#223549]" />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
                        <textarea 
                          id="message" 
                          rows={5} 
                          placeholder="Describe your issue in detail..."
                          className="w-full p-3 rounded-md bg-[#0F1923] border border-[#223549] text-white"
                        ></textarea>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700">Send Message</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="bg-[#172B3A] border-[#223549] text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <LifeBuoy className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-lg">Live Support</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Get immediate assistance from our support team through live chat.
                    </p>
                    <Button className="w-full bg-[#0F1923] border border-[#223549] hover:bg-[#223549]">
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#172B3A] border-[#223549] text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-400" />
                      <CardTitle className="text-lg">Email Support</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      For non-urgent inquiries, you can email our support team.
                    </p>
                    <p className="text-blue-400 font-medium">support@stake.com</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Response time: Within 24 hours
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#172B3A] border-[#223549] text-white">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      <CardTitle className="text-lg">Community</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Join our community forum to discuss with other users and our team.
                    </p>
                    <Button variant="outline" className="w-full border-[#223549] hover:bg-[#223549]">
                      Visit Forum
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default HelpPage;