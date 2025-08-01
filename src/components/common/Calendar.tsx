import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Users, User } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { TimeSlot } from '../../stores/gymStore';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  timeSlots?: TimeSlot[];
  onSlotSelect?: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot | null;
  showTimeSlots?: boolean;
}

export function Calendar({ 
  selectedDate, 
  onDateSelect, 
  timeSlots = [], 
  onSlotSelect,
  selectedSlot,
  showTimeSlots = false 
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectedDateSlots = timeSlots.filter(slot => 
    slot.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const getSlotsByType = (type: string) => {
    return selectedDateSlots.filter(slot => slot.type === type);
  };

  const getSlotAvailability = (slot: TimeSlot) => {
    const available = slot.capacity - slot.booked;
    const percentage = (available / slot.capacity) * 100;
    
    if (percentage > 50) return 'text-green-600 bg-green-50';
    if (percentage > 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const hasSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeSlots.some(slot => slot.date === dateStr);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const hasSlotsAvailable = hasSlots(day);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={`
                  relative p-2 text-sm rounded-lg transition-colors
                  ${isSelected 
                    ? 'bg-blue-600 text-white' 
                    : isCurrentMonth 
                      ? 'text-gray-900 hover:bg-gray-100' 
                      : 'text-gray-400'
                  }
                `}
              >
                {format(day, 'd')}
                {hasSlotsAvailable && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {showTimeSlots && selectedDateSlots.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">
            Available Slots - {format(selectedDate, 'MMM d, yyyy')}
          </h3>
          
          <div className="space-y-4">
            {/* General Access */}
            {getSlotsByType('general').length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  General Access
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {getSlotsByType('general').slice(0, 6).map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect?.(slot)}
                      className={`
                        p-2 text-xs rounded-lg border transition-colors
                        ${selectedSlot?.id === slot.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                        ${getSlotAvailability(slot)}
                      `}
                    >
                      <div className="font-medium">{slot.startTime}</div>
                      <div className="text-xs opacity-75">
                        {slot.capacity - slot.booked} spots
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Classes */}
            {getSlotsByType('class').length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  Classes
                </h4>
                <div className="space-y-2">
                  {getSlotsByType('class').map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect?.(slot)}
                      className={`
                        w-full p-3 text-left rounded-lg border transition-colors
                        ${selectedSlot?.id === slot.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{slot.title}</div>
                          <div className="text-sm text-gray-500">
                            {slot.startTime} - {slot.endTime} • {slot.instructor}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getSlotAvailability(slot)}`}>
                            {slot.capacity - slot.booked}/{slot.capacity}
                          </div>
                          {slot.price && (
                            <div className="text-xs text-gray-500">${slot.price}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Training */}
            {getSlotsByType('personal').length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Personal Training
                </h4>
                <div className="space-y-2">
                  {getSlotsByType('personal').map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotSelect?.(slot)}
                      className={`
                        w-full p-3 text-left rounded-lg border transition-colors
                        ${selectedSlot?.id === slot.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Personal Session</div>
                          <div className="text-sm text-gray-500">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${getSlotAvailability(slot)}`}>
                            Available
                          </div>
                          {slot.price && (
                            <div className="text-xs text-gray-500">${slot.price}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}