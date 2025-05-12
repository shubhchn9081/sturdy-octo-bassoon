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
              <Badge className="bg-green-500 mr-2 flex items-center animate-pulse">
                <Circle className="h-2 w-2 mr-1 fill-white" /> Online
              </Badge>
              <span className="text-sm text-gray-300">{agentName} is available</span>
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
              className="bg-[#1375e1] hover:bg-[#1060c0] text-white px-6 py-6 text-lg flex items-center"
              onClick={() => window.open('https://t.me/Novito_support', '_blank')}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Talk to Support
            </Button>
            <div className="flex flex-col items-center mt-4">
              <span className="text-sm text-[#7F8990]">24*7 Support</span>
              <span className="text-sm text-[#7F8990]">Real humans, No bots</span>
              <span className="text-sm text-[#7F8990]">Multi-language support</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {supportFeatures.map((feature, index) => (
              <Card key={index} className="bg-[#0F212E] border-[#243442] text-white">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="font-semibold my-3">{feature.title}</h3>
                  <p className="text-[#7F8990] text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}