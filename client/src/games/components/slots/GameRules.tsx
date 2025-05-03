import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GameRules = () => {
  return (
    <div className="text-sm space-y-4">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-base">How to Play</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>Slots is a simple and fun game where you spin three reels and try to match patterns to win!</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Enter your bet amount</li>
                <li>Select your lucky number (optional)</li>
                <li>Click "Spin" to start the game</li>
                <li>Watch as the reels spin and land on random numbers</li>
                <li>Different combinations result in different multipliers</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-2">
          <AccordionTrigger className="text-base">Winning Combinations</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Combination</TableHead>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Example</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Three 7s</TableCell>
                  <TableCell className="font-bold">10×</TableCell>
                  <TableCell>7-7-7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Three identical numbers</TableCell>
                  <TableCell className="font-bold">5×</TableCell>
                  <TableCell>3-3-3, 8-8-8</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sequential numbers</TableCell>
                  <TableCell className="font-bold">3×</TableCell>
                  <TableCell>1-2-3, 4-5-6</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Two identical numbers</TableCell>
                  <TableCell className="font-bold">2×</TableCell>
                  <TableCell>5-5-2, 9-3-9</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3">
          <AccordionTrigger className="text-base">Lucky Number Feature</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>The Lucky Number feature gives you a chance to win big!</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Select any number from 0-9 as your lucky number before spinning</li>
                <li>If your lucky number appears on any of the three reels, you win 10× your bet!</li>
                <li>This special jackpot win overrides any other winning combination</li>
                <li>The lucky number is highlighted in special gold when you hit it</li>
              </ul>
              <div className="mt-2 p-2 bg-yellow-950/30 border border-yellow-900/50 rounded">
                <p className="text-yellow-300 flex items-center">
                  <span className="text-yellow-500 text-lg mr-2">💡</span>
                  <span>Tip: The lucky number feature gives you better odds for a big 10× win!</span>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-4">
          <AccordionTrigger className="text-base">Auto Spin</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>Auto Spin allows the game to play automatically without having to click the spin button each time.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Toggle the "Auto Spin" switch to activate it</li>
                <li>The game will continue spinning until you toggle it off</li>
                <li>Each spin will use your current bet amount</li>
                <li>Auto Spin automatically stops if your balance becomes too low</li>
              </ul>
              <div className="mt-2 p-2 bg-red-950/30 border border-red-900/50 rounded">
                <p className="text-red-300 flex items-center">
                  <span className="text-red-500 text-lg mr-2">⚠️</span>
                  <span>Caution: Auto Spin will continue using your balance until you manually stop it!</span>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-5">
          <AccordionTrigger className="text-base">Fairness & RTP</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <p>Our slots game uses a provably fair algorithm to ensure completely random and fair results.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Return to Player (RTP) is 96%</li>
                <li>The house edge is 4%</li>
                <li>Each number (0-9) has an equal chance of appearing</li>
                <li>Your lucky number has a 1/10 chance of appearing on each reel</li>
                <li>Results are verified through the provably fair system</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default GameRules;