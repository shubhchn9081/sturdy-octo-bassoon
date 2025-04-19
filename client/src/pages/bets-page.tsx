import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, Loader2, AlertCircle, Check, X, ChevronsUp, ChevronsDown } from 'lucide-react';
import { Bet, Game } from '@shared/schema';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default function BetsPage() {
  const { toast } = useToast();
  const [selectedGameId, setSelectedGameId] = useState<string>("all");
  
  // Get all games for the filter
  const { data: games } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });
  
  // Get bet history
  const { data: bets, isLoading, error } = useQuery<Bet[]>({
    queryKey: ['/api/bets/history', selectedGameId !== "all" ? parseInt(selectedGameId) : undefined],
    queryFn: async () => {
      const url = `/api/bets/history${selectedGameId !== "all" ? `?gameId=${selectedGameId}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch bets');
      }
      return response.json();
    },
  });

  // Format amount with BTC symbol
  const formatAmount = (amount: number | null) => {
    if (amount === null) return "0.00000000 BTC";
    return `${amount.toFixed(8)} BTC`;
  };

  // Get game name from game ID
  const getGameName = (gameId: number) => {
    if (!games) return "Unknown Game";
    const game = games.find(g => g.id === gameId);
    return game ? game.name : "Unknown Game";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#1375e1]" />
        <p className="mt-4 text-lg text-gray-300">Loading bets...</p>
      </div>
    );
  }

  if (error) {
    toast({
      title: "Error loading bets",
      description: "Could not load your bet history. Please try again later.",
      variant: "destructive"
    });
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg text-gray-300">Could not load bets. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-[#0F212E] border-[#172B3A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-[#1375e1]" />
              <div>
                <CardTitle className="text-white text-2xl">My Bets</CardTitle>
                <CardDescription className="text-gray-400">
                  View your betting history and results
                </CardDescription>
              </div>
            </div>
            
            <div className="w-48">
              <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                <SelectTrigger className="bg-[#172B3A] border-[#243442] text-white">
                  <SelectValue placeholder="Filter by game" />
                </SelectTrigger>
                <SelectContent className="bg-[#172B3A] border-[#243442] text-white">
                  <SelectItem value="all">All Games</SelectItem>
                  {games?.map((game) => (
                    <SelectItem key={game.id} value={game.id.toString()}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bets && bets.length > 0 ? (
            <Table>
              <TableCaption>Your betting history</TableCaption>
              <TableHeader>
                <TableRow className="border-[#172B3A] hover:bg-[#172B3A]">
                  <TableHead>Game</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet) => (
                  <TableRow key={bet.id} className="border-[#172B3A] hover:bg-[#172B3A]">
                    <TableCell>{getGameName(bet.gameId)}</TableCell>
                    <TableCell>{formatAmount(bet.amount)}</TableCell>
                    <TableCell>
                      {bet.multiplier !== null ? (
                        <span className="flex items-center">
                          {bet.multiplier}x 
                          {bet.multiplier > 1 ? 
                            <ChevronsUp className="h-4 w-4 ml-1 text-green-500" /> : 
                            <ChevronsDown className="h-4 w-4 ml-1 text-red-500" />
                          }
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {bet.profit !== null ? (
                        <span className={bet.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {bet.profit >= 0 ? '+' : ''}
                          {formatAmount(bet.profit)}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      {bet.completed ? (
                        bet.profit !== null && bet.profit > 0 ? (
                          <span className="flex items-center text-green-500">
                            <Check className="h-4 w-4 mr-1" /> Win
                          </span>
                        ) : (
                          <span className="flex items-center text-red-500">
                            <X className="h-4 w-4 mr-1" /> Loss
                          </span>
                        )
                      ) : (
                        <span className="text-yellow-500">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(bet.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg">No bets found</p>
              <p className="text-sm mt-2">Your betting history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}