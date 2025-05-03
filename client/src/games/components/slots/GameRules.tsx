import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Game rules component for Slots game
const GameRules: React.FC = () => {
  return (
    <div className="space-y-4 text-sm text-gray-300">
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">How to Play</h3>
        <p>
          Slots is a classic 3-reel game. Place your bet and spin the reels to match numbers
          and win multipliers based on the combinations you land.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">Winning Combinations</h3>
        <Table>
          <TableHeader>
            <TableRow className="border-[#1D2F3D]">
              <TableHead className="text-white">Combination</TableHead>
              <TableHead className="text-right text-white">Multiplier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-[#1D2F3D]">
              <TableCell>Three of a kind (any number)</TableCell>
              <TableCell className="text-right">5x</TableCell>
            </TableRow>
            <TableRow className="border-[#1D2F3D]">
              <TableCell>Three 7s (jackpot)</TableCell>
              <TableCell className="text-right">10x</TableCell>
            </TableRow>
            <TableRow className="border-[#1D2F3D]">
              <TableCell>Sequential numbers (e.g., 3-4-5)</TableCell>
              <TableCell className="text-right">2x</TableCell>
            </TableRow>
            <TableRow className="border-[#1D2F3D]">
              <TableCell>Any pair (two matching numbers)</TableCell>
              <TableCell className="text-right">1.5x</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">Game Rules</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Each spin costs the bet amount you set.</li>
          <li>Each reel contains numbers from 0 to 9.</li>
          <li>Only the highest multiplier will be awarded per spin.</li>
          <li>Winning amount = Bet Amount × Multiplier.</li>
          <li>The game uses a provably fair algorithm to ensure random results.</li>
          <li>Minimum bet: 0.00000001 INR.</li>
          <li>Maximum bet: 100 INR.</li>
          <li>Maximum win: 10x your bet.</li>
          <li>RTP (Return to Player): 97%.</li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">Auto-Spin Feature</h3>
        <p>
          Enable auto-spin to automatically place the same bet amount after each spin result.
          You can stop auto-spin at any time by clicking the "STOP AUTO" button.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">Fairness</h3>
        <p>
          The slots game uses a verified random number generation system that ensures
          fair and unbiased results for all players. Each spin's outcome is determined by
          a combination of server seed and client seed, which cannot be manipulated.
        </p>
      </div>
    </div>
  );
};

export default GameRules;