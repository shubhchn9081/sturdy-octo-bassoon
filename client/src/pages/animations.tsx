import React from 'react';
import { AnimationDemo } from '@/components/demo/AnimationDemo';
import { BettingHistoryDemo } from '@/components/demo/BettingHistoryDemo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnimationsPage() {
  return (
    <div className="container py-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Animation Examples</h1>
        <p className="text-muted-foreground">
          Smooth, effortless animations using @formkit/auto-animate
        </p>
      </div>
      
      <div className="p-4 bg-muted/30 rounded-lg border border-border">
        <h2 className="text-lg font-semibold mb-2">About @formkit/auto-animate</h2>
        <p>
          Auto-animate is a zero-config animation utility that adds smooth transitions
          to your app using a single React hook. No complex configuration needed!
        </p>
        <div className="mt-4 bg-black/80 p-3 rounded-md">
          <pre className="text-sm text-green-400 overflow-x-auto">
            <code>{`// Install with npm
npm install @formkit/auto-animate

// Import the hook
import { useAutoAnimate } from '@formkit/auto-animate/react'

// Add it to your component
const [parent] = useAutoAnimate()

// Connect it to a parent element
<ul ref={parent}>
  {items.map(item => (
    <li key={item.id}>{item.name}</li>
  ))}
</ul>`}</code>
          </pre>
        </div>
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Demo</TabsTrigger>
          <TabsTrigger value="betting">Betting History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="mt-4">
          <AnimationDemo />
        </TabsContent>
        
        <TabsContent value="betting" className="mt-4">
          <BettingHistoryDemo />
        </TabsContent>
      </Tabs>
      
      <div className="p-4 bg-card rounded-lg border border-border mt-4">
        <h2 className="text-lg font-semibold mb-2">Integration Ideas</h2>
        <ul className="list-disc list-inside space-y-2 ml-2">
          <li>Animate bet history in real-time as bets are placed</li>
          <li>Smooth transitions for leaderboards as rankings change</li>
          <li>Animate game cards/thumbnails when filtering or sorting</li>
          <li>Create engaging notifications that smoothly enter and exit</li>
          <li>Animate chat messages in multiplayer games</li>
        </ul>
      </div>
    </div>
  );
}