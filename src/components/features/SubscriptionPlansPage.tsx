import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Star,
  MapPin,
  Navigation2,
  IndianRupee,
  Zap,
  Crown,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles,
  Gift,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { PaymentGatewayModal } from '../payments/PaymentGatewayModal';
import SuccessModal from '../ui/SuccessModal';
import ErrorModal from '../ui/ErrorModal';
import { subscriptionService } from '../../services/subscriptionService';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  validityDays: number;
  planType: string;
  features: Array<{
    id: string;
    title: string;
    description?: string;
    isHighlighted?: boolean;
    displayOrder?: number;
  }>;
  isMostPopular?: boolean;
  isCheapest?: boolean;
  discountPercent?: number;
  bufferDays?: number;
  bufferFee?: number;
}

interface Gym {
  id: string;
  name: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  rating: string | number;
  subscriptions: SubscriptionPlan[];
}

interface SubscriptionPlansPageProps {
  gym: Gym;
  onBack: () => void;
  currentLocation?: { lat: number; lng: number } | null;
}

export const SubscriptionPlansPage: React.FC<SubscriptionPlansPageProps> = ({
  gym,
  onBack,
  currentLocation
}) => {
  const { user } = useAuthStore();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'regular' | 'buffer'>('regular');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Calculate distance
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

  // Check for active subscriptions
  const checkActiveSubscriptions = async () => {
    try {
      const response = await subscriptionService.getUserSubscriptions();
      if (response.success && response.data) {
        const activeSubscriptions = response.data?.subscriptions.filter(sub => sub.status === 'active');
        setHasActiveSubscription(activeSubscriptions.length > 0);
        return activeSubscriptions.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error checking subscriptions:', error);
      return false;
    }
  };

  useEffect(() => {
    checkActiveSubscriptions();
  }, []);

  // Map validity days to plan type names
  const getPlanTypeName = (validityDays: number) => {
    switch (validityDays) {
      case 1: return 'Daily';
      case 7: return 'Weekly';
      case 30: return 'Monthly';
      case 365: return 'Yearly';
      default: return 'Custom';
    }
  };

  // Get plan period display
  const getPlanPeriod = (validityDays: number) => {
    switch (validityDays) {
      case 1: return '/day';
      case 7: return '/week';
      case 30: return '/month';
      case 365: return '/year';
      default: return `/${validityDays} days`;
    }
  };

  // Handle plan selection
  const handlePlanSelect = (planId: string) => {
    if (hasActiveSubscription) {
      setErrorMessage('You already have an active subscription. Please cancel it first to purchase a new one.');
      setShowErrorModal(true);
      return;
    }
    setSelectedPlanId(planId);
  };

  // Handle subscription purchase
  const handleSubscribe = (plan: SubscriptionPlan, paymentType: 'regular' | 'buffer') => {
    if (!user) {
      setErrorMessage('Please login to purchase a subscription');
      setShowErrorModal(true);
      return;
    }

    if (hasActiveSubscription) {
      setErrorMessage('You already have an active subscription. Please cancel it first to purchase a new one.');
      setShowErrorModal(true);
      return;
    }

    let finalPrice = plan.discountPercent
      ? Math.round(plan.price - (plan.discountPercent * plan.price / 100))
      : plan.price;

    // Add buffer fee if buffer payment type is selected
    if (paymentType === 'buffer' && plan.bufferFee) {
      finalPrice += plan.bufferFee;
    }

    setSelectedPlan({
      subscriptionId: plan.id,
      planType: plan.planType,
      amount: finalPrice,
      gymName: gym.name,
      paymentType,
      bufferDays: paymentType === 'buffer' ? (plan.bufferDays || 0) : 0
    });
    setShowPaymentModal(true);
  };

  // Payment handlers
  const handlePaymentSuccess = (paymentId: string) => {
    setShowPaymentModal(false);
    setSuccessMessage(`Payment successful! Your ${selectedPlan?.planType} subscription has been activated.`);
    setShowSuccessModal(true);
    setSelectedPlan(null);
  };

  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    setErrorMessage(error);
    setShowErrorModal(true);
  };

  // Get gradient class based on plan type
  const getPlanGradient = (planType: string, isMostPopular: boolean) => {
    if (isMostPopular) {
      return 'from-orange-400 to-red-500';
    }

    switch (planType.toLowerCase()) {
      case 'daily':
        return 'from-blue-400 to-blue-600';
      case 'weekly':
        return 'from-purple-400 to-purple-600';
      case 'monthly':
        return 'from-orange-400 to-red-500';
      case 'yearly':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  // Sort plans by popularity and price
  const sortedPlans = [...(gym.subscriptions || [])].sort((a, b) => {
    // Most popular first
    if (a.isMostPopular && !b.isMostPopular) return -1;
    if (!a.isMostPopular && b.isMostPopular) return 1;

    // Then by validity days (ascending)
    return a.validityDays - b.validityDays;
  });

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sortedPlans.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sortedPlans.length) % sortedPlans.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  console.log(sortedPlans);
  
  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      {/* <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center p-4">
          <button
            onClick={onBack}
            className="mr-4 p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Choose Your Plan</h1>
            <p className="text-sm text-gray-500">Unlock your fitness potential</p>
          </div>
        </div>
      </div> */}

      {/* Gym Info Card */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-base flex-shrink-0">
            {gym.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{gym.name}</h2>
            <div className="flex items-start space-x-1 mt-1">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-500 break-words">{gym.address}</p>
            </div>
            <div className="flex items-center space-x-4 mt-1">
              {currentLocation && (
                <div className="flex items-center space-x-1">
                  <Navigation2 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">{distance.toFixed(1)} km away</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{gym.rating} rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans Carousel */}
      <div className="px-4 py-4">
        {sortedPlans.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <IndianRupee className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-base text-gray-500">No subscription plans available</p>
            <p className="text-sm text-gray-400">Contact the gym for pricing details</p>
          </div>
        ) : (
          <>
            {/* Carousel Container */}
            <div className="relative">
              {/* Navigation Buttons */}
              {sortedPlans.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    style={{ marginLeft: '-16px' }}
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    style={{ marginRight: '-16px' }}
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </>
              )}

              {/* Slides Container */}
              <div className="rounded-xl">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {sortedPlans.map((plan, index) => {
                    const planType = getPlanTypeName(plan.validityDays);
                    const period = getPlanPeriod(plan.validityDays);
                    const regularPrice = plan.discountPercent
                      ? Math.round(plan.price - (plan.discountPercent * plan.price / 100))
                      : plan.price;
                    const bufferPrice = regularPrice + (plan.bufferFee || 0);
                    const savings = plan.discountPercent ? plan.price - regularPrice : 0;

                    return (
                      <div key={plan.id} className="w-full flex-shrink-0 relative">
                        <div
                          className={`relative bg-white rounded-sm border-2 transition-all mx-1 ${plan.isMostPopular
                            ? 'border-pink-300 shadow-xl bg-gradient-to-b from-pink-50 to-white'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                            }`}
                        >
                          {/* Most Popular Badge */}
                          {plan.isMostPopular || true && (
                            <div className="absolute top-2 right-2 transform z-10">
                              <div className="flex items-center space-x-1">
                                <Star className="w-3 h-3 text-white" />
                                <span className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                  MOST POPULAR
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="py-5 px-2">
                            {/* Plan Header */}
                            <div className="text-center mb-4 flex justify-start items-center px-2 pt-2">
                              <div className={`w-8 h-8 bg-gradient-to-br ${getPlanGradient(planType, plan.isMostPopular)} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                                {planType === 'Daily' && <Zap className="w-4 h-4 text-white" />}
                                {planType === 'Weekly' && <Award className="w-4 h-4 text-white" />}
                                {planType === 'Monthly' && <Crown className="w-4 h-4 text-white" />}
                                {planType === 'Yearly' && <Shield className="w-4 h-4 text-white" />}
                                {!['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(planType) && <Star className="w-4 h-4 text-white" />}
                              </div>
                              <h3 className="text-base font-semibold text-gray-800 mb-2 ml-2">{planType} Plan</h3>
                            </div>

                            {/* Features */}
                            <div className="space-y-3 mb-5">
                              {plan.features && plan.features
                                .slice()
                                .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                                .slice(0, 5)
                                .map((feature, featureIndex) => (
                                  <div key={featureIndex} className={`flex items-start space-x-3 ${feature.isHighlighted ? 'bg-orange-50 border border-orange-200 rounded-lg p-2' : ''
                                    }`}>
                                    <div className="flex-shrink-0">
                                      <Check className={`w-5 h-5 mt-0.5 ${feature.isHighlighted ? 'text-orange-500' : 'text-green-500'
                                        }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className={`text-sm font-medium ${feature.isHighlighted ? 'text-orange-900' : 'text-gray-900'
                                        }`}>
                                        {feature.title}
                                      </div>
                                      {feature.description && (
                                        <p className={`text-xs mt-1 ${feature.isHighlighted ? 'text-orange-700' : 'text-gray-500'
                                          }`}>
                                          {feature.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}

                              {/* Enhanced Default features if none specified */}
                              {(!plan.features || plan.features.length === 0) && (
                                <>
                                  <div className="flex items-start space-x-3">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Full Gym Access</div>
                                      <p className="text-xs text-gray-500 mt-0.5">24/7 access to all gym facilities and equipment</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-3">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Modern Equipment</div>
                                      <p className="text-xs text-gray-500 mt-0.5">Latest cardio machines, weights, and functional training gear</p>
                                    </div>
                                  </div>
                                  <div className="flex items-start space-x-3">
                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">Locker & Shower</div>
                                      <p className="text-xs text-gray-500 mt-0.5">Secure lockers and clean shower facilities</p>
                                    </div>
                                  </div>
                                  {planType !== 'Daily' && (
                                    <div className="flex items-start space-x-3">
                                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">Group Classes</div>
                                        <p className="text-xs text-gray-500 mt-0.5">Join yoga, aerobics, and fitness classes</p>
                                      </div>
                                    </div>
                                  )}
                                  {(planType === 'Monthly' || planType === 'Yearly') && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 flex items-start space-x-3">
                                      <Check className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <div className="text-sm font-medium text-orange-900">Personal Training Session</div>
                                        <p className="text-xs text-orange-700 mt-0.5">Free consultation with certified trainers</p>
                                      </div>
                                    </div>
                                  )}
                                  {planType === 'Yearly' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 flex items-start space-x-3">
                                      <Gift className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <div className="text-sm font-medium text-purple-900">Exclusive Benefits</div>
                                        <p className="text-xs text-purple-700 mt-0.5">Guest passes, priority booking, and nutrition guidance</p>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Discount Badge */}
                            {/* {plan.discountPercent && savings > 0 && (
                              <div className="mb-3">
                                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                                  <div className="text-center">
                                    <span className="text-red-800 text-xs font-medium">
                                      Save ₹{savings.toLocaleString()} • {Math.round(plan.discountPercent)}% off
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )} */}

                            {/* Payment Options */}
                            <div className="space-y-3 flex">
                              {/* Regular Payment Button */}
                              <button
                                onClick={() => handleSubscribe(plan, 'regular')}
                                disabled={hasActiveSubscription}
                                className={`w-full py-4 rounded-xl font-semibold text-white transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${hasActiveSubscription
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : plan.isMostPopular
                                    ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                                    : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900'
                                  }`}
                              >
                                {hasActiveSubscription ? 'Already Subscribed' : (
                                  <div className="flex items-center justify-center space-x-2">
                                    <Calendar className="w-5 h-5" />
                                    <span>Start {planType} Plan</span>
                                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
                                      ₹{regularPrice.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </button>

                              {/* Buffer Payment Button - More Prominent */}
                              {plan.bufferDays && plan.bufferFee && (
                                <div className="relative">
                                  {/* Popular Badge for Buffer */}
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                                    <div className="flex items-center space-x-1">
                                      <TrendingUp className="w-3 h-3 text-white" />
                                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                        RECOMMENDED
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleSubscribe(plan, 'buffer')}
                                    disabled={hasActiveSubscription}
                                    className={`w-full py-4 rounded-xl font-semibold text-white transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-2 ${hasActiveSubscription
                                      ? 'bg-gray-300 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                      }`}
                                  >
                                    {hasActiveSubscription ? 'Already Subscribed' : (
                                      <div>
                                        <div className="flex items-center justify-center space-x-2">
                                          <Sparkles className="w-5 h-5" />
                                          <span>Buffer Plan</span>
                                          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-bold">
                                            ₹{bufferPrice.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="text-xs mt-1 opacity-90 flex items-center justify-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>{plan.bufferDays} days extra grace period • Peace of mind</span>
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Carousel Dots */}
            {sortedPlans.length > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {sortedPlans.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${index === currentSlide
                      ? 'bg-pink-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Active Subscription Warning */}
        {hasActiveSubscription && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-4">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="w-3 h-3 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-orange-900 text-sm">Active Subscription Found</h4>
                <p className="text-xs text-orange-700 mt-0.5">
                  You already have an active subscription. Please cancel it first to purchase a new one.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentModal && selectedPlan && (
        <PaymentGatewayModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          gymId={gym.id}
          subscriptionId={selectedPlan.subscriptionId}
          amount={selectedPlan.amount}
          gymName={selectedPlan.gymName}
          planType={selectedPlan.planType}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setShowSuccessModal(false);
            onBack(); // Go back to previous screen after success
          }}
        />
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};
