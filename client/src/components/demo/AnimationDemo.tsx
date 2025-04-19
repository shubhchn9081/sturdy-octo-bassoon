import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash, Plus, Shuffle } from 'lucide-react';

export function AnimationDemo() {
  // State to track our list items
  const [items, setItems] = useState<string[]>([
    'Item 1',
    'Item 2',
    'Item 3',
  ]);
  
  // The magic happens here - this creates a ref we'll attach to our list
  const [parent] = useAutoAnimate();
  
  // Add a new item to the list
  const addItem = () => {
    setItems([...items, `Item ${items.length + 1}`]);
  };
  
  // Remove an item by index
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  // Shuffle all items in the list
  const shuffleItems = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Auto-Animate Demo</CardTitle>
        <CardDescription>
          Smooth animations with minimal code using @formkit/auto-animate
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
          <Button onClick={shuffleItems} variant="outline" size="sm">
            <Shuffle className="h-4 w-4 mr-1" /> Shuffle
          </Button>
        </div>
        
        {/* This is where the magic happens - just add the ref to the parent container */}
        <ul ref={parent} className="space-y-2">
          {items.map((item, index) => (
            <li 
              key={index} 
              className="flex justify-between items-center p-3 bg-secondary/20 rounded-md"
            >
              <span>{item}</span>
              <Button 
                onClick={() => removeItem(index)} 
                variant="ghost" 
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <CardFooter className="text-sm text-muted-foreground">
        All animations are handled automatically - no complex code needed!
      </CardFooter>
    </Card>
  );
}