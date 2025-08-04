import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'owner' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gymId?: string;
  phone?: string;
  avatar?: string;
  subscriptions?: Subscription[];
}

export interface Subscription {
  id: string;
  gymId: string;
  gymName: string;
  planType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  amount: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'System Admin',
    email: 'admin@gymms.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'owner@gym.com',
    password: 'owner123',
    role: 'owner',
    gymId: 'gym1',
    phone: '+1234567890',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'user@email.com',
    password: 'user123',
    role: 'user',
    phone: '+1234567891',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    subscriptions: [
      {
        id: 'sub1',
        gymId: 'gym1',
        gymName: 'FitZone Downtown',
        planType: 'monthly',
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        amount: 59.99
      }
    ]
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('gymms_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userData } = foundUser;
      setUser(userData);
      localStorage.setItem('gymms_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };


  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      role: userData.role || 'user',
      phone: userData.phone,
      gymId: userData.gymId
    };
    
    setUser(newUser);
    localStorage.setItem('gymms_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gymms_user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('gymms_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      updateUser,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}