import React from 'react';
import { AutoAnimateExample } from '@/components/examples/AutoAnimateExample';
import { BettingHistoryAnimate } from '@/components/examples/BettingHistoryAnimate';
import { GameLobbyAnimate } from '@/components/examples/GameLobbyAnimate';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export function AnimationExamples() {
  return (
    <div className="container py-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Animation Examples with @formkit/auto-animate</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <p className="text-muted-foreground">
          This page demonstrates the <code className="bg-muted px-1 py-0.5 rounded">@formkit/auto-animate</code> library 
          for creating smooth animations with minimal code. No complex animation configurations needed!
        </p>
      </div>
      
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Example</TabsTrigger>
          <TabsTrigger value="betting">Betting History</TabsTrigger>
          <TabsTrigger value="lobby">Game Lobby</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="mt-6">
          <div className="max-w-md mx-auto">
            <AutoAnimateExample />
          </div>
        </TabsContent>
        
        <TabsContent value="betting" className="mt-6">
          <div className="max-w-md mx-auto">
            <BettingHistoryAnimate />
          </div>
        </TabsContent>
        
        <TabsContent value="lobby" className="mt-6">
          <GameLobbyAnimate />
        </TabsContent>
      </Tabs>
      
      <div className="bg-card rounded-lg p-6 border border-border mt-8">
        <h2 className="text-xl font-bold mb-4">How to Use @formkit/auto-animate</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">1. Import the hook</h3>
            <pre className="bg-muted p-3 rounded-md text-sm mt-2 overflow-x-auto">
              {`import { useAutoAnimate } from '@formkit/auto-animate/react';`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">2. Create a ref with the hook</h3>
            <pre className="bg-muted p-3 rounded-md text-sm mt-2 overflow-x-auto">
              {`const [parent] = useAutoAnimate();`}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">3. Apply the ref to a container element</h3>
            <pre className="bg-muted p-3 rounded-md text-sm mt-2 overflow-x-auto">
              {`<ul ref={parent}>\n  {items.map(item => (\n    <li key={item.id}>{item.name}</li>\n  ))}\n</ul>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimationExamples;