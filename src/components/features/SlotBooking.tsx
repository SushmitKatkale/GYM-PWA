import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon, Clock, Users, MapPin, 
  Filter, Search, AlertCircle, CheckCircle, 
  X, Loader2, CalendarDays, Timer, 
  UserPlus, LogIn, LogOut, RotateCcw, 
  ArrowLeft, ChevronRight, SlidersHorizontal,
  Target
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from 'date-fns';
import { slotBookingService, GymSlot, SlotBooking, SlotAvailability } from '../../services/slotBookingService';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';

interface SlotBookingProps {
  onBack?: () => void;
}

export const SlotBooking: React.FC<SlotBookingProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { gyms } = useApp();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGym, setSelectedGym] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<GymSlot[]>([]);
  const [userBookings, setUserBookings] = useState<SlotBooking[]>([]);
  const [slotAvailability, setSlotAvailability] = useState<Map<string, SlotAvailability>>(new Map());
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'available' | 'limited'>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'bookings'>('calendar');

  // Initialize with first gym
  useEffect(() => {
    if (gyms.length > 0 && !selectedGym) {
      setSelectedGym(gyms[0].id);
    }
  }, [gyms, selectedGym]);

  // Load slots when gym or date changes
  useEffect(() => {
    if (selectedGym && selectedDate) {
      loadSlotsForDate();
    }
  }, [selectedGym, selectedDate]);

  // Load user bookings on component mount
  useEffect(() => {
    if (user) {
      loadUserBookings();
    }
  }, [user]);

  const loadSlotsForDate = async () => {
    if (!selectedGym) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const response = await slotBookingService.getSlotsByDateAndGym(selectedGym, dateStr);
      
      if (response.success && response.data) {
        setAvailableSlots(response.data);
        
        // Load availability for each slot
        const availabilityMap = new Map<string, SlotAvailability>();
        const availabilityPromises = response.data.map(async (slot) => {
          try {
            const availResponse = await slotBookingService.getSlotAvailability(slot.id, dateStr);
            if (availResponse.success && availResponse.data) {
              availabilityMap.set(slot.id, availResponse.data);
            }
          } catch (err) {
            console.error(`Failed to load availability for slot ${slot.id}:`, err);
          }
        });
        
        await Promise.all(availabilityPromises);
        setSlotAvailability(availabilityMap);
      } else {
        setError('Failed to load gym slots');
      }
    } catch (err) {
      setError('Failed to load gym slots. Please try again.');
      console.error('Error loading slots:', err);
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
        setUserBookings(response.data.data);
      }
    } catch (err) {
      console.error('Error loading user bookings:', err);
    }
  };

  const handleSlotBooking = async (slot: GymSlot) => {
    if (!user) return;
    
    setBookingLoading(slot.id);
    setError(null);
    
    try {
      const response = await slotBookingService.bookSlot({
        gymSlotId: slot.id,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        bookingType: 'regular'
      });
      
      if (response.success) {
        // Refresh data
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
        setError('Failed to cancel booking');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking. Please try again.');
    } finally {
      setBookingLoading(null);
    }
  };

  const handleCheckIn = async (booking: SlotBooking) => {
    setBookingLoading(booking.id);
    
    try {
      const response = await slotBookingService.checkInSlot(booking.id);
      if (response.success) {
        await loadUserBookings();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check in');
    } finally {
      setBookingLoading(null);
    }
  };

  const handleCheckOut = async (booking: SlotBooking) => {
    setBookingLoading(booking.id);
    
    try {
      const response = await slotBookingService.checkOutSlot(booking.id);
      if (response.success) {
        await loadUserBookings();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check out');
    } finally {
      setBookingLoading(null);
    }
  };

  // Filter slots based on selected filters
  const filteredSlots = useMemo(() => {
    let filtered = availableSlots;
    
    // Time filter
    if (selectedTimeFilter !== 'all') {
      filtered = filtered.filter(slot => {
        const hour = parseInt(slot.startTime.split(':')[0]);
        switch (selectedTimeFilter) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 && hour < 24;
          default: return true;
        }
      });
    }
    
    // Capacity filter
    if (capacityFilter !== 'all') {
      filtered = filtered.filter(slot => {
        const availability = slotAvailability.get(slot.id);
        if (!availability) return true;
        
        const availableSpots = availability.availableCapacity;
        const totalCapacity = slot.capacity;
        
        switch (capacityFilter) {
          case 'available': return availableSpots > totalCapacity * 0.5;
          case 'limited': return availableSpots > 0 && availableSpots <= totalCapacity * 0.5;
          default: return true;
        }
      });
    }
    
    return filtered;
  }, [availableSlots, slotAvailability, selectedTimeFilter, capacityFilter]);

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
    <div className="font-poppins space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Book Gym Slots</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'calendar' ? 'bookings' : 'calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar' 
                ? 'bg-purple-600 text-white' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {viewMode === 'calendar' ? 'View Bookings' : 'Book Slots'}
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto hover:bg-red-100 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Gym Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Gym</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gyms.map((gym) => (
            <button
              key={gym.id}
              onClick={() => setSelectedGym(gym.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left hover:scale-[1.01] ${
                selectedGym === gym.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
              }`}
            >
              <h4 className="font-medium text-gray-900">{gym.name}</h4>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{gym.address}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">
                  Capacity: {gym.capacity}
                </span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  selectedGym === gym.id 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedGym === gym.id ? 'Selected' : 'Select'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={selectedTimeFilter}
                onChange={(e) => setSelectedTimeFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Times</option>
                <option value="morning">Morning (6 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
                <option value="evening">Evening (6 PM - 12 AM)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Slots</option>
                <option value="available">Good Availability (&gt;50%)</option>
                <option value="limited">Limited Spots (&lt;50%)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">
                  {format(selectedDate, 'EEEE, MMM dd, yyyy')}
                </span>
                <button
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-sm">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = addDays(startOfWeek(selectedDate), i);
                  const isSelected = isSameDay(date, selectedDate);
                  const isToday = isSameDay(date, new Date());
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      className={`p-2 rounded-lg text-center transition-colors ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : isToday
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {format(date, 'EEE')}
                      </div>
                      <div className="font-semibold">
                        {format(date, 'd')}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="flex-1 px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setSelectedDate(addDays(new Date(), 1))}
                  className="flex-1 px-3 py-2 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                >
                  Tomorrow
                </button>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Slots - {format(selectedDate, 'MMM dd')}
              </h3>
              <span className="text-sm text-gray-500">
                {filteredSlots.length} slot{filteredSlots.length !== 1 ? 's' : ''} available
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : filteredSlots.length > 0 ? (
              <div className="space-y-3">
                {filteredSlots.map((slot) => {
                  const availability = getSlotAvailabilityInfo(slot);
                  const booking = isSlotBooked(slot.id);
                  const isFullyBooked = availability.availableCapacity === 0;
                  
                  return (
                    <div
                      key={slot.id}
                      className={`p-4 border-2 rounded-lg transition-all hover:scale-[1.01] ${
                        booking
                          ? 'border-green-200 bg-green-50'
                          : isFullyBooked
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {slotBookingService.formatTimeSlot(slot.startTime, slot.endTime)}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {availability.availableCapacity} / {slot.capacity} available
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
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
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {booking ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-green-700">Booked</span>
                              <button
                                onClick={() => handleCancelBooking(booking)}
                                disabled={bookingLoading === booking.id}
                                className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {bookingLoading === booking.id ? 'Canceling...' : 'Cancel'}
                              </button>
                            </>
                          ) : isFullyBooked ? (
                            <>
                              <AlertCircle className="w-5 h-5 text-red-500" />
                              <span className="text-sm text-red-600">Full</span>
                              <button
                                onClick={() => handleSlotBooking(slot)}
                                disabled={bookingLoading === slot.id}
                                className="px-3 py-1.5 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {bookingLoading === slot.id ? 'Joining...' : 'Join Waitlist'}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSlotBooking(slot)}
                              disabled={bookingLoading === slot.id}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center space-x-2 hover:scale-105"
                            >
                              {bookingLoading === slot.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <UserPlus className="w-4 h-4" />
                              )}
                              <span>
                                {bookingLoading === slot.id ? 'Booking...' : 'Book Now'}
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
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No slots available for this date</p>
                {selectedGymData && (
                  <p className="text-sm text-gray-400 mt-1">
                    Try selecting a different date or gym
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Bookings View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Bookings ({format(new Date(), 'MMM dd')})
            </h3>
            
            {todaysBookings.length > 0 ? (
              <div className="space-y-3">
                {todaysBookings.map((booking) => {
                  const slot = booking.gymSlot;
                  if (!slot) return null;
                  
                  const hasCheckedIn = !!booking.checkinTime;
                  const hasCheckedOut = !!booking.checkoutTime;
                  
                  return (
                    <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {slotBookingService.formatTimeSlot(slot.startTime, slot.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{slot.gym?.name}</span>
                          </div>
                          {hasCheckedIn && (
                            <div className="flex items-center space-x-2 mt-1">
                              <LogIn className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600">
                                Checked in at {format(new Date(booking.checkinTime!), 'HH:mm')}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {hasCheckedOut ? (
                            <span className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg">
                              Completed
                            </span>
                          ) : hasCheckedIn ? (
                            <button
                              onClick={() => handleCheckOut(booking)}
                              disabled={bookingLoading === booking.id}
                              className="px-3 py-1.5 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Check Out</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleCheckIn(booking)}
                              disabled={bookingLoading === booking.id}
                              className="px-3 py-1.5 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-1"
                            >
                              <LogIn className="w-4 h-4" />
                              <span>Check In</span>
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
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings for today</p>
                <p className="text-sm text-gray-400">Book a slot to start your workout!</p>
              </div>
            )}
          </div>

          {/* All Upcoming Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bookings</h3>
            
            {userBookings.filter(b => new Date(b.bookingDate) > new Date() && b.bookingStatus === 1).length > 0 ? (
              <div className="space-y-3">
                {userBookings
                  .filter(booking => new Date(booking.bookingDate) > new Date() && booking.bookingStatus === 1)
                  .slice(0, 10)
                  .map((booking) => {
                    const slot = booking.gymSlot;
                    if (!slot) return null;
                    
                    return (
                      <div key={booking.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {slotBookingService.formatTimeSlot(slot.startTime, slot.endTime)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{slot.gym?.name}</span>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            disabled={bookingLoading === booking.id}
                            className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {bookingLoading === booking.id ? 'Canceling...' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Timer className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming bookings</p>
                <p className="text-sm text-gray-400">Book slots for future workouts</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
