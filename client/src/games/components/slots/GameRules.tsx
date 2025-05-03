import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const GameRules: React.FC = () => {
  // Define winning combinations and their respective multipliers
  const winningCombinations = [
    {
      type: 'Lucky Number',
      pattern: ['L', 'x', 'y'],
      multiplier: 10,
      description: 'Your lucky number appears in any reel'
    },
    {
      type: 'Three 7s',
      pattern: [7, 7, 7],
      multiplier: 10,
      description: 'Three number 7s in a row'
    },
    {
      type: 'Three of a Kind',
      pattern: ['x', 'x', 'x'],
      multiplier: 5,
      description: 'Three of the same number'
    },
    {
      type: 'Sequential Numbers',
      pattern: ['n', 'n+1', 'n+2'],
      multiplier: 3,
      description: 'Three sequential numbers (e.g., 3-4-5)'
    },
    {
      type: 'Two of a Kind',
      pattern: ['x', 'x', 'y'],
      multiplier: 2,
      description: 'Two of the same number'
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-[#172B3A] border-[#1D2F3D]">
        <CardHeader className="pb-2">
          <CardTitle>How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Game Overview</h3>
            <p className="text-sm text-muted-foreground">
              Slots is a simple and exciting game where you spin three reels and try to match certain patterns to win. 
              Each reel will display a number from 0 to 9.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Steps to Play</h3>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Set your bet amount using the betting panel</li>
              <li>Click the "Spin" button to start the game</li>
              <li>Watch as the three reels spin and stop one by one</li>
              <li>If the final combination matches a winning pattern, you win!</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#172B3A] border-[#1D2F3D]">
        <CardHeader className="pb-2">
          <CardTitle>Winning Combinations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#1D2F3D]">
                <TableHead>Combination</TableHead>
                <TableHead>Example</TableHead>
                <TableHead>Multiplier</TableHead>
                <TableHead className="hidden sm:table-cell">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winningCombinations.map((combo, index) => (
                <TableRow key={index} className="border-[#1D2F3D]">
                  <TableCell className="font-medium">{combo.type}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {Array.isArray(combo.pattern) && combo.pattern.map((val, i) => (
                        <div 
                          key={i} 
                          className="w-6 h-6 bg-[#213D54] rounded flex items-center justify-center text-xs"
                        >
                          {val === 7 ? '7' : val}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-primary">{combo.multiplier}x</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {combo.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-[#172B3A] border-[#1D2F3D]">
        <CardHeader className="pb-2">
          <CardTitle>Game Fairness</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">
            The Slots game uses a provably fair system to ensure the randomness of the outcomes. 
            Each spin combines server-side and client-side seeds to generate the results.
          </p>
          <p>
            The game is designed to provide a true and fair casino experience while still being fun and exciting.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameRules;