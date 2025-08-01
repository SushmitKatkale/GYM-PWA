import { create } from 'zustand';

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
  capacity: number;
  currentOccupancy: number;
}

export interface TimeSlot {
  id: string;
  gymId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
  type: 'general' | 'class' | 'personal';
  title?: string;
  instructor?: string;
  price?: number;
}

export interface Booking {
  id: string;
  userId: string;
  gymId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  type: 'general' | 'class' | 'personal';
  amount: number;
  createdAt: string;
}

interface GymState {
  gyms: Gym[];
  timeSlots: TimeSlot[];
  bookings: Booking[];
  selectedGym: Gym | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSelectedGym: (gym: Gym | null) => void;
  getGymById: (id: string) => Gym | undefined;
  getSlotsByGymAndDate: (gymId: string, date: string) => TimeSlot[];
  bookSlot: (userId: string, slotId: string) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  getUserBookings: (userId: string) => Booking[];
  updateGymOccupancy: (gymId: string, change: number) => void;
  clearError: () => void;
}

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
    ownerId: '2',
    capacity: 100,
    currentOccupancy: 45
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
    ownerId: '2',
    capacity: 80,
    currentOccupancy: 32
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
    ownerId: '2',
    capacity: 60,
    currentOccupancy: 28
  }
];

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const today = new Date();
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];
    
    mockGyms.forEach(gym => {
      // General access slots
      for (let hour = 6; hour < 22; hour++) {
        slots.push({
          id: `${gym.id}-${dateStr}-${hour}`,
          gymId: gym.id,
          date: dateStr,
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          capacity: 20,
          booked: Math.floor(Math.random() * 15),
          type: 'general'
        });
      }
      
      // Class slots
      const classes = [
        { time: '07:00', title: 'Morning Yoga', instructor: 'Sarah M.' },
        { time: '09:00', title: 'HIIT Training', instructor: 'Mike J.' },
        { time: '18:00', title: 'Evening Pilates', instructor: 'Emma K.' },
        { time: '19:30', title: 'Spin Class', instructor: 'Tom R.' }
      ];
      
      classes.forEach(cls => {
        const [hour, minute] = cls.time.split(':').map(Number);
        const endHour = hour + 1;
        
        slots.push({
          id: `${gym.id}-${dateStr}-class-${cls.time}`,
          gymId: gym.id,
          date: dateStr,
          startTime: cls.time,
          endTime: `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          capacity: 15,
          booked: Math.floor(Math.random() * 12),
          type: 'class',
          title: cls.title,
          instructor: cls.instructor,
          price: 25
        });
      });
    });
  }
  
  return slots;
};

export const useGymStore = create<GymState>((set, get) => ({
  gyms: mockGyms,
  timeSlots: generateTimeSlots(),
  bookings: [],
  selectedGym: null,
  isLoading: false,
  error: null,

  setSelectedGym: (gym) => set({ selectedGym: gym }),

  getGymById: (id) => {
    return get().gyms.find(gym => gym.id === id);
  },

  getSlotsByGymAndDate: (gymId, date) => {
    return get().timeSlots.filter(slot => slot.gymId === gymId && slot.date === date);
  },

  bookSlot: async (userId, slotId) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const slot = get().timeSlots.find(s => s.id === slotId);
      if (!slot) {
        set({ error: 'Slot not found', isLoading: false });
        return false;
      }
      
      if (slot.booked >= slot.capacity) {
        set({ error: 'Slot is fully booked', isLoading: false });
        return false;
      }
      
      const booking: Booking = {
        id: Date.now().toString(),
        userId,
        gymId: slot.gymId,
        slotId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'confirmed',
        type: slot.type,
        amount: slot.price || 0,
        createdAt: new Date().toISOString()
      };
      
      set(state => ({
        bookings: [...state.bookings, booking],
        timeSlots: state.timeSlots.map(s => 
          s.id === slotId ? { ...s, booked: s.booked + 1 } : s
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Booking failed. Please try again.', isLoading: false });
      return false;
    }
  },

  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const booking = get().bookings.find(b => b.id === bookingId);
      if (!booking) {
        set({ error: 'Booking not found', isLoading: false });
        return false;
      }
      
      set(state => ({
        bookings: state.bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ),
        timeSlots: state.timeSlots.map(s => 
          s.id === booking.slotId ? { ...s, booked: Math.max(0, s.booked - 1) } : s
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Cancellation failed. Please try again.', isLoading: false });
      return false;
    }
  },

  getUserBookings: (userId) => {
    return get().bookings.filter(booking => booking.userId === userId);
  },

  updateGymOccupancy: (gymId, change) => {
    set(state => ({
      gyms: state.gyms.map(gym => 
        gym.id === gymId 
          ? { ...gym, currentOccupancy: Math.max(0, Math.min(gym.capacity, gym.currentOccupancy + change)) }
          : gym
      )
    }));
  },

  clearError: () => set({ error: null })
}));