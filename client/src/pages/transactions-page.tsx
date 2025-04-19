import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListOrdered, ArrowDownCircle, ArrowUpCircle, Loader2, AlertCircle } from 'lucide-react';
import { Transaction } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { toast } = useToast();
  
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    refetchInterval: 10000, // Refresh every 10 seconds to get latest transactions
  });

  // Format amount with BTC symbol
  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toFixed(8)} ${currency}`;
  };

  // Get transaction icon based on type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      case 'bet_win':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />;
      case 'bet_loss':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ListOrdered className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get transaction status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#1375e1]" />
        <p className="mt-4 text-lg text-gray-300">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading transactions",
      description: "Could not load your transaction history. Please try again later.",
      variant: "destructive"
    });
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-gray-300">Could not load transactions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-[#0F212E] border-[#172B3A]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <ListOrdered className="h-6 w-6 text-[#1375e1]" />
            <div>
              <CardTitle className="text-white text-2xl">Transactions</CardTitle>
              <CardDescription className="text-gray-400">
                View your deposit, withdrawal and bet history
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableCaption>Your transaction history</TableCaption>
              <TableHeader>
                <TableRow className="border-[#172B3A] hover:bg-[#172B3A]">
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} className="border-[#172B3A] hover:bg-[#172B3A]">
                    <TableCell className="flex items-center space-x-2">
                      {getTransactionIcon(transaction.type)}
                      <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>{transaction.description || '-'}</TableCell>
                    <TableCell>
                      <span className={transaction.type === 'deposit' || transaction.type === 'bet_win' ? 'text-green-500' : 'text-red-500'}>
                        {transaction.type === 'deposit' || transaction.type === 'bet_win' ? '+' : '-'}
                        {formatAmount(transaction.amount, transaction.currency)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ListOrdered className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg">No transactions found</p>
              <p className="text-sm mt-2">Your transaction history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}