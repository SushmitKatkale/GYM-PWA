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
  Dumbbell,
  Webcam,
  Link2,
  MapPinIcon
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
    if (gym.plans?.monthlyDiscounted) return { price: Math.round(gym.plans.monthly - (gym.plans.monthly * gym.plans.monthlyDiscounted / 100)), original: gym.plans.monthly, period: 'month', discount: Math.round(gym.plans.monthlyDiscounted) };
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
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header with Back Button */}
      {/* <div className="sticky top-0 z-50 bg-white shadow-sm">
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
      </div> */}

      {/* Hero Section with Images */}
      <div className="relative">
        <GymImageCarousel
          images={gym.images || []}
          gymName={gym.name}
          className="h-48 sm:h-80"
          fallbackImage={gym.image || '/images/gyms/placeholder-gym.jpg'}
        />

        {/* Discount Badge */}
        {bestPlan.discount && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {bestPlan.discount}% OFF
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 items-center">
          <a
            href={`tel:${gym.phone}`}
            className="bg-white bg-opacity-90 backdrop-blur-sm w-10 h-10 flex items-center justify-center rounded-full shadow-lg hover:bg-opacity-100 transition-all"
          >
            <Phone className="w-5 h-5 text-green-600" />
          </a>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${gym.latitude},${gym.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-pink-400 to-red-500 bg-opacity-90 backdrop-blur-sm w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-opacity-100 transition-all"
          >
            <MapPinIcon className="w-6 h-6 text-white" />
          </a>

          <a
            href={gym.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white bg-opacity-90 backdrop-blur-sm w-10 h-10 flex items-center justify-center rounded-full shadow-lg hover:bg-opacity-100 transition-all"
          >
            <Link2 className="w-5 h-5 text-blue-600" />
          </a>
        </div>

      </div>

      {/* Gym Info Header */}
      <div className="bg-white px-4 py-6 shadow-sm mt-2">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{gym.name}</h1>

        <div className="flex items-start space-x-2 text-gray-600 mb-4">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{gym.address}
            {gym?.city && <span className="text-sm">{`, ${gym?.city}`}</span>}
            {gym?.state && <span className="text-sm">{`, ${gym?.state}`}</span>}
            {gym?.zipCode && <span className="text-sm">{`, ${gym?.zipCode}`}</span>}
          </span>
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

        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => onDirectPayment ? onDirectPayment(gym, bestPlan) : onSubscribe(gym)}
            className="flex-1 bg-gradient-to-br from-pink-400 to-red-500 text-white font-medium py-2 px-4 rounded-xs transition-colors text-sm sm:text-base w-1/2 max-w-[180px]"
          >
            Subscribe
          </button>

          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-900">{gym.rating} / 5.0</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-6 shadow-sm mt-2 flex flex-col gap-4">
        <div>
          <h1 className='text-sm font-semibold'>Description</h1>
          <p className='text-sm mt-2 text-justify'>{gym.description || `${gym.name} is a premium fitness center dedicated to helping you achieve your health and fitness goals. With state-of-the-art equipment, expert trainers, and a motivating environment, we provide everything you need for your fitness journey.`}</p>
        </div>

        <div>
          <h1 className="text-sm font-semibold mb-2">Facilities & Amenities</h1>
          <div className="flex flex-wrap gap-2">
            {gym.amenities && gym.amenities.map((amenity: any, index: number) => {
              const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
              const IconComponent = getAmenityIcon(amenityName);

              return (
                <div
                  key={index}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg text-sm"
                >
                  <IconComponent className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-900 font-medium">{amenityName}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md p-6 shadow-sm mt-2 flex flex-col gap-4 text-sm">
        <h1 className='font-semibold'>Operating Hours</h1>
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
        <div className="mt-1 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 font-medium flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Currently Open
          </p>
          <p className="text-xs text-green-600 mt-1">Closes at {formattedHours.close}</p>
        </div>
      </div>

      <div className="bg-white rounded-md p-6 shadow-sm mt-2 flex flex-col gap-4 text-sm">
        {/* Key Features */}
        <h1 className='text-sm font-semibold'>Features</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-500 to-pink-600 rounded-lg shadow-sm">
            <Users className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-xs text-white">Expert</p>
            <p className="font-semibold text-white">Trainers</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-sm">
            <Dumbbell className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-xs text-white ">Modern</p>
            <p className="font-semibold text-white ">Equipment</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-500 to-pink-600 rounded-lg shadow-sm">
            <Shield className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-xs text-white ">Safe &</p>
            <p className="font-semibold text-white ">Secure</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg shadow-sm">
            <Heart className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-xs text-white ">Health</p>
            <p className="font-semibold text-white ">Focused</p>
          </div>
        </div>
      </div>
    </div>
  );
};
