import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, HelpCircle, Search, Mail, MessageSquare } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';

export default function HelpCenterPage() {
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
            <HelpCircle className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">Help Center</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Find answers to common questions and get support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-8 relative">
            <Input 
              placeholder="Search for help articles..." 
              className="pl-10 bg-[#0F212E] border-[#243442] text-white"
            />
            <Search className="h-4 w-4 absolute left-3 text-[#7F8990]" />
            <Button className="shrink-0 bg-[#1375e1] hover:bg-[#1060c0]">
              Search
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Mail className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-[#7F8990] text-sm mb-4">Get help via email from our support team</p>
                <Button variant="outline" className="border-[#243442] hover:bg-[#243442]">
                  Contact Us
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <MessageSquare className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-[#7F8990] text-sm mb-4">Chat with our support team in real-time</p>
                <Button variant="outline" className="border-[#243442] hover:bg-[#243442]">
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0F212E] border-[#243442] text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <HelpCircle className="h-10 w-10 text-[#1375e1] mb-4" />
                <h3 className="font-semibold mb-2">FAQ</h3>
                <p className="text-[#7F8990] text-sm mb-4">Browse our frequently asked questions</p>
                <Button variant="outline" className="border-[#243442] hover:bg-[#243442]">
                  View FAQs
                </Button>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-[#243442]">
              <AccordionTrigger className="text-white hover:text-[#1375e1]">How do I create an account?</AccordionTrigger>
              <AccordionContent className="text-[#7F8990]">
                To create an account, click on the "Sign Up" button in the top right corner of the homepage. 
                Fill in your email address, choose a username and password, and follow the verification process.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border-[#243442]">
              <AccordionTrigger className="text-white hover:text-[#1375e1]">How do I make a deposit?</AccordionTrigger>
              <AccordionContent className="text-[#7F8990]">
                Go to the Wallet section, click on "Deposit", select your preferred cryptocurrency, 
                and follow the instructions to complete your deposit.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border-[#243442]">
              <AccordionTrigger className="text-white hover:text-[#1375e1]">How do I withdraw my winnings?</AccordionTrigger>
              <AccordionContent className="text-[#7F8990]">
                Navigate to the Wallet section, click on "Withdraw", select your cryptocurrency, 
                enter the amount and your wallet address, then confirm the withdrawal.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border-[#243442]">
              <AccordionTrigger className="text-white hover:text-[#1375e1]">What is the minimum bet amount?</AccordionTrigger>
              <AccordionContent className="text-[#7F8990]">
                The minimum bet amount varies by game. Most of our games have a minimum bet of 0.00000001 BTC 
                or the equivalent in other cryptocurrencies.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border-[#243442]">
              <AccordionTrigger className="text-white hover:text-[#1375e1]">How do I verify my account?</AccordionTrigger>
              <AccordionContent className="text-[#7F8990]">
                Go to your Account Settings, select the "Verification" tab, and follow the instructions 
                to complete the verification process by uploading the required documents.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}