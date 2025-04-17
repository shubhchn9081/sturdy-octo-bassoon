import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatCrypto } from '@/lib/utils';

type User = {
  id: number;
  username: string;
  balance: number;
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  balance: string;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('Guest');

  // Fetch user data if authenticated
  const { data: userData, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    enabled: isAuthenticated,
  });

  // For demo purposes, auto-login as a guest user
  useEffect(() => {
    // Create a guest user with a random id
    const guestUser = {
      id: Math.floor(Math.random() * 1000000),
      username: `Guest-${Math.floor(Math.random() * 10000)}`,
      balance: 1000,
    };
    
    login(guestUser.username);
  }, []);

  const login = (username: string) => {
    // In a real implementation, this would call an API endpoint
    setUsername(username);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername('Guest');
  };

  const user = userData || null;
  const balance = user ? formatCrypto(user.balance) : "0.00000000";

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        balance,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
