import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import { AuthButtons } from '@/components/auth/AuthButtons';

const AuthPage: React.FC = () => {
  const { user } = useAuth();

  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-[#0A1823] flex justify-center items-center px-4 py-12">
      <div className="w-full max-w-5xl bg-[#142634] rounded-lg shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Auth Form */}
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome to Stake.com</h2>
              <p className="text-gray-400 mt-2">
                Join the world's largest crypto casino & sportsbook
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-4">
              <AuthButtons />
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="hidden md:block bg-[#1E3851] p-8 relative">
            <div className="absolute inset-0 opacity-10">
              <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M200 0L400 200L200 400L0 200L200 0Z" fill="white" />
              </svg>
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">
                Experience the Future of Gambling
              </h3>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#3498db] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Provably fair gaming experience</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#3498db] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Instant deposits and withdrawals</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#3498db] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Weekly bonuses and rewards</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-[#3498db] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>24/7 live support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;