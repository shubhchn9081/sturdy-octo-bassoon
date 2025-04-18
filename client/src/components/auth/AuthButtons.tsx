import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthModals, { AuthModalType } from './AuthModals';
import { useAuth } from '../../hooks/use-auth';
import { LogOut } from 'lucide-react';

export function RegisterButton() {
  const [openModal, setOpenModal] = useState<AuthModalType>(null);
  
  return (
    <>
      <Button 
        onClick={() => setOpenModal('register')}
        className="bg-[#3498db] hover:bg-[#2980b9] text-white"
      >
        Register
      </Button>
      <AuthModals open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}

export function LoginButton() {
  const [openModal, setOpenModal] = useState<AuthModalType>(null);
  
  return (
    <>
      <Button 
        onClick={() => setOpenModal('login')}
        variant="ghost" 
        className="text-white hover:bg-[#243442]"
      >
        Login
      </Button>
      <AuthModals open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}

export function LogoutButton() {
  const { logoutMutation } = useAuth();
  
  return (
    <Button 
      onClick={() => logoutMutation.mutate()}
      variant="ghost" 
      className="text-gray-300 hover:text-white hover:bg-[#243442]"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}

export function AuthButtons() {
  const { user } = useAuth();
  
  if (user) {
    return <LogoutButton />;
  }
  
  return (
    <div className="flex items-center gap-2">
      <LoginButton />
      <RegisterButton />
    </div>
  );
}