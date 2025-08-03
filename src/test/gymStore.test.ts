import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGymStore } from '../stores/gymStore';
import { gymService } from '../services/gymService';
import { slotService } from '../services/slotService';
import { useAuthStore } from '../stores/authStore';

// Mock the services
vi.mock('../services/gymService');
vi.mock('../services/slotService');
vi.mock('../stores/authStore');

const mockGymService = gymService as jest.Mocked<typeof gymService>;
const mockSlotService = slotService as jest.Mocked<typeof slotService>;
const mockUseAuthStore = useAuthStore as unknown as {
  getState: () => { getAccessToken: () => string | null };
};

describe('gymStore', () => {
  const mockToken = 'mock-token';
  const mockGym = {
    id: '1',
    name: 'Test Gym',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.0060,
    rating: 4.5,
    image: 'https://example.com/gym.jpg',
    description: 'A great gym for testing',
    amenities: ['Cardio', 'Weights'],
    operatingHours: {
      open: '06:00',
      close: '22:00'
    },
    plans: {
      daily: 15,
      weekly: 75,
      monthly: 200,
      yearly: 2000
    },
    ownerId: 'owner1',
    capacity: 100,
    currentOccupancy: 50
  };

  const mockTimeSlot = {
    id: 'slot1',
    gymId: '1',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    capacity: 20,
    booked: 5,
    type: 'general' as const,
    title: 'Morning Session',
    instructor: 'John Trainer',
    price: 25
  };

  const mockBooking = {
    id: 'booking1',
    userId: 'user1',
    gymId: '1',
    slotId: 'slot1',
    date: '2024-01-01',
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed' as const,
    type: 'general' as const,
    amount: 25,
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth store to return a token
    mockUseAuthStore.getState = vi.fn().mockReturnValue({
      getAccessToken: () => mockToken
    });

    // Reset store state
    useGymStore.setState({
      gyms: [],
      timeSlots: [],
      bookings: [],
      selectedGym: null,
      isLoading: false,
      error: null
    });
  });

  describe('fetchGyms', () => {
    it('should fetch gyms successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Gyms fetched successfully',
        data: [mockGym]
      };

      mockGymService.getGyms.mockResolvedValue(mockResponse);

      const { fetchGyms } = useGymStore.getState();
      const result = await fetchGyms();

      expect(result).toBe(true);
      expect(mockGymService.getGyms).toHaveBeenCalledWith(mockToken);

      const state = useGymStore.getState();
      expect(state.gyms).toEqual([mockGym]);
      expect(state.isLoading).toBe(false);
    });

    it('should handle fetch failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Failed to fetch gyms',
        error: 'Server error'
      };

      mockGymService.getGyms.mockResolvedValue(mockResponse);

      const { fetchGyms } = useGymStore.getState();
      const result = await fetchGyms();

      expect(result).toBe(false);

      const state = useGymStore.getState();
      expect(state.error).toBe('Failed to fetch gyms');
      expect(state.isLoading).toBe(false);
    });

    it('should handle missing token', async () => {
      mockUseAuthStore.getState = vi.fn().mockReturnValue({
        getAccessToken: () => null
      });

      const { fetchGyms } = useGymStore.getState();
      const result = await fetchGyms();

      expect(result).toBe(false);

      const state = useGymStore.getState();
      expect(state.error).toBe('No authentication token found');
    });
  });

  describe('fetchSlots', () => {
    it('should fetch slots successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Slots fetched successfully',
        data: [mockTimeSlot]
      };

      mockSlotService.getSlots.mockResolvedValue(mockResponse);

      const { fetchSlots } = useGymStore.getState();
      const result = await fetchSlots('1', '2024-01-01');

      expect(result).toBe(true);
      expect(mockSlotService.getSlots).toHaveBeenCalledWith('1', '2024-01-01', mockToken);

      const state = useGymStore.getState();
      expect(state.timeSlots).toEqual([mockTimeSlot]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('bookSlot', () => {
    it('should book slot successfully', async () => {
      // Set initial slot state
      useGymStore.setState({
        timeSlots: [mockTimeSlot]
      });

      const mockResponse = {
        success: true,
        message: 'Slot booked successfully',
        data: mockBooking
      };

      mockSlotService.bookSlot.mockResolvedValue(mockResponse);

      const { bookSlot } = useGymStore.getState();
      const result = await bookSlot('user1', 'slot1');

      expect(result).toBe(true);
      expect(mockSlotService.bookSlot).toHaveBeenCalledWith(
        { userId: 'user1', slotId: 'slot1' },
        mockToken
      );

      const state = useGymStore.getState();
      expect(state.bookings).toContain(mockBooking);
      expect(state.timeSlots[0].booked).toBe(6); // Increased by 1
    });

    it('should handle booking failure', async () => {
      const mockResponse = {
        success: false,
        message: 'Slot is fully booked',
        error: 'No capacity'
      };

      mockSlotService.bookSlot.mockResolvedValue(mockResponse);

      const { bookSlot } = useGymStore.getState();
      const result = await bookSlot('user1', 'slot1');

      expect(result).toBe(false);

      const state = useGymStore.getState();
      expect(state.error).toBe('Slot is fully booked');
    });
  });

  describe('utility functions', () => {
    beforeEach(() => {
      useGymStore.setState({
        gyms: [mockGym],
        timeSlots: [mockTimeSlot],
        bookings: [mockBooking]
      });
    });

    it('should get gym by id', () => {
      const { getGymById } = useGymStore.getState();
      const result = getGymById('1');

      expect(result).toEqual(mockGym);
    });

    it('should return undefined for non-existent gym', () => {
      const { getGymById } = useGymStore.getState();
      const result = getGymById('999');

      expect(result).toBeUndefined();
    });

    it('should get slots by gym and date', () => {
      const { getSlotsByGymAndDate } = useGymStore.getState();
      const result = getSlotsByGymAndDate('1', '2024-01-01');

      expect(result).toEqual([mockTimeSlot]);
    });

    it('should get user bookings', () => {
      const { getUserBookings } = useGymStore.getState();
      const result = getUserBookings('user1');

      expect(result).toEqual([mockBooking]);
    });

    it('should update gym occupancy', () => {
      const { updateGymOccupancy } = useGymStore.getState();
      updateGymOccupancy('1', 5);

      const state = useGymStore.getState();
      expect(state.gyms[0].currentOccupancy).toBe(55);
    });

    it('should not exceed capacity when updating occupancy', () => {
      const { updateGymOccupancy } = useGymStore.getState();
      updateGymOccupancy('1', 100); // Trying to add 100 to current 50

      const state = useGymStore.getState();
      expect(state.gyms[0].currentOccupancy).toBe(100); // Capped at capacity
    });

    it('should not go below zero when updating occupancy', () => {
      const { updateGymOccupancy } = useGymStore.getState();
      updateGymOccupancy('1', -100); // Trying to subtract 100 from current 50

      const state = useGymStore.getState();
      expect(state.gyms[0].currentOccupancy).toBe(0); // Floored at 0
    });
  });

  describe('setSelectedGym', () => {
    it('should set selected gym', () => {
      const { setSelectedGym } = useGymStore.getState();
      setSelectedGym(mockGym);

      const state = useGymStore.getState();
      expect(state.selectedGym).toEqual(mockGym);
    });

    it('should clear selected gym', () => {
      useGymStore.setState({ selectedGym: mockGym });

      const { setSelectedGym } = useGymStore.getState();
      setSelectedGym(null);

      const state = useGymStore.getState();
      expect(state.selectedGym).toBe(null);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useGymStore.setState({ error: 'Some error' });

      const { clearError } = useGymStore.getState();
      clearError();

      const state = useGymStore.getState();
      expect(state.error).toBe(null);
    });
  });
});
