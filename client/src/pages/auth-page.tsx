import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

const AuthPage = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [, setLocation] = useLocation();
  
  // If user is already signed in, redirect to home page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setLocation('/');
    }
  }, [isLoaded, isSignedIn, setLocation]);

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
                onClick={() => window.location.hash = '#sign-in'}
                className={`flex-1 py-3 px-4 ${window.location.hash !== '#sign-up' ? 'bg-[#172B3A] text-white border-b-2 border-[#1375e1]' : 'bg-[#11212d] text-gray-400'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => window.location.hash = '#sign-up'}
                className={`flex-1 py-3 px-4 ${window.location.hash === '#sign-up' ? 'bg-[#172B3A] text-white border-b-2 border-[#1375e1]' : 'bg-[#11212d] text-gray-400'}`}
              >
                Sign Up
              </button>
            </div>
            
            {/* Clerk Authentication Components */}
            <div className="clerk-container" style={{ maxWidth: '100%' }}>
              {window.location.hash === '#sign-up' ? (
                <SignUp 
                  routing="hash" 
                  redirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-gray-400',
                      socialButtonsBlockButton: 'bg-[#0f1a24] text-white border-[#243442] hover:bg-[#14212e]',
                      socialButtonsBlockButtonText: 'text-white',
                      dividerLine: 'bg-[#243442]',
                      dividerText: 'text-gray-400',
                      formFieldLabel: 'text-gray-300',
                      formFieldInput: 'bg-[#0e1822] border-[#243442] text-white focus:border-[#1375e1] rounded',
                      formButtonPrimary: 'bg-[#1375e1] hover:bg-[#1167c2] text-white',
                      footerActionLink: 'text-[#1375e1] hover:text-[#1167c2]',
                      alertText: 'text-white',
                    }
                  }}
                />
              ) : (
                <SignIn 
                  routing="hash" 
                  redirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: 'mx-auto',
                      card: 'bg-transparent shadow-none',
                      headerTitle: 'text-white',
                      headerSubtitle: 'text-gray-400',
                      socialButtonsBlockButton: 'bg-[#0f1a24] text-white border-[#243442] hover:bg-[#14212e]',
                      socialButtonsBlockButtonText: 'text-white',
                      dividerLine: 'bg-[#243442]',
                      dividerText: 'text-gray-400',
                      formFieldLabel: 'text-gray-300',
                      formFieldInput: 'bg-[#0e1822] border-[#243442] text-white focus:border-[#1375e1] rounded',
                      formButtonPrimary: 'bg-[#1375e1] hover:bg-[#1167c2] text-white',
                      footerActionLink: 'text-[#1375e1] hover:text-[#1167c2]',
                      alertText: 'text-white',
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
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
              <div className="bg-black/20 p-3 rounded-lg text-center">
                <div className="text-xl font-bold text-green-400">99%</div>
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