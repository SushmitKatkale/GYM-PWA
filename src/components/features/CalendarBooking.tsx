import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, MapPin, CreditCard } from 'lucide-react';
import { Calendar } from '../common/Calendar';
import { useGymStore, TimeSlot } from '../../stores/gymStore';
import { useAuthStore } from '../../stores/authStore';

export function CalendarBooking() {
  const { gyms, timeSlots, bookSlot, getUserBookings, isLoading, error } = useGymStore();
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGym, setSelectedGym] = useState(gyms[0]?.id || '');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const userBookings = user ? getUserBookings(user.id) : [];
  const gymTimeSlots = timeSlots.filter(slot => slot.gymId === selectedGym);
  const selectedGymData = gyms.find(gym => gym.id === selectedGym);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBooking = async () => {
    if (!user || !selectedSlot) return;
    
    const success = await bookSlot(user.id, selectedSlot.id);
    if (success) {
      setShowBookingModal(false);
      setSelectedSlot(null);
    }
  };

  const getBookingStatus = (slot: TimeSlot) => {
    const booking = userBookings.find(b => b.slotId === slot.id && b.status === 'confirmed');
    return booking ? 'booked' : 'available';
  };

  return (
    <div className="space-y-6">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
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
              className={`p-4 rounded-lg border-2 transition-colors text-left ${
                selectedGym === gym.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={gym.image}
                alt={gym.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="font-medium text-gray-900">{gym.name}</h4>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{gym.address}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-600">
                  {gym.currentOccupancy}/{gym.capacity} occupied
                </span>
                <span className="text-sm font-medium text-green-600">
                  ${gym?.plans?.monthly}/month
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar and Time Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          timeSlots={gymTimeSlots}
          onSlotSelect={handleSlotSelect}
          selectedSlot={selectedSlot}
          showTimeSlots={true}
        />

        {/* Booking Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
          
          {selectedSlot ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {selectedSlot.title || 'General Access'}
                  </h4>
                  <span className="text-sm text-blue-600 font-medium">
                    {getBookingStatus(selectedSlot) === 'booked' ? 'Already Booked' : 'Available'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    <span>{selectedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{selectedSlot.startTime} - {selectedSlot.endTime}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{selectedGymData?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{selectedSlot.capacity - selectedSlot.booked} spots available</span>
                  </div>
                  {selectedSlot.instructor && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Instructor: {selectedSlot.instructor}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedSlot.price && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">Total Cost</span>
                  <span className="text-xl font-bold text-green-600">${selectedSlot.price}</span>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={isLoading || getBookingStatus(selectedSlot) === 'booked' || selectedSlot.booked >= selectedSlot.capacity}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>
                  {isLoading ? 'Booking...' : 
                   getBookingStatus(selectedSlot) === 'booked' ? 'Already Booked' :
                   selectedSlot.booked >= selectedSlot.capacity ? 'Fully Booked' :
                   'Book Now'}
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Select a time slot to book</p>
            </div>
          )}
        </div>
      </div>

      {/* My Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Upcoming Bookings</h3>
        {userBookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date()).length > 0 ? (
          <div className="space-y-3">
            {userBookings
              .filter(b => b.status === 'confirmed' && new Date(b.date) >= new Date())
              .slice(0, 5)
              .map((booking) => {
                const gym = gyms.find(g => g.id === booking.gymId);
                return (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.type === 'class' ? 'Class Session' : 
                           booking.type === 'personal' ? 'Personal Training' : 'General Access'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {gym?.name} • {new Date(booking.date).toLocaleDateString()} • {booking.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-green-600">Confirmed</span>
                      {booking.amount > 0 && (
                        <p className="text-xs text-gray-500">${booking.amount}</p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming bookings</p>
            <p className="text-sm text-gray-400">Book a session to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}