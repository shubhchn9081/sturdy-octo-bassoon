import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChatPage() {
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
      
      <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-2">
            <MessageSquare className="h-6 w-6 text-[#1375e1]" />
            <CardTitle className="text-2xl font-bold ml-3">Chat</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            Connect with other players in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-6">
            <Alert className="bg-[#243442] border-[#1375e1] mb-6">
              <AlertDescription className="text-lg text-center">
                You need $1000 wagered to access the exclusive premium chat
              </AlertDescription>
            </Alert>
            <div className="text-4xl text-[#1375e1] mb-6">
              <MessageSquare className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Chat Access</h3>
            <p className="text-[#7F8990] max-w-md">
              Continue playing and placing bets to unlock access to our exclusive premium chat features.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}