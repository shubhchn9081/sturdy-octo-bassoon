import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserBalance: (currency: string, amount: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user data on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/login', { username, password });
      
      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid username or password',
          variant: 'destructive',
        });
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${userData.username}!`,
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/register', { username, password });
      
      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'Registration Failed',
          description: error.message || 'Unable to create account',
          variant: 'destructive',
        });
        return false;
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: 'Registration Successful',
        description: `Welcome, ${userData.username}!`,
      });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };

  const updateUserBalance = async (currency: string, amount: number): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await apiRequest('POST', '/api/update-balance', { 
        userId: user.id,
        currency,
        amount,
      });
      
      if (!response.ok) {
        const error = await response.json();
        toast({
          title: 'Update Failed',
          description: error.message || 'Unable to update balance',
          variant: 'destructive',
        });
        return;
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update balance error:', error);
      toast({
        title: 'Update Failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, register, logout, updateUserBalance }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};

// Alias for backward compatibility
export const useUser = useAuth;