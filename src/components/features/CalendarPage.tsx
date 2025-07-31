import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Clock, MapPin, Users, Plus, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'class' | 'personal' | 'maintenance';
    instructor?: string;
    gym?: string;
    capacity?: number;
    enrolled?: number;
    description?: string;
  };
}

export function CalendarPage() {
  const { user } = useAuth();
  const { gyms } = useApp();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'classes' | 'personal'>('all');

  const events: CalendarEvent[] = useMemo(() => [
    {
      id: '1',
      title: 'Morning Yoga',
      start: new Date(2024, 1, 15, 7, 0),
      end: new Date(2024, 1, 15, 8, 0),
      resource: {
        type: 'class',
        instructor: 'Sarah Johnson',
        gym: 'FitZone Downtown',
        capacity: 20,
        enrolled: 15,
        description: 'Start your day with relaxing yoga session'
      }
    },
    {
      id: '2',
      title: 'HIIT Training',
      start: new Date(2024, 1, 15, 18, 0),
      end: new Date(2024, 1, 15, 19, 0),
      resource: {
        type: 'class',
        instructor: 'Mike Wilson',
        gym: 'PowerHouse Gym',
        capacity: 15,
        enrolled: 12,
        description: 'High-intensity interval training for maximum results'
      }
    },
    {
      id: '3',
      title: 'Personal Training',
      start: new Date(2024, 1, 16, 10, 0),
      end: new Date(2024, 1, 16, 11, 0),
      resource: {
        type: 'personal',
        instructor: 'Alex Thompson',
        gym: 'FitZone Downtown',
        description: 'One-on-one strength training session'
      }
    },
    {
      id: '4',
      title: 'Zumba Dance',
      start: new Date(2024, 1, 17, 19, 0),
      end: new Date(2024, 1, 17, 20, 0),
      resource: {
        type: 'class',
        instructor: 'Maria Garcia',
        gym: 'FitZone Downtown',
        capacity: 25,
        enrolled: 20,
        description: 'Fun dance workout for all fitness levels'
      }
    },
    {
      id: '5',
      title: 'Equipment Maintenance',
      start: new Date(2024, 1, 18, 9, 0),
      end: new Date(2024, 1, 18, 11, 0),
      resource: {
        type: 'maintenance',
        gym: 'PowerHouse Gym',
        description: 'Scheduled equipment maintenance'
      }
    }
  ], []);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    if (filterType === 'classes') return events.filter(e => e.resource.type === 'class');
    if (filterType === 'personal') return events.filter(e => e.resource.type === 'personal');
    return events;
  }, [events, filterType]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource.type) {
      case 'class':
        backgroundColor = '#10b981';
        break;
      case 'personal':
        backgroundColor = '#f59e0b';
        break;
      case 'maintenance':
        backgroundColor = '#ef4444';
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleBookClass = (eventId: string) => {
    console.log('Booking class:', eventId);
    setSelectedEvent(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600">Manage your classes and training sessions</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter Buttons */}
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterType === 'all' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('classes')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterType === 'classes' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                }`}
              >
                Classes
              </button>
              <button
                onClick={() => setFilterType('personal')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filterType === 'personal' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
                }`}
              >
                Personal
              </button>
            </div>

            <button
              onClick={() => setShowBookingModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Book Class
            </button>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          popup
          views={['month', 'week', 'day', 'agenda']}
          step={60}
          showMultiDayTimes
          components={{
            toolbar: (props) => (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => props.onNavigate('PREV')}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => props.onNavigate('TODAY')}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => props.onNavigate('NEXT')}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    →
                  </button>
                  <h2 className="text-lg font-semibold ml-4">{props.label}</h2>
                </div>
                
                <div className="flex gap-1">
                  {['month', 'week', 'day', 'agenda'].map((viewName) => (
                    <button
                      key={viewName}
                      onClick={() => props.onView(viewName as View)}
                      className={`px-3 py-1 rounded-md text-sm capitalize ${
                        props.view === viewName
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {viewName}
                    </button>
                  ))}
                </div>
              </div>
            )
          }}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {moment(selectedEvent.start).format('MMM DD, YYYY h:mm A')} - 
                  {moment(selectedEvent.end).format('h:mm A')}
                </span>
              </div>
              
              {selectedEvent.resource.gym && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.resource.gym}</span>
                </div>
              )}
              
              {selectedEvent.resource.instructor && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Instructor: {selectedEvent.resource.instructor}</span>
                </div>
              )}
              
              {selectedEvent.resource.capacity && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>
                    {selectedEvent.resource.enrolled}/{selectedEvent.resource.capacity} enrolled
                  </span>
                </div>
              )}
              
              {selectedEvent.resource.description && (
                <p className="text-gray-600 mt-3">{selectedEvent.resource.description}</p>
              )}
            </div>
            
            {selectedEvent.resource.type === 'class' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleBookClass(selectedEvent.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Book Class
                </button>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Class Modal Placeholder */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Book a Class</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">
              Browse available classes and book your spot.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Browse Classes
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Group Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-sm text-gray-600">Personal Training</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Maintenance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
