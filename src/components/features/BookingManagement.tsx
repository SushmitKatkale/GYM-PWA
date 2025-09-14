import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, Clock, Users, MapPin,
  CheckCircle, AlertCircle, Loader2, UserPlus
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { slotBookingService, GymSlot, SlotBooking, SlotAvailability } from '../../services/slotBookingService';
import { subscriptionService, Subscription } from '../../services/subscriptionService';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';

interface BookingManagementProps {
  selectedGymId?: string;
  showGymSelection?: boolean;
}

export const BookingManagement: React.FC<BookingManagementProps> = ({ 
  selectedGymId,
  showGymSelection = true 
}) => {
  const { user } = useAuthStore();
  const { gyms } = useApp();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGym, setSelectedGym] = useState<string>(selectedGymId || '');
  const [availableSlots, setAvailableSlots] = useState<GymSlot[]>([]);
  const [userBookings, setUserBookings] = useState<SlotBooking[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Map<string, SlotAvailability>>(new Map());
  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([]);
  const [subscribedGyms, setSubscribedGyms] = useState<typeof gyms>([]);
  
  const [loading, setLoading] = useState(false);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize with first gym or provided gym
  useEffect(() => {
    if (selectedGymId) {
      setSelectedGym(selectedGymId);
    } else if (gyms.length > 0 && !selectedGym) {
      setSelectedGym(gyms[0].id);
    }
  }, [gyms, selectedGym, selectedGymId]);

  // Load data when dependencies change
  useEffect(() => {
    if (selectedGym && selectedDate) {
      loadSlotsForDate();
    }
  }, [selectedGym, selectedDate]);

  useEffect(() => {
    if (user) {
      loadUserBookings();
      loadUserSubscriptions();
    }
  }, [user]);

  // Filter gyms based on user subscriptions
  useEffect(() => {
    if (userSubscriptions.length > 0 && gyms.length > 0) {
      const subscribedGymIds = userSubscriptions
        .filter(sub => sub.recordStatus == 1 && new Date(sub?.endDate) > new Date())
        .map(sub => sub?.subscription?.gym);
      
      let filtered = subscribedGymIds;
      setSubscribedGyms(subscribedGymIds);
      
      // Update selected gym if current selection is not in subscribed gyms
      if (filtered.length > 0 && !subscribedGymIds.includes(selectedGym)) {
        setSelectedGym(filtered[0].id);
      }
    } else if (!subscriptionsLoading) {
      // If no subscriptions but loading is complete, show empty array
      setSubscribedGyms([]);
    }
  }, [userSubscriptions, gyms, selectedGym, subscriptionsLoading]);

const loadSlotsForDate = async () => {
  if (!selectedGym) return;

  setLoading(true);
  setError(null);

  try {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const response = await slotBookingService.getSlotsByDateAndGym(selectedGym, dateStr);

    if (response.success && response.data) {
      setAvailableSlots(response.data);

      const availabilityMap = new Map<string, SlotAvailability>();
      const availabilityPromises = response.data.map(async (slot) => {
        try {
          const availResponse = await slotBookingService.getSlotAvailability(slot.id, dateStr);
          if (availResponse.success && availResponse.data) {
            availabilityMap.set(slot.id, availResponse.data);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(`Failed to load availability for slot ${slot.id}:`, err.message);
            if (err.message.includes('alias') || err.message.includes('as keyword')) {
              console.error('Sequelize alias error in getSlotAvailability:', err.message);
            }
          }
        }
      });

      await Promise.all(availabilityPromises);
      setSlotAvailability(availabilityMap);
    } else {
      setError('Failed to load gym slots');
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error loading slots:', err.message);
      if (err.message.includes('alias') || err.message.includes('as keyword')) {
        setError('There is a backend configuration issue with slot data associations. Please contact support.');
      } else {
        setError('Failed to load gym slots. Please try again.');
      }
    }
  } finally {
    setLoading(false);
  }
};

  const loadUserBookings = async () => {
    try {
      const response = await slotBookingService.getUserBookings({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        limit: 50
      });
      
      if (response.success && response.data) {
        setUserBookings(response.data);
      }
    } catch (err: any) {
      console.error('Error loading user bookings:', err);
      
      // Check if this is the specific Sequelize alias error
      if (err.message?.includes('alias') || err.message?.includes('as keyword')) {
        console.error('Sequelize alias error in getUserBookings:', err.message);
        // Don't set error state here as bookings are not critical for the main functionality
      }
    }
  };

  const loadUserSubscriptions = async () => {
    if (!user?.id) return;
    
    try {
      setSubscriptionsLoading(true);
      const subscriptions = await subscriptionService.getUserSubscriptions(user.id);
      if (subscriptions.success && subscriptions.data) {
        setUserSubscriptions(subscriptions?.data?.subscriptions);
      }
    } catch (err) {
      console.error('Error loading user subscriptions:', err);
      setError('Failed to load gym subscriptions');
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const handleSlotBooking = async (slot: GymSlot) => {
    if (!user) return;
    
    // Check if user has active subscription to the slot's gym
    const hasActiveSubscription = userSubscriptions.some(
      sub => sub.record_status == 1 && sub?.subscription?.gym?.id === slot.gymId
    );
    
    if (!hasActiveSubscription) {
      setError('You need an active subscription to this gym to book slots.');
      return;
    }
    
    setBookingLoading(slot.id);
    setError(null);
    
    try {
      const response = await slotBookingService.bookSlot({
        gymSlotId: slot.id,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        bookingType: 'regular'
      });
      
      if (response.success) {
        await Promise.all([loadSlotsForDate(), loadUserBookings()]);
        setError(null);
      } else {
        setError(response.message || 'Failed to book slot');
      }
    } catch (err: any) {
      if (err.message?.includes('waitlist')) {
        setError('Slot is full. You have been added to the waitlist.');
      } else {
        setError(err.message || 'Failed to book slot. Please try again.');
      }
    } finally {
      setBookingLoading(null);
    }
  };

  const handleCancelBooking = async (booking: SlotBooking) => {
    setBookingLoading(booking.id);
    setError(null);
    
    try {
      const response = await slotBookingService.cancelBooking(booking.id);
      
      if (response.success) {
        await Promise.all([loadSlotsForDate(), loadUserBookings()]);
      } else {
        setError(response?.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setBookingLoading(null);
    }
  };

  // Check if user has booked a specific slot
  const isSlotBooked = (slotId: string): SlotBooking | undefined => {
    return userBookings.find(booking => 
      booking.slotId === slotId && 
      booking.bookingStatus === 1 &&
      booking.bookingDate === format(selectedDate, 'yyyy-MM-dd')
    );
  };

  // Get availability info for a slot
  const getSlotAvailabilityInfo = (slot: GymSlot) => {
    const availability = slotAvailability.get(slot.id);
    return availability || {
      availableCapacity: slot.capacity,
      bookedCount: 0,
      gymSlotId: slot.id,
      availabilityDate: format(selectedDate, 'yyyy-MM-dd'),
      gymSlot: slot
    };
  };

  const selectedGymData = gyms.find(gym => gym.id === selectedGym);
  const todaysBookings = userBookings.filter(booking => 
    booking.bookingDate === format(new Date(), 'yyyy-MM-dd') && 
    booking.bookingStatus === 1
  );

  return (
    <div className="space-y-6 px-4 py-4 font-poppins">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-gray-900">Gym Slot Booking</h2>
        {todaysBookings.length > 0 && (
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {todaysBookings.length} booking{todaysBookings.length > 1 ? 's' : ''} today
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
          {error}
        </div>
      )}

      {/* Gym Selection */}
      {showGymSelection && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">
            Select Gym {subscriptionsLoading && '(Loading...)'}
          </h3>
          
          {subscriptionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading your gym subscriptions...</span>
            </div>
          ) : subscribedGyms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                No active gym subscriptions found
              </div>
              <div className="text-sm text-gray-400">
                You need an active subscription to book slots
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subscribedGyms.map((gym) => (
                <button
                  key={gym.id}
                  onClick={() => setSelectedGym(gym.id)}
                  className={`p-3 rounded-sm border-2 transition-colors text-left ${
                    selectedGym === gym.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{gym.name}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{gym.address}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1 font-medium">
                    ✓ Active Subscription
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date Selection */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Select Date</h3>
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(new Date(), i);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = i === 0;
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex-shrink-0 p-3 rounded-sm text-center transition-colors min-w-[80px] ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="text-xs font-medium">
                  {format(date, 'EEE')}
                </div>
                <div className="font-medium">
                  {format(date, 'd')}
                </div>
                <div className="text-xs">
                  {format(date, 'MMM')}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Available Slots */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">
            Available Slots - {format(selectedDate, 'MMM dd')}
          </h3>
          <span className="text-sm text-gray-500">
            {selectedGymData?.name}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : availableSlots.length > 0 ? (
          <div className="space-y-3">
            {availableSlots.map((slot) => {
              const availability = getSlotAvailabilityInfo(slot);
              const booking = isSlotBooked(slot.id);
              const isFullyBooked = availability.availableCapacity === 0;
              
              return (
                <div
                  key={slot.id}
                  className={`p-4 border-2 rounded-sm transition-all ${
                    booking
                      ? 'border-green-200 bg-green-50'
                      : isFullyBooked
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col items-start gap-y-1">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {slotBookingService.formatTimeSlot(slot?.start_time, slot?.end_time)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {availability?.dataValues?.availableCapacity ?? slot?.capacity} / {slot?.capacity} available
                          </span>
                        </div>
                      </div>
                      
                      {/* Capacity Bar */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              availability.availableCapacity === 0
                                ? 'bg-red-500'
                                : availability.availableCapacity <= slot.capacity * 0.3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${(availability.availableCapacity / slot.capacity) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="ml-4">
                      {booking ? (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            disabled={bookingLoading === booking.id}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-[0.5rem] transition-colors disabled:opacity-50"
                          >
                            {bookingLoading === booking.id ? 'Canceling...' : 'Cancel'}
                          </button>
                        </div>
                      ) : isFullyBooked ? (
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <button
                            onClick={() => handleSlotBooking(slot)}
                            disabled={bookingLoading === slot.id}
                            className="px-3 py-1.5 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-[0.5rem] transition-colors disabled:opacity-50"
                          >
                            {bookingLoading === slot.id ? 'Joining...' : 'Join Waitlist'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSlotBooking(slot)}
                          disabled={bookingLoading === slot.id}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-[0.5rem] transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          {bookingLoading === slot.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                          <span>
                            {bookingLoading === slot.id ? 'Booking...' : 'Book'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No slots available for this date</p>
            <p className="text-sm text-gray-400 mt-1">
              Try selecting a different date
            </p>
          </div>
        )}
      </div>

      {/* Today's Bookings Quick View */}
      {todaysBookings.length > 0 && (
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Today's Bookings</h3>
          <div className="space-y-2">
            {todaysBookings.map((booking) => {
              const slot = booking?.slot;
              if (!slot) return null;
              
              return (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-green-50 rounded-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <span className="font-medium text-gray-900">
                        {slotBookingService.formatTimeSlot(slot?.start_time, slot?.end_time)}
                      </span>
                      <p className="text-sm text-gray-600">{slot.gym?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {booking.checkinTime ? (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                        Checked In
                      </span>
                    ) : (
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Booked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
