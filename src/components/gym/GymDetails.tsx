import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Globe, 
  Navigation2, 
  CheckCircle, 
  Users, 
  Calendar,
  IndianRupee,
  Zap,
  Shield,
  Award,
  Target,
  Heart,
  Wifi,
  Car,
  Dumbbell
} from 'lucide-react';
import { GymImageCarousel } from '../ui/GymImageCarousel';
import { formatOperatingHours } from '../../utils/timeFormat';

interface GymDetailsProps {
  gym: any;
  onBack: () => void;
  onSubscribe: (gym: any) => void;
  onDirectPayment?: (gym: any, plan: any) => void;
  currentLocation?: { lat: number; lng: number } | null;
}

export const GymDetails: React.FC<GymDetailsProps> = ({
  gym,
  onBack,
  onSubscribe,
  onDirectPayment,
  currentLocation
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const calculateDistance = (gymLat: string | number, gymLng: string | number) => {
    if (!currentLocation) return 0;
    
    const lat = typeof gymLat === 'string' ? parseFloat(gymLat) : gymLat;
    const lng = typeof gymLng === 'string' ? parseFloat(gymLng) : gymLng;
    
    if (isNaN(lat) || isNaN(lng)) return 0;
    
    const R = 6371;
    const dLat = (lat - currentLocation.lat) * Math.PI / 180;
    const dLng = (lng - currentLocation.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = currentLocation ? calculateDistance(gym.latitude, gym.longitude) : 0;

  // Format operating hours
  const formattedHours = formatOperatingHours(gym.operatingHours);

  const getBestPlan = () => {
    if (gym.plans?.monthlyDiscounted) return { price: gym.plans.monthlyDiscounted, original: gym.plans.monthly, period: 'month', discount: Math.round(((gym.plans.monthly - gym.plans.monthlyDiscounted) / gym.plans.monthly) * 100) };
    if (gym.plans?.daily) return { price: gym.plans.daily, period: 'day' };
    if (gym.plans?.weekly) return { price: gym.plans.weekly, period: 'week' };
    if (gym.plans?.monthly) return { price: gym.plans.monthly, period: 'month' };
    return { price: 999, period: 'month' };
  };

  const bestPlan = getBestPlan();

  const amenityIcons: { [key: string]: any } = {
    'WiFi': Wifi,
    'Parking': Car,
    'Personal Training': Users,
    'Equipment': Dumbbell,
    'AC': Zap,
    'Locker': Shield
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
    return amenityIcons[amenityName] || CheckCircle;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-900">{gym.rating}</span>
          </div>
        </div>
      </div>

      {/* Hero Section with Images */}
      <div className="relative">
        <GymImageCarousel
          images={gym.images || []}
          gymName={gym.name}
          className="h-64 sm:h-80"
          fallbackImage={gym.image || '/images/gyms/placeholder-gym.jpg'}
        />
        
        {/* Discount Badge */}
        {bestPlan.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {bestPlan.discount}% OFF
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          {gym.phone && (
            <a
              href={`tel:${gym.phone}`}
              className="bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
            >
              <Phone className="w-5 h-5 text-green-600" />
            </a>
          )}
          {currentLocation && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${gym.latitude},${gym.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white bg-opacity-90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-opacity-100 transition-all"
            >
              <Navigation2 className="w-5 h-5 text-blue-600" />
            </a>
          )}
        </div>
      </div>

      {/* Gym Info Header */}
      <div className="bg-white px-4 py-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{gym.name}</h1>
        
        <div className="flex items-start space-x-2 text-gray-600 mb-4">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{gym.address}</span>
        </div>

        {currentLocation && (
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-1">
              <Navigation2 className="w-4 h-4" />
              <span>{distance.toFixed(1)} km away</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formattedHours.open} - {formattedHours.close}</span>
            </div>
          </div>
        )}

        {/* Price CTA */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Starting from</p>
              <div className="flex items-center space-x-2">
                {bestPlan.original && (
                  <span className="text-green-200 line-through text-lg">₹{bestPlan.original}</span>
                )}
                <span className="text-2xl font-bold">₹{bestPlan.price}</span>
                <span className="text-green-100">/{bestPlan.period}</span>
              </div>
              {bestPlan.discount && (
                <p className="text-green-200 text-sm">Save {bestPlan.discount}% today!</p>
              )}
            </div>
            <button
              onClick={() => onDirectPayment ? onDirectPayment(gym, bestPlan) : onSubscribe(gym)}
              className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white px-4 sticky top-[73px] z-40 shadow-sm">
        <div className="flex space-x-1 border-b border-gray-200">
          {['overview', 'amenities', 'plans', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Expert</p>
                <p className="font-semibold text-gray-900">Trainers</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Dumbbell className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Modern</p>
                <p className="font-semibold text-gray-900">Equipment</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Safe &</p>
                <p className="font-semibold text-gray-900">Secure</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">Health</p>
                <p className="font-semibold text-gray-900">Focused</p>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About This Gym</h3>
              <p className="text-gray-600 leading-relaxed">
                {gym.description || `${gym.name} is a premium fitness center dedicated to helping you achieve your health and fitness goals. With state-of-the-art equipment, expert trainers, and a motivating environment, we provide everything you need for your fitness journey.`}
              </p>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Operating Hours
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Monday - Friday</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">{formattedHours.open} - {formattedHours.close}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Saturday</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">{formattedHours.open} - {formattedHours.close}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Sunday</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-gray-900">{formattedHours.open} - {formattedHours.close}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Currently Open
                </p>
                <p className="text-xs text-green-600 mt-1">Closes at {formattedHours.close}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'amenities' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Facilities & Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gym.amenities && gym.amenities.map((amenity: any, index: number) => {
                const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
                const IconComponent = getAmenityIcon(amenityName);
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <IconComponent className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium">{amenityName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Membership Plans</h3>
            
            {/* Featured Plan */}
            {bestPlan.discount && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-yellow-400 text-green-800 px-3 py-1 text-xs font-bold rounded-bl-lg">
                  BEST VALUE
                </div>
                <div className="mb-4">
                  <h4 className="text-xl font-bold">Monthly Membership</h4>
                  <p className="text-green-100">Most popular choice</p>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-green-200 line-through text-xl">₹{bestPlan.original}</span>
                  <span className="text-3xl font-bold">₹{bestPlan.price}</span>
                  <span className="text-green-100">/month</span>
                </div>
                <button
                  onClick={() => onDirectPayment ? onDirectPayment(gym, bestPlan) : onSubscribe(gym)}
                  className="w-full bg-white text-green-600 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Start Your Journey - Save {bestPlan.discount}%
                </button>
              </div>
            )}

            {/* Other Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gym.plans?.daily > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Daily Pass</h4>
                    <div className="text-2xl font-bold text-gray-800 mb-2">₹{gym.plans.daily}</div>
                    <p className="text-gray-600 text-sm mb-4">Perfect for trying out</p>
                    <button
                      onClick={() => onSubscribe(gym)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                    >
                      Get Day Pass
                    </button>
                  </div>
                </div>
              )}

              {gym.plans?.weekly > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Weekly Pass</h4>
                    <div className="text-2xl font-bold text-gray-800 mb-2">₹{gym.plans.weekly}</div>
                    <p className="text-gray-600 text-sm mb-4">Short-term commitment</p>
                    <button
                      onClick={() => onSubscribe(gym)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                    >
                      Get Weekly
                    </button>
                  </div>
                </div>
              )}

              {gym.plans?.yearly > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Annual Plan</h4>
                    <div className="text-2xl font-bold text-gray-800 mb-2">₹{gym.plans.yearly}</div>
                    <p className="text-gray-600 text-sm mb-4">Best long-term value</p>
                    <button
                      onClick={() => onSubscribe(gym)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                    >
                      Go Annual
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-6 h-6 ${i < Math.floor(gym.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">{gym.rating}</span>
              </div>
              <p className="text-gray-600">Based on member reviews</p>
            </div>

            {/* Sample Reviews */}
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-900 font-medium mb-1">"Excellent equipment and friendly staff!"</p>
                <p className="text-gray-600 text-sm">- Sarah M.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-900 font-medium mb-1">"Clean facilities and great trainers."</p>
                <p className="text-gray-600 text-sm">- Raj K.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-900 font-medium mb-1">"Best gym in the area, highly recommended!"</p>
                <p className="text-gray-600 text-sm">- Priya S.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t border-gray-200 z-50">
        <div className="flex space-x-3">
          {gym.phone && (
            <a
              href={`tel:${gym.phone}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-full font-semibold text-center transition-colors"
            >
              Call Now
            </a>
          )}
          <button
            onClick={() => onDirectPayment ? onDirectPayment(gym, bestPlan) : onSubscribe(gym)}
            className="flex-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 px-6 rounded-full font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Zap className="w-5 h-5" />
            <span>Join Now - ₹{bestPlan.price}/{bestPlan.period}</span>
          </button>
        </div>
      </div>

      {/* Bottom Spacing for Floating Button */}
      <div className="h-20"></div>
    </div>
  );
};
