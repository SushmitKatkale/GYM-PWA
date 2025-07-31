import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Gym {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: string;
  description: string;
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  plans: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  ownerId: string;
}

export interface Attendance {
  id: string;
  userId: string;
  gymId: string;
  checkIn: string;
  checkOut?: string;
  date: string;
  duration?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId?: string;
  role?: string;
}

interface AppContextType {
  gyms: Gym[];
  attendance: Attendance[];
  notifications: Notification[];
  currentLocation: { lat: number; lng: number } | null;
  addAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  updateAttendance: (id: string, updates: Partial<Attendance>) => void;
  markNotificationRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  getCurrentLocation: () => Promise<void>;
  isLoadingLocation: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockGyms: Gym[] = [
  {
    id: 'gym1',
    name: 'FitZone Downtown',
    address: '123 Main St, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
    rating: 4.5,
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Premium fitness center with state-of-the-art equipment',
    amenities: ['Cardio Equipment', 'Weight Training', 'Group Classes', 'Personal Training', 'Sauna'],
    operatingHours: { open: '05:00', close: '23:00' },
    plans: { daily: 15, weekly: 75, monthly: 59.99, yearly: 599 },
    ownerId: '2'
  },
  {
    id: 'gym2',
    name: 'PowerHouse Gym',
    address: '456 Oak Ave, Midtown',
    latitude: 40.7580,
    longitude: -73.9855,
    rating: 4.2,
    image: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Hardcore training facility for serious athletes',
    amenities: ['Heavy Weights', 'CrossFit Box', 'Boxing Ring', 'Functional Training'],
    operatingHours: { open: '06:00', close: '22:00' },
    plans: { daily: 20, weekly: 85, monthly: 69.99, yearly: 699 },
    ownerId: '2'
  },
  {
    id: 'gym3',
    name: 'Zen Fitness Studio',
    address: '789 Pine St, Uptown',
    latitude: 40.7831,
    longitude: -73.9712,
    rating: 4.8,
    image: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: 'Holistic approach to fitness and wellness',
    amenities: ['Yoga Classes', 'Pilates', 'Meditation Room', 'Spa Services', 'Nutrition Coaching'],
    operatingHours: { open: '07:00', close: '21:00' },
    plans: { daily: 18, weekly: 80, monthly: 64.99, yearly: 649 },
    ownerId: '2'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Gym MS!',
    message: 'Your account has been successfully created. Start exploring gyms near you!',
    type: 'success',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Subscription Reminder',
    message: 'Your monthly subscription at FitZone Downtown expires in 3 days.',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [gyms] = useState<Gym[]>(mockGyms);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const addAttendance = (attendanceData: Omit<Attendance, 'id'>) => {
    const newAttendance: Attendance = {
      ...attendanceData,
      id: Date.now().toString()
    };
    setAttendance(prev => [...prev, newAttendance]);
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendance(prev => 
      prev.map(att => att.id === id ? { ...att, ...updates } : att)
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to NYC coordinates
      setCurrentLocation({
        lat: 40.7128,
        lng: -74.0060
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <AppContext.Provider value={{
      gyms,
      attendance,
      notifications,
      currentLocation,
      addAttendance,
      updateAttendance,
      markNotificationRead,
      addNotification,
      getCurrentLocation,
      isLoadingLocation
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}