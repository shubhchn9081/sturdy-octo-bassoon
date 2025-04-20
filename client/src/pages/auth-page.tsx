import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const AuthPage = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  
  // If user is already signed in, redirect to home page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLocation('/');
    }
  }, [isLoaded, isSignedIn, setLocation]);

  // Handle tab switch
  const handleTabSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#0f1a24] flex items-center justify-center p-4">
      <div className="grid md:grid-cols-2 w-full max-w-6xl overflow-hidden rounded-xl shadow-xl">
        {/* Auth Form Column */}
        <div className="bg-[#172B3A] p-8 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to Stake</h1>
            <p className="text-gray-400 text-sm md:text-base">Your premium gaming platform</p>
          </div>
          
          <div className="w-full max-w-md mx-auto">
            {/* Tabs for Sign In / Sign Up */}
            <div className="tabs mb-8 flex">
              <button 
                onClick={() => handleTabSwitch('signin')}
                className={`flex-1 py-3 px-4 transition-colors ${activeTab === 'signin' ? 'bg-[#172B3A] text-white border-b-2 border-[#57FBA2]' : 'bg-[#11212d] text-gray-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => handleTabSwitch('signup')}
                className={`flex-1 py-3 px-4 transition-colors ${activeTab === 'signup' ? 'bg-[#172B3A] text-white border-b-2 border-[#57FBA2]' : 'bg-[#11212d] text-gray-400'}`}
              >
                Sign Up
              </button>
            </div>
            
            {/* Clerk Authentication Components */}
            <div className="clerk-container">
              {activeTab === 'signup' ? (
                <SignUp 
                  redirectUrl="/"
                  path="/auth/sign-up"
                  signInUrl="/auth/sign-in"
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      footer: 'hidden',
                    }
                  }}
                />
              ) : (
                <SignIn 
                  redirectUrl="/"
                  path="/auth/sign-in"
                  signUpUrl="/auth/sign-up"
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      footer: 'hidden',
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Hero Image Column */}
        <div className="hidden md:block bg-gradient-to-br from-[#1b2b3a] to-[#0a131e] relative">
          <div className="absolute inset-0 flex items-center justify-center flex-col p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Experience Premium Gaming</h2>
            <p className="text-gray-300 mb-6 max-w-md">
              Join our community of players and enjoy a wide variety of casino games with provably fair mechanics.
            </p>
            <div className="flex space-x-3 mb-8">
              <span className="w-3 h-3 rounded-full bg-[#57FBA2]"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              <div className="bg-black/20 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-[#57FBA2]">99%</div>
                <div className="text-xs text-gray-400">Payout Rate</div>
              </div>
              <div className="bg-black/20 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-yellow-400">1M+</div>
                <div className="text-xs text-gray-400">Players</div>
              </div>
              <div className="bg-black/20 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-blue-400">24/7</div>
                <div className="text-xs text-gray-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;