import React from 'react';
import { AutoAnimateExample } from '@/components/examples/AutoAnimateExample';

export function AnimationExamples() {
  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-2xl font-bold">Animation Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <AutoAnimateExample />
        </div>
        {/* More animation examples can be added here */}
      </div>
    </div>
  );
}

export default AnimationExamples;