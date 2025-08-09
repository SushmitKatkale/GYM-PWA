import React, { useState, useEffect } from 'react';
import { MapPin, Star, Filter, Navigation, Clock, DollarSign, Map as MapIcon, Users, Zap, IndianRupee } from 'lucide-react';
import { useGymStore } from '../../stores/gymStore';
import { useAuthStore } from '../../stores/authStore';
import { GymDiscoveryMap } from '../common/GymDiscoveryMap';
import { GymFilters } from '../../services/gymService';
import { useGeolocation } from '../../hooks/useGeolocation';
import { subscriptionService } from '../../services/subscriptionService';
import { paymentService } from '../../services/paymentService';
import SubscriptionPurchaseModal from '../ui/SubscriptionPurchaseModal';
import { PaymentGatewayModal } from '../payments/PaymentGatewayModal';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';

export function GymDiscovery() {
  const { gyms, selectedGym, setSelectedGym, fetchGymsWithFilters, isLoading, error, clearError } = useGymStore();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [mapRefreshTrigger, setMapRefreshTrigger] = useState(0);
  
  // Subscription purchase states
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<any[]>([]);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Payment gateway states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentGym, setCurrentGym] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve, 
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        });

        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        console.log('Got user location:', newLocation);
        setCurrentLocation(newLocation);
        // Trigger map refresh when location is updated
        setMapRefreshTrigger(prev => prev + 1);
        return;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to Bangalore coordinates (change this to your preferred default location)
      const fallbackLocation = {
        lat: 12.9716,  // Bangalore, India
        lng: 77.5946
      };
      
      console.log('Using fallback location:', fallbackLocation);
      setCurrentLocation(fallbackLocation);
      // Trigger map refresh for fallback location too
      setMapRefreshTrigger(prev => prev + 1);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Fetch gyms when component mounts or location changes
  useEffect(() => {
    const initializeComponent = async () => {
      // Get location first
      await getCurrentLocation();

      // Then fetch gyms
      if (!hasInitialLoad) {
        await fetchGyms();
        setHasInitialLoad(true);
      }
    };

    initializeComponent();
  }, []);

  // Fetch gyms with current location and filters
  const fetchGyms = async () => {
    const filters: GymFilters = {};

    // Add location-based filtering if available
    if (currentLocation) {
      filters.latitude = currentLocation.lat;
      filters.longitude = currentLocation.lng;
      filters.radius = 50; // 50km radius
    }

    // Add other filters based on current selections
    if (filter === 'premium') {
      filters.minRating = 4.5;
    }

    filters.sortBy = sortBy as 'distance' | 'rating' | 'price' | 'name';
    filters.sortOrder = 'asc';

    const success = await fetchGymsWithFilters(filters);
    if (!success && error) {
      console.error('Failed to fetch gyms:', error);
    }
  };

  // Refetch gyms when location is updated
  useEffect(() => {
    if (hasInitialLoad && currentLocation) {
      fetchGyms();
    }
  }, [currentLocation]);

  // Refetch gyms when filters change
  useEffect(() => {
    if (hasInitialLoad) {
      fetchGyms();
    }
  }, [filter, sortBy]);

  // Check for active subscriptions
  const checkActiveSubscriptions = async () => {
    try {
      const response = await subscriptionService.getUserSubscriptions();
      if (response.success && response.data) {
        const activeSubscriptions = response.data.filter(sub => sub.status === 'active');
        setHasActiveSubscription(activeSubscriptions.length > 0);
        return activeSubscriptions.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking subscriptions:', error);
      return false;
    }
  };

  // Payment handlers
  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    setSuccessMessage(`Payment successful! Your subscription has been activated.`);
    setShowSuccessModal(true);
    setSelectedPlan(null);
    setCurrentGym(null);
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    setErrorMessage(error);
    setShowErrorModal(true);
  };

  // Handle showing all gym subscriptions
  const handleShowSubscriptions = async (gym: any) => {
    if (!user) {
      setErrorMessage('Please login to purchase a subscription');
      setShowErrorModal(true);
      return;
    }

    setCurrentGym(gym); // Set current gym for payment processing

    // Check for active subscriptions first
    const hasActive = await checkActiveSubscriptions();
    
    // Prepare all subscription details for the modal
    const subscriptionDetails = gym.subscriptions?.map((sub: any) => {
      let planType = 'Custom';
      if (sub.validityDays === 1) planType = 'Daily';
      else if (sub.validityDays === 7) planType = 'Weekly';
      else if (sub.validityDays === 30) planType = 'Monthly';
      else if (sub.validityDays === 365) planType = 'Yearly';
      
      return {
        id: sub.id,
        planType,
        price: parseFloat(sub.price),
        discountedPrice: sub.discountedPrice ? parseFloat(sub.discountedPrice) : undefined,
        gymName: gym.name,
        validityDays: sub.validityDays,
        subscriptionId: sub.id,
        gymId: gym.id,
        features: sub.features || [],  // Ensure features are included
        isMostPopular: sub.isMostPopular || false,
        isCheapest: sub.isCheapest || false,
        amenities: gym.amenities || [],  // Add gym amenities
        location: gym.address || 'Location not available'  // Add gym location/address
      };
    }) || [];

    setSelectedSubscriptions(subscriptionDetails);
    setHasActiveSubscription(hasActive);
    setIsPurchaseModalOpen(true);
  };

  // Handle plan selection (for individual plan clicks - kept for backward compatibility)
  const handlePlanClick = async (gym: any, planType: string, validityDays: number) => {
    if (!user) {
      setErrorMessage('Please login to purchase a subscription');
      setShowErrorModal(true);
      return;
    }

    // Check for active subscriptions first
    const hasActive = await checkActiveSubscriptions();
    
    // Get plan details
    const subscription = gym.subscriptions?.find((sub: any) => sub.validityDays === validityDays);
    if (!subscription) {
      setErrorMessage('Subscription plan not found');
      setShowErrorModal(true);
      return;
    }

    const subscriptionDetails = [{
      id: subscription.id,
      planType,
      price: parseFloat(subscription.price),
      discountedPrice: subscription.discountedPrice ? parseFloat(subscription.discountedPrice) : undefined,
      gymName: gym.name,
      validityDays,
      subscriptionId: subscription.id,
      gymId: gym.id
    }];

    setSelectedSubscriptions(subscriptionDetails);
    setHasActiveSubscription(hasActive);
    setIsPurchaseModalOpen(true);
  };

  // Handle payment confirmation
  const handleConfirmPurchase = async (paymentMethod: string, subscriptionId: string) => {
    if (!selectedSubscriptions.length || !user) return;
    
    const selectedSub = selectedSubscriptions.find(sub => sub.id === subscriptionId);
    if (!selectedSub) return;

    setIsProcessingPayment(true);
    
    try {
      // Create payment
      const finalPrice = selectedSub.discountedPrice || selectedSub.price;
      
      const paymentResponse = await paymentService.createPayment({
        userId: user.id,
        amount: finalPrice,
        currency: 'INR',
        method: paymentMethod as 'card' | 'bank' | 'cash',
        description: `${selectedSub.planType} subscription for ${selectedSub.gymName}`
      });

      if (paymentResponse.success) {
        // Create subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + selectedSub.validityDays);

        const subscriptionResponse = await subscriptionService.createSubscription({
          userId: user.id,
          type: selectedSub.planType.toLowerCase() as 'daily' | 'weekly' | 'monthly' | 'yearly',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active'
        });

        if (subscriptionResponse.success) {
          setSuccessMessage(`Successfully purchased ${selectedSub.planType} subscription for ${selectedSub.gymName}!`);
          setShowSuccessModal(true);
          setIsPurchaseModalOpen(false);
        } else {
          throw new Error('Failed to create subscription');
        }
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setErrorMessage('Failed to process purchase. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const calculateDistance = (gymLat: string | number, gymLng: string | number) => {
    if (!currentLocation) return 0;

    const lat = typeof gymLat === 'string' ? parseFloat(gymLat) : gymLat;
    const lng = typeof gymLng === 'string' ? parseFloat(gymLng) : gymLng;

    if (isNaN(lat) || isNaN(lng)) return 0;

    const R = 6371; // Earth's radius in km
    const dLat = (lat - currentLocation.lat) * Math.PI / 180;
    const dLng = (lng - currentLocation.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredAndSortedGyms = gyms
    .map(gym => {
      const gymWithDistance = {
        ...gym,
        distance: calculateDistance(gym.latitude, gym.longitude),
        // Ensure we have operatingHours for display
        operatingHours: gym.operatingHours || {
          open: gym.openingTime || '06:00',
          close: gym.closingTime || '22:00'
        },
        // Get the cheapest subscription price for sorting
        lowestPrice: gym.subscriptions && gym.subscriptions.length > 0
          ? Math.min(...gym.subscriptions.map(sub => parseFloat(sub.price) || 0))
          : 0,
        // Create plans object for backward compatibility with discount logic
        plans: gym.subscriptions && gym.subscriptions.length > 0 
          ? {
              daily: gym.subscriptions.find(sub => sub.validityDays === 1) ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 1).price) : 0,
              weekly: gym.subscriptions.find(sub => sub.validityDays === 7) ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 7).price) : 0,
              monthly: gym.subscriptions.find(sub => sub.validityDays === 30) ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 30).price) : gym.subscriptions.length > 0 ? parseFloat(gym.subscriptions[0].price) : 0,
              yearly: gym.subscriptions.find(sub => sub.validityDays === 365) ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 365).price) : 0,
              // Add discounted prices from database
              dailyDiscounted: gym.subscriptions.find(sub => sub.validityDays === 1)?.discountedPrice ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 1).discountedPrice) : null,
              weeklyDiscounted: gym.subscriptions.find(sub => sub.validityDays === 7)?.discountedPrice ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 7).discountedPrice) : null,
              monthlyDiscounted: gym.subscriptions.find(sub => sub.validityDays === 30)?.discountedPrice ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 30).discountedPrice) : gym.subscriptions.length > 0 && gym.subscriptions[0].discountedPrice ? parseFloat(gym.subscriptions[0].discountedPrice) : null,
              yearlyDiscounted: gym.subscriptions.find(sub => sub.validityDays === 365)?.discountedPrice ? parseFloat(gym.subscriptions.find(sub => sub.validityDays === 365).discountedPrice) : null
            }
          : { daily: 0, weekly: 0, monthly: 0, yearly: 0, dailyDiscounted: null, weeklyDiscounted: null, monthlyDiscounted: null, yearlyDiscounted: null }
      };
      return gymWithDistance;
    })
    .filter(gym => {
      if (filter === 'all') return true;
      if (filter === 'nearby') return gym.distance <= 5;
      if (filter === 'premium') {
        const rating = typeof gym.rating === 'string' ? parseFloat(gym.rating) : gym.rating;
        return rating >= 4.5;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance': return a.distance - b.distance;
        case 'rating': {
          const ratingA = typeof a.rating === 'string' ? parseFloat(a.rating) : a.rating;
          const ratingB = typeof b.rating === 'string' ? parseFloat(b.rating) : b.rating;
          return ratingB - ratingA;
        }
        case 'price': return a.lowestPrice - b.lowestPrice;
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Gyms</h1>
          <p className="text-gray-600 mt-1">Find the perfect gym near you</p>
        </div> */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3 justify-between w-full">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm flex'
                  : 'text-gray-500 hover:text-gray-700 flex'
                }`}
            >
              <MapIcon className="w-4 h-4 mr-1 mt-[2px]" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
          <button
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            <Navigation className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoadingLocation ? 'Locating...' : 'Update Location'}</span>
            <span className="sm:hidden">Location</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Gyms</option>
              <option value="nearby">Within 5km</option>
              <option value="premium">Premium (4.5+ rating)</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'map' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <GymDiscoveryMap
            gyms={filteredAndSortedGyms}
            center={currentLocation || { lat: 12.9716, lng: 77.5946 }}
            zoom={12}
            height="600px"
            onGymSelect={setSelectedGym}
            selectedGym={selectedGym}
            showUserLocation={true}
            userLocation={currentLocation}
            refreshTrigger={mapRefreshTrigger}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAndSortedGyms.map((gym) => (
            <div key={gym.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <img
                  src={gym.image}
                  alt={gym.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{gym.rating}</span>
                </div>
                {gym.plans.monthlyDiscounted && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                    {Math.round(((gym.plans.monthly - gym.plans.monthlyDiscounted) / gym.plans.monthly) * 100)}% OFF
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex flex-col items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{gym.name}</h3>
                    <div className="flex items-start text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-sm break-words">{gym.address}</span>
                    </div>
                    {currentLocation && (
                      <p className="text-sm text-green-600 mt-1">
                        {gym.distance.toFixed(1)} km away
                      </p>
                    )}
                    {/* Amenities */}
                    <div className="mt-4 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {gym.amenities && gym.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {typeof amenity === 'string' ? amenity : amenity.name}
                          </span>
                        ))}
                        {gym.amenities && gym.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{gym.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Operating Hours & Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 mb-4 gap-2">
                    {/* <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{gym.operatingHours.open} - {gym.operatingHours.close}</span>
                    </div> */}
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-center space-x-2">
                        <IndianRupee className="w-4 h-4" />
                        {gym.plans.monthlyDiscounted ? (
                          <div className="flex items-center space-x-2">
                            <span className="line-through text-gray-400 text-sm">₹{gym.plans.monthly}</span>
                            <span className="text-green-600 font-bold">₹{gym.plans.monthlyDiscounted}</span>
                            <span className="text-xs">/month</span>
                          </div>
                        ) : (
                          <span>₹{gym.plans.monthly}/month</span>
                        )}
                      </div>
                      {gym.plans.monthlyDiscounted && (
                        <div className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                          {Math.round(((gym.plans.monthly - gym.plans.monthlyDiscounted) / gym.plans.monthly) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedGym(selectedGym?.id === gym.id ? null : gym)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    {selectedGym?.id === gym.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button 
                    onClick={() => handleShowSubscriptions(gym)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Subscribe
                  </button>
                </div>

                {/* Expanded Details */}
                {selectedGym?.id === gym.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">All Amenities</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {gym.amenities && gym.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-600">{typeof amenity === 'string' ? amenity : amenity.name}</span>
                        </div>
                      ))}
                    </div>

                    <h4 className="font-medium text-gray-900 mb-4">Pricing Plans</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                      {gym.plans.daily > 0 && (
                        <div 
                          onClick={() => handlePlanClick(gym, 'Daily', 1)}
                          className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center cursor-pointer hover:border-green-300">
                          {gym.subscriptions.find(sub => sub.validityDays === 1)?.isMostPopular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <span className="bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">MOST POPULAR</span>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Daily Pass</p>
                            {gym.plans.dailyDiscounted ? (
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                  <span className="text-xs sm:text-sm line-through text-gray-400">₹{gym.plans.daily}</span>
                                  <span className="bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                                    {Math.round(((gym.plans.daily - gym.plans.dailyDiscounted) / gym.plans.daily) * 100)}% OFF
                                  </span>
                                </div>
                                <p className="text-lg sm:text-2xl font-bold text-green-600">₹{gym.plans.dailyDiscounted}</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-lg sm:text-2xl font-bold text-gray-800">₹{gym.plans.daily}</p>
                                {gym.subscriptions.find(sub => sub.validityDays === 1)?.isCheapest && (
                                  <p className="text-xs text-gray-600 font-medium">Cheapest</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {gym.plans.weekly > 0 && (
                        <div 
                          onClick={() => handlePlanClick(gym, 'Weekly', 7)}
                          className="relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 border border-purple-200 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center cursor-pointer hover:border-green-300">
                          {gym.subscriptions.find(sub => sub.validityDays === 7)?.isMostPopular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <span className="bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">MOST POPULAR</span>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-purple-600 mb-2">Weekly</p>
                            {gym.plans.weeklyDiscounted ? (
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                  <span className="text-xs sm:text-sm line-through text-gray-400">₹{gym.plans.weekly}</span>
                                  <span className="bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                                    {Math.round(((gym.plans.weekly - gym.plans.weeklyDiscounted) / gym.plans.weekly) * 100)}% OFF
                                  </span>
                                </div>
                                <p className="text-lg sm:text-2xl font-bold text-green-600">₹{gym.plans.weeklyDiscounted}</p>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-lg sm:text-2xl font-bold text-purple-700">₹{gym.plans.weekly}</p>
                                {gym.subscriptions.find(sub => sub.validityDays === 7)?.isCheapest && (
                                  <p className="text-xs text-purple-600 font-medium">Cheapest</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {gym.plans.monthly > 0 && (
                        <div 
                          onClick={() => handlePlanClick(gym, 'Monthly', 30)}
                          className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 border-2 border-green-300 hover:shadow-lg transition-shadow min-h-[120px] flex flex-col justify-center cursor-pointer hover:border-green-400">
                          {gym.subscriptions.find(sub => sub.validityDays === 30)?.isMostPopular && (
                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                              <span className="bg-green-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold">MOST POPULAR</span>
                            </div>
                          )}
                          <div className="text-center mt-2">
                            <p className="text-xs sm:text-sm font-medium text-green-700 mb-2">Monthly</p>
                            {gym.plans.monthlyDiscounted ? (
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                  <span className="text-xs sm:text-sm line-through text-gray-400">₹{gym.plans.monthly}</span>
                                  <span className="bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                                    {Math.round(((gym.plans.monthly - gym.plans.monthlyDiscounted) / gym.plans.monthly) * 100)}% OFF
                                  </span>
                                </div>
                                <p className="text-lg sm:text-2xl font-bold text-green-600">₹{gym.plans.monthlyDiscounted}</p>
                              </div>
                            ) : (
                              <p className="text-lg sm:text-2xl font-bold text-green-700">₹{gym.plans.monthly}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {gym.plans.yearly > 0 && (
                        <div 
                          onClick={() => handlePlanClick(gym, 'Yearly', 365)}
                          className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 border border-blue-200 hover:shadow-md transition-shadow min-h-[120px] flex flex-col justify-center cursor-pointer hover:border-green-300">
                          <div className="text-center">
                            <p className="text-xs sm:text-sm font-medium text-blue-600 mb-2">Yearly</p>
                            {gym.plans.yearlyDiscounted ? (
                              <div className="space-y-1 sm:space-y-2">
                                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                  <span className="text-xs sm:text-sm line-through text-gray-400">₹{gym.plans.yearly}</span>
                                  <span className="bg-red-100 text-red-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold">
                                    {Math.round(((gym.plans.yearly - gym.plans.yearlyDiscounted) / gym.plans.yearly) * 100)}% OFF
                                  </span>
                                </div>
                                <p className="text-lg sm:text-2xl font-bold text-green-600">₹{gym.plans.yearlyDiscounted}</p>
                                {gym.subscriptions.find(sub => sub.validityDays === 365)?.isCheapest && (
                                  <p className="text-xs text-blue-600 font-medium">Cheapest</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <p className="text-lg sm:text-2xl font-bold text-blue-700">₹{gym.plans.yearly}</p>
                                {gym.subscriptions.find(sub => sub.validityDays === 365)?.isCheapest && (
                                  <p className="text-xs text-blue-600 font-medium">Cheapest</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* <p className="text-gray-600 text-sm mb-4">${gym.description}</p> */}

      {/* Modals */}
      {isPurchaseModalOpen && selectedSubscriptions.length > 0 && (
        <SubscriptionPurchaseModal
          isOpen={isPurchaseModalOpen}
          subscriptions={selectedSubscriptions}
          onClose={() => setIsPurchaseModalOpen(false)}
          onSelectPlan={(subscriptionId) => {
            // Find the selected subscription
            const selectedSub = selectedSubscriptions.find(sub => sub.id === subscriptionId);
            if (selectedSub && currentGym) {
              setSelectedPlan({
                subscriptionId: selectedSub.subscriptionId,
                planType: selectedSub.planType,
                amount: selectedSub.discountedPrice || selectedSub.price,
                gymName: selectedSub.gymName
              });
              setIsPurchaseModalOpen(false);
              setShowPaymentModal(true);
            }
          }}
        />
      )}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
      {showPaymentModal && selectedPlan && currentGym && (
        <PaymentGatewayModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
            setCurrentGym(null);
          }}
          gymId={currentGym.id}
          subscriptionId={selectedPlan.subscriptionId}
          amount={selectedPlan.amount}
          planDetails={{
            planType: selectedPlan.planType,
            gymName: selectedPlan.gymName,
            amount: selectedPlan.amount
          }}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
      {filteredAndSortedGyms.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No gyms found</p>
          <p className="text-gray-400">Try adjusting your filters or location</p>
        </div>
      )}
    </div>
  );
}