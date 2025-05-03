import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function PaymentFailurePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md border-[#243442] bg-[#172B3A] text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center py-6">
            <div className="text-center py-8">
              <div className="rounded-full bg-red-500/20 p-4 mx-auto mb-4 inline-block">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Payment Failed</h3>
              <p className="text-[#7F8990] mt-2">We couldn't process your payment.</p>
              <div className="mt-6 text-sm text-[#7F8990]">
                <p>Possible reasons:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Insufficient funds in your account</li>
                  <li>Payment was rejected by your bank</li>
                  <li>Payment session timed out</li>
                  <li>Technical issue with the payment gateway</li>
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="justify-center space-x-4 pt-2 pb-6">
            <Button 
              variant="outline"
              className="border-[#243442] text-white hover:bg-[#243442]"
              onClick={() => setLocation('/wallet')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Wallet
            </Button>
            
            <Button
              className="bg-[#1375e1] hover:bg-[#1060c0] text-white"
              onClick={() => setLocation('/recharge')}
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}