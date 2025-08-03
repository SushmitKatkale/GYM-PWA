import { create } from 'zustand';
import { gymService, Gym as ApiGym } from '../services/gymService';
import { slotService, TimeSlot as ApiTimeSlot, Booking as ApiBooking } from '../services/slotService';
import { useAuthStore } from './authStore';

// Use types from services
export type Gym = ApiGym;
export type TimeSlot = ApiTimeSlot;
export type Booking = ApiBooking;

interface GymState {
  gyms: Gym[];
  timeSlots: TimeSlot[];
  bookings: Booking[];
  selectedGym: Gym | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchGyms: () => Promise<boolean>;
  fetchSlots: (gymId?: string, date?: string) => Promise<boolean>;
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
    image: '/images/gyms/gym-1.svg',
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
    image: '/images/gyms/gym-2.svg',
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
    image: '/images/gyms/gym-3.svg',
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
  gyms: [],
  timeSlots: [],
  bookings: [],
  selectedGym: null,
  isLoading: false,
  error: null,

  fetchGyms: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await gymService.getGyms(token);
      
      if (response.success && response.data) {
        set({
          gyms: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.message || 'Failed to fetch gyms',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Fetch gyms error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

  fetchSlots: async (gymId?: string, date?: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const token = useAuthStore.getState().getAccessToken();
      
      const response = await slotService.getSlots(gymId, date, token);
      
      if (response.success && response.data) {
        set({
          timeSlots: response.data,
          isLoading: false
        });
        return true;
      } else {
        set({
          error: response.message || 'Failed to fetch slots',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Fetch slots error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
      return false;
    }
  },

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
      const token = useAuthStore.getState().getAccessToken();
      if (!token) {
        set({ error: 'No authentication token found', isLoading: false });
        return false;
      }

      const response = await slotService.bookSlot({ userId, slotId }, token);
      
      if (response.success && response.data) {
        set(state => ({
          bookings: [...state.bookings, response.data!],
          timeSlots: state.timeSlots.map(s => 
            s.id === slotId ? { ...s, booked: s.booked + 1 } : s
          ),
          isLoading: false
        }));
        return true;
      } else {
        set({
          error: response.message || 'Booking failed',
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      console.error('Book slot error:', error);
      set({
        error: 'Network error occurred. Please check your connection and try again.',
        isLoading: false
      });
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