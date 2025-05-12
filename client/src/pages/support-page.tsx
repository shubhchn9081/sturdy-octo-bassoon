import React, { useState, useEffect } from 'react';
import { ArrowLeft, Headphones, MessageSquare, Clock, Globe, Circle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';

export default function SupportPage() {
  const [, setLocation] = useLocation();
  const [agentName, setAgentName] = useState('Maria');
  
  // List of agent names to cycle through
  const agentNames = ['Maria', 'Riddhi', 'Anastasiya', 'John', 'Alex'];
  
  // Every hour, change the agent name
  useEffect(() => {
    // Initial setup - randomly select an agent
    const randomIndex = Math.floor(Math.random() * agentNames.length);
    setAgentName(agentNames[randomIndex]);
    
    // Set up interval to change agent every hour (3600000 ms = 1 hour)
    const interval = setInterval(() => {
      // Get current agent index
      const currentIndex = agentNames.indexOf(agentName);
      // Select next agent (or loop back to first)
      const nextIndex = (currentIndex + 1) % agentNames.length;
      setAgentName(agentNames[nextIndex]);
    }, 3600000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [agentName]);
  
  // Support features
  const supportFeatures = [
    {
      title: '24/7 Support',
      description: 'Our dedicated support team is available around the clock to help you with any issues or questions.',
      icon: <Clock className="h-10 w-10 text-[#1375e1]" />
    },
    {
      title: 'Real Humans, No Bots',
      description: 'Get assistance from real people who understand your needs - no automated responses or chatbots.',
      icon: <MessageSquare className="h-10 w-10 text-[#1375e1]" />
    },
    {
      title: 'Multi-language Support',
      description: 'Our support team speaks multiple languages to provide assistance in your preferred language.',
      icon: <Globe className="h-10 w-10 text-[#1375e1]" />
    }
  ];

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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Headphones className="h-6 w-6 text-[#1375e1]" />
              <CardTitle className="text-2xl font-bold ml-3">Live Support</CardTitle>
            </div>
            <div className="flex items-center">
              <div className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1 rounded-full mr-3 shadow-md shadow-emerald-800/30">
                <div className="relative mr-1.5">
                  <Circle className="h-2 w-2 fill-white" />
                  <div className="absolute top-0 left-0 h-2 w-2 bg-white rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-xs font-medium text-white">Online</span>
              </div>
              <span className="text-sm font-medium text-gray-300">{agentName} is available</span>
            </div>
          </div>
          <CardDescription className="text-[#7F8990]">
            Get help from our 24/7 customer support team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-6 mb-8">
            <div className="text-4xl text-[#1375e1] mb-6">
              <Headphones className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-4">How can we help you?</h3>
            <p className="text-[#7F8990] max-w-md mb-6">
              Our support team is ready to assist you with any questions or issues you might have.
            </p>
            <Button 
              className="bg-gradient-to-r from-[#1375e1] to-[#0d5bb2] hover:from-[#1060c0] hover:to-[#0a4e9a] text-white px-8 py-7 text-lg font-medium flex items-center rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/30 hover:transform hover:scale-[1.02]"
              onClick={() => window.open('https://t.me/Novito_support', '_blank')}
            >
              <MessageSquare className="h-5 w-5 mr-3" />
              Talk to Support
            </Button>
            <div className="flex flex-col items-center mt-5 space-y-1.5">
              <div className="bg-[#0F212E] px-4 py-1.5 rounded-full text-sm font-medium text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1375e1] to-[#4cd964]">24*7 Support</span>
              </div>
              <div className="bg-[#0F212E] px-4 py-1.5 rounded-full text-sm font-medium text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1375e1] to-[#4cd964]">Real humans, No bots</span>
              </div>
              <div className="bg-[#0F212E] px-4 py-1.5 rounded-full text-sm font-medium text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1375e1] to-[#4cd964]">Multi-language support</span>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {supportFeatures.map((feature, index) => (
              <Card key={index} className="bg-[#0F212E] border-[#243442] text-white hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:transform hover:scale-[1.02] group">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="bg-gradient-to-br from-[#132a3a] to-[#0d1c27] p-4 rounded-full mb-4 ring-2 ring-[#1375e1]/10 group-hover:ring-[#1375e1]/30 transition-all duration-300">
                    <div className="text-[#1375e1] group-hover:text-[#1687f5] transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-3 group-hover:text-[#1375e1] transition-colors">{feature.title}</h3>
                  <p className="text-[#7F8990] text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}