import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PromotionCardProps = {
  title: string;
  description: string;
  type: 'announcement' | 'promo';
  imageSrc: string;
  readMoreUrl: string;
  playNowUrl: string;
  playNowText?: string;
  className?: string;
};

const PromotionCard = ({
  title,
  description,
  type,
  imageSrc,
  readMoreUrl,
  playNowUrl,
  playNowText = 'Play Now',
  className
}: PromotionCardProps) => {
  return (
    <div className={cn("bg-secondary rounded-lg overflow-hidden relative", className)}>
      <Badge 
        className={cn(
          "absolute top-2 left-2 text-xs rounded",
          type === 'announcement' ? "bg-blue-500 text-white" : "bg-accent text-black"
        )}
      >
        {type === 'announcement' ? 'Announcement' : 'Promo'}
      </Badge>
      
      <div className="p-4 flex">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm mb-2">{description}</p>
          
          <div 
            className="text-accent text-sm font-medium hover:underline cursor-pointer" 
            onClick={() => window.location.href = readMoreUrl}
          >
            Read More
          </div>
          
          <Button 
            variant="outline" 
            className="mt-3 border-border hover:border-border hover:bg-muted"
            onClick={() => window.location.href = playNowUrl}
          >
            {playNowText}
          </Button>
        </div>
        
        <div className="w-1/2">
          <div 
            className="w-full h-32 rounded bg-center bg-cover" 
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PromotionCard;
