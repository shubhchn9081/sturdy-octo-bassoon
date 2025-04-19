import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define types for user data and context
type User = {
  id: number;
  username: string;
  balance: {
    INR: number; // Added INR as default currency
    BTC: number;
    ETH: number;
    USDT: number;
    LTC: number;
  };
  isAdmin?: boolean;
};

type UserContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateBalance: (currency: keyof User['balance'], amount: number) => void;
};

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create the provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('stakeUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('stakeUser');
      }
    }
  }, []);

  // Save user to localStorage when user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('stakeUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('stakeUser');
    }
  }, [user]);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would make an API request to authenticate the user
      // For demo purposes, accept any non-empty username/password
      if (username && password) {
        // Mock user data for demonstration
        const newUser: User = {
          id: 1,
          username,
          balance: {
            INR: 75000, // Default INR balance
            BTC: 0.5,
            ETH: 1.25,
            USDT: 1250,
            LTC: 3.75
          },
          isAdmin: username === 'admin'
        };
        
        setUser(newUser);
        
        toast({
          title: 'Login successful',
          description: `Welcome back, ${username}!`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Register function
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would make an API request to create a new user
      // For demo purposes, accept any non-empty username/password
      if (username && password) {
        // Mock user data for demonstration
        const newUser: User = {
          id: 1,
          username,
          balance: {
            INR: 10000, // Default INR balance for new users
            BTC: 0.1,
            ETH: 0.5,
            USDT: 500,
            LTC: 1.5
          }
        };
        
        setUser(newUser);
        
        toast({
          title: 'Registration successful',
          description: `Welcome, ${username}!`,
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  // Update balance function
  const updateBalance = (currency: keyof User['balance'], amount: number) => {
    if (!user) return;

    setUser({
      ...user,
      balance: {
        ...user.balance,
        [currency]: user.balance[currency] + amount
      }
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateBalance
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Create a custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}