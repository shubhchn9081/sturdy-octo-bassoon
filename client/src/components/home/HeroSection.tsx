import React from 'react';
import { Facebook } from 'lucide-react';
import { RegisterButton } from '@/components/auth/AuthButtons';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../hooks/use-auth';

// Social login icons
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const TwitchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#9146FF">
    <path d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z" fillRule="evenodd" clipRule="evenodd"/>
  </svg>
);

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="relative w-full bg-gradient-to-br from-[#12212F] to-[#0A1823] py-16">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              World's Largest Online Casino and Sportsbook
            </h1>
            
            <p className="text-gray-400 text-lg max-w-lg">
              Experience the thrill of provably fair gambling with our wide range of exciting games.
            </p>
            
            {!user && (
              <div className="pt-4 space-y-6">
                <RegisterButton />
                
                <div className="flex flex-col space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#234458]"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-[#12212F] text-gray-400">Or sign up with</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-transparent border-[#234458] hover:bg-[#234458] hover:text-white"
                    >
                      <Facebook className="h-4 w-4 text-[#3b5998]" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-transparent border-[#234458] hover:bg-[#234458] hover:text-white"
                    >
                      <GoogleIcon />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="bg-transparent border-[#234458] hover:bg-[#234458] hover:text-white"
                    >
                      <TwitchIcon />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img 
                src="/images/hero-casino-dealer.png" 
                alt="Casino Dealer" 
                className="rounded-lg w-full max-w-md lg:max-w-lg"
                onError={(e) => {
                  // Fallback image if main image fails to load
                  e.currentTarget.src = "https://placehold.co/600x400/0A1823/CCCCCC?text=Stake.com+Casino";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;