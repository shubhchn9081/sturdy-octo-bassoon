import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-4 flex items-center border-[#243442] text-white hover:bg-[#172B3A]"
        onClick={() => setLocation('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home
      </Button>
      
      <Card className="bg-[#172B3A] border-[#243442] text-white shadow-lg">
        <CardHeader>
          <div className="flex items-center mb-2">
            {icon}
            <CardTitle className="text-2xl font-bold ml-3">{title}</CardTitle>
          </div>
          <CardDescription className="text-[#7F8990]">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-6">
            <div className="text-4xl text-[#1375e1] mb-6">
              {icon}
            </div>
            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
            <p className="text-[#7F8990] max-w-md">
              This feature is currently under development and will be available soon.
              Check back later for updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}