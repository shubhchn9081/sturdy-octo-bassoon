import React, { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Button } from '@/components/ui/button';

export function AutoAnimateExample() {
  // Items state
  const [items, setItems] = useState<string[]>([
    'Item 1',
    'Item 2',
    'Item 3',
  ]);
  
  // Reference with auto-animate hook
  const [parent] = useAutoAnimate();
  
  // Add a new item
  const addItem = () => {
    setItems([...items, `Item ${items.length + 1}`]);
  };
  
  // Remove an item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  // Shuffle the items
  const shuffleItems = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-background rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">AutoAnimate Example</h2>
      
      <div className="flex gap-2 mb-4">
        <Button onClick={addItem} variant="default">Add Item</Button>
        <Button onClick={shuffleItems} variant="outline">Shuffle</Button>
      </div>
      
      {/* This ul will automatically animate child changes */}
      <ul ref={parent} className="space-y-2">
        {items.map((item, index) => (
          <li 
            key={item} 
            className="flex items-center justify-between p-3 bg-card rounded-md"
          >
            <span>{item}</span>
            <Button 
              onClick={() => removeItem(index)} 
              variant="ghost" 
              size="sm"
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}