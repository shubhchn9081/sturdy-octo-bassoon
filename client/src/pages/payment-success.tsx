import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { CheckCircle, Loader2, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'checking' | 'success' | 'pending' | 'failed'>('checking');
  const [txnId, setTxnId] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref');
    
    if (!ref) {
      toast({
        title: "Missing transaction reference",
        description: "Could not find transaction details",
        variant: "destructive",
      });
      setStatus('failed');
      setLoading(false);
      return;
    }
    
    setTxnId(ref);
    
    // Check transaction status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/apay/transaction/${ref}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch transaction status');
        }
        
        if (data.success && data.transaction) {
          // Update status based on transaction status
          if (data.transaction.status === 'completed') {
            setStatus('success');
            // Invalidate balance query to refresh wallet balance
            queryClient.invalidateQueries({ queryKey: ['user', 'balance'] });
          } else if (data.transaction.status === 'pending') {
            setStatus('pending');
          } else {
            setStatus('failed');
          }
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [toast]);
  
  const refreshStatus = async () => {
    if (!txnId) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/apay/transaction/${txnId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch transaction status');
      }
      
      if (data.success && data.transaction) {
        // Update status based on transaction status
        if (data.transaction.status === 'completed') {
          setStatus('success');
          // Invalidate balance query to refresh wallet balance
          queryClient.invalidateQueries({ queryKey: ['user', 'balance'] });
          
          toast({
            title: "Payment Successful",
            description: "Your wallet has been credited successfully",
            variant: "default",
          });
        } else if (data.transaction.status === 'pending') {
          setStatus('pending');
          
          toast({
            title: "Payment Pending",
            description: "Your payment is still being processed",
            variant: "default",
          });
        } else {
          setStatus('failed');
          
          toast({
            title: "Payment Failed",
            description: "There was an issue with your payment",
            variant: "destructive",
          });
        }
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error refreshing transaction status:', error);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md border-[#243442] bg-[#172B3A] text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Payment Status</CardTitle>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center py-6">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#1375e1]" />
                <p className="text-lg text-white">Checking payment status...</p>
                <p className="text-sm text-[#7F8990] mt-2">Please wait while we verify your payment</p>
              </div>
            ) : status === 'success' ? (
              <div className="text-center py-8">
                <div className="rounded-full bg-[#20b26c]/20 p-4 mx-auto mb-4 inline-block">
                  <CheckCircle className="h-12 w-12 text-[#20b26c]" />
                </div>
                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                <p className="text-[#7F8990] mt-2">Your wallet has been credited successfully</p>
                <p className="text-xs text-[#7F8990] mt-4">Transaction ID: {txnId || 'N/A'}</p>
              </div>
            ) : status === 'pending' ? (
              <div className="text-center py-8">
                <RefreshCw className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white">Payment Processing</h3>
                <p className="text-[#7F8990] mt-2">Your payment is being processed. This may take a few minutes.</p>
                <p className="text-xs text-[#7F8990] mt-4">Transaction ID: {txnId || 'N/A'}</p>
                
                <Button 
                  variant="outline"
                  className="mt-6 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                  onClick={refreshStatus}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Check Status Again
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="rounded-full bg-red-500/20 p-4 mx-auto mb-4 inline-block">
                  <AlertTriangle className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Payment Failed</h3>
                <p className="text-[#7F8990] mt-2">We couldn't process your payment. Please try again.</p>
                <p className="text-xs text-[#7F8990] mt-4">Transaction ID: {txnId || 'N/A'}</p>
              </div>
            )}
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
            
            {status === 'failed' && (
              <Button
                className="bg-[#1375e1] hover:bg-[#1060c0] text-white"
                onClick={() => setLocation('/recharge')}
              >
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}