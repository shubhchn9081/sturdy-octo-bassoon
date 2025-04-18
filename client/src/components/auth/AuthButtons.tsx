import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthModals, { AuthModalType } from './AuthModals';
import { useAuth } from '../../hooks/use-auth';
import { LogOut } from 'lucide-react';
import { Link } from 'wouter';

// Register button that matches Stake.com design
export function RegisterButton() {
  const [openModal, setOpenModal] = useState<AuthModalType>(null);
  
  return (
    <>
      <Button 
        onClick={() => setOpenModal('register')}
        className="bg-[#3498db] hover:bg-[#2980b9] text-white font-medium rounded px-5 py-2 h-10"
      >
        Register
      </Button>
      <AuthModals open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}

// Login button that matches Stake.com design
export function LoginButton() {
  const [openModal, setOpenModal] = useState<AuthModalType>(null);
  
  return (
    <>
      <Button 
        onClick={() => setOpenModal('login')}
        variant="ghost" 
        className="text-white hover:text-[#3498db] hover:bg-transparent font-medium"
      >
        Login
      </Button>
      <AuthModals open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}

// Login button as a link for the header
export function LoginLink() {
  return (
    <Link href="/auth">
      <span className="text-white hover:text-[#3498db] font-medium cursor-pointer">
        Login
      </span>
    </Link>
  );
}

// Register button as a link for the header
export function RegisterLink() {
  return (
    <Link href="/auth">
      <Button className="bg-[#3498db] hover:bg-[#2980b9] text-white font-medium rounded px-5 py-2 h-10">
        Register
      </Button>
    </Link>
  );
}

// Logout button component
export function LogoutButton() {
  const { logoutMutation } = useAuth();
  
  return (
    <Button 
      onClick={() => logoutMutation.mutate()}
      variant="ghost" 
      className="text-gray-300 hover:text-white hover:bg-[#243442]"
      disabled={logoutMutation.isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
    </Button>
  );
}

// Combined auth buttons component for header use
export function AuthButtons() {
  const { user } = useAuth();
  
  if (user) {
    return <LogoutButton />;
  }
  
  return (
    <div className="flex items-center gap-3">
      <LoginButton />
      <RegisterButton />
    </div>
  );
}

// Auth links component for navigation
export function AuthLinks() {
  const { user } = useAuth();
  
  if (user) {
    return <LogoutButton />;
  }
  
  return (
    <div className="flex items-center gap-3">
      <LoginLink />
      <RegisterLink />
    </div>
  );
}