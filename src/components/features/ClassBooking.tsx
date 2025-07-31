import React, { useState, useMemo } from 'react';
import { Clock, MapPin, Users, Star, Calendar, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

interface GymClass {
  id: string;
  name: string;
  instructor: string;
  gym: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  amenities: string[];
  rating: number;
}

export function ClassBooking() {
  const { user } = useAuth();
  const { gyms } = useApp();
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [filterGym, setFilterGym] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [showBookingModal, setShowBookingModal] = useState(false);

  const classes: GymClass[] = useMemo(() => [
    {
      id: '1',
      name: 'Morning Yoga Flow',
      instructor: 'Sarah Johnson',
      gym: 'FitZone Downtown',
      date: '2024-02-15',
      time: '07:00',
      duration: 60,
      capacity: 20,
      enrolled: 15,
      price: 25,
      difficulty: 'Beginner',
      description: 'Start your day with a gentle yoga flow that focuses on breathing and flexibility.',
      amenities: ['Yoga Mats', 'Props', 'Towels'],
      rating: 4.8
    },
    {
      id: '2',
      name: 'HIIT Bootcamp',
      instructor: 'Mike Wilson',
      gym: 'PowerHouse Gym',
      date: '2024-02-15',
      time: '18:00',
      duration: 45,
      capacity: 15,
      enrolled: 12,
      price: 30,
      difficulty: 'Advanced',
      description: 'High-intensity interval training designed to burn calories and build strength.',
      amenities: ['Equipment', 'Towels', 'Water'],
      rating: 4.9
    },
    {
      id: '3',
      name: 'Zumba Dance Party',
      instructor: 'Maria Garcia',
      gym: 'FitZone Downtown',
      date: '2024-02-16',
      time: '19:00',
      duration: 60,
      capacity: 25,
      enrolled: 20,
      price: 20,
      difficulty: 'Beginner',
      description: 'Fun dance workout combining Latin rhythms with easy-to-follow moves.',
      amenities: ['Sound System', 'Mirrors', 'Water'],
      rating: 4.7
    },
    {
      id: '4',
      name: 'Strength Training',
      instructor: 'Alex Thompson',
      gym: 'PowerHouse Gym',
      date: '2024-02-17',
      time: '10:00',
      duration: 75,
      capacity: 12,
      enrolled: 8,
      price: 35,
      difficulty: 'Intermediate',
      description: 'Build muscle and increase strength with guided weight training.',
      amenities: ['Free Weights', 'Machines', 'Spotting'],
      rating: 4.6
    },
    {
      id: '5',
      name: 'Pilates Core',
      instructor: 'Emma Davis',
      gym: 'FitZone Downtown',
      date: '2024-02-18',
      time: '12:00',
      duration: 50,
      capacity: 18,
      enrolled: 14,
      price: 28,
      difficulty: 'Intermediate',
      description: 'Focus on core strength, flexibility, and body awareness through controlled movements.',
      amenities: ['Mats', 'Props', 'Mirrors'],
      rating: 4.5
    }
  ], []);

  const filteredAndSortedClasses = useMemo(() => {
    let filtered = classes;

    if (filterGym !== 'all') {
      filtered = filtered.filter(cls => cls.gym === filterGym);
    }

    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(cls => cls.difficulty === filterDifficulty);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime();
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          return (b.capacity - b.enrolled) - (a.capacity - a.enrolled);
        default:
          return 0;
      }
    });
  }, [classes, filterGym, filterDifficulty, sortBy]);

  const handleBookClass = (classItem: GymClass) => {
    setSelectedClass(classItem);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (selectedClass) {
      console.log('Booking confirmed for:', selectedClass.name);
      setShowBookingModal(false);
      setSelectedClass(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book a Class</h1>
        <p className="text-gray-600">Find and book fitness classes at your favorite gyms</p>
      </div>

      {/* Filters and Sorting */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={filterGym}
              onChange={(e) => setFilterGym(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Gyms</option>
              {gyms.map(gym => (
                <option key={gym.id} value={gym.name}>{gym.name}</option>
              ))}
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="availability">Sort by Availability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedClasses.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{classItem.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(classItem.difficulty)}`}>
                  {classItem.difficulty}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Instructor: {classItem.instructor}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{classItem.gym}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(classItem.date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{classItem.time} ({classItem.duration} min)</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{classItem.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{classItem.rating}</span>
                <span className="text-sm text-gray-500">
                  • {classItem.enrolled}/{classItem.capacity} enrolled
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {classItem.amenities.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
                {classItem.amenities.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{classItem.amenities.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-green-600">${classItem.price}</div>
                <button
                  onClick={() => handleBookClass(classItem)}
                  disabled={classItem.enrolled >= classItem.capacity}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    classItem.enrolled >= classItem.capacity
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {classItem.enrolled >= classItem.capacity ? 'Full' : 'Book Now'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedClasses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
          <p className="text-gray-600">Try adjusting your filters to see more classes.</p>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Booking</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900">{selectedClass.name}</h4>
                <p className="text-gray-600">with {selectedClass.instructor}</p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{selectedClass.gym}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(selectedClass.date)} at {selectedClass.time}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{selectedClass.duration} minutes</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-green-600">${selectedClass.price}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmBooking}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Booking
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
    </div>
  );
}
