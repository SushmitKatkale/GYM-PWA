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
  const [activeTab, setActiveTab] = useState<'regular' | 'buffer'>('buffer');
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
    <div className="min-h-screen bg-gray-50 font-poppins overflow-hidden">
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
                    const bufferPrice = Math.round(regularPrice + (parseFloat(plan.bufferFee) || 0));
                    const savings = plan.discountPercent ? plan.price - regularPrice : 0;

                    return (
                      <div key={plan.id} className="w-full flex-shrink-0 relative">
                        <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm transition-all mx-1">
                          {/* Plan Header */}
                          <div className="px-5 pt-5 pb-2 flex justify-start items-center mb-2">
                            <div className="flex items-center justify-center">
                              <div className={`w-10 h-10 bg-gradient-to-br ${getPlanGradient(planType, plan.isMostPopular)} rounded-full flex items-center justify-center shadow-md`}>
                                {planType === 'Daily' && <Zap className="w-5 h-5 text-white" />}
                                {planType === 'Weekly' && <Award className="w-5 h-5 text-white" />}
                                {planType === 'Monthly' && <Crown className="w-5 h-5 text-white" />}
                                {planType === 'Yearly' && <Shield className="w-5 h-5 text-white" />}
                                {!['Daily', 'Weekly', 'Monthly', 'Yearly'].includes(planType) && <Clock className="w-5 h-5 text-white" />}
                              </div>
                            </div>
                            <div className="text-start ml-4">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">{planType}</h3>
                              <p className="text-sm text-gray-500">
                                {planType === 'Custom' 
                                  ? `Valid for ${plan.validityDays} days` 
                                  : 'Perfect for getting started'
                                }
                              </p>
                            </div>
                          </div>

                          {/* Tab Buttons */}
                          <div className="px-5 pb-4">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => setActiveTab('regular')}
                                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                  activeTab === 'regular'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                Regular
                              </button>
                              {plan.bufferDays && plan.bufferFee && (
                                <button
                                  onClick={() => setActiveTab('buffer')}
                                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                                    activeTab === 'buffer'
                                      ? 'bg-white text-gray-900 shadow-sm'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  Buffer
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Content based on active tab */}
                          {activeTab === 'regular' ? (
                            <div className="px-5 pb-5">
                              {/* Features Section */}
                              <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Features</h4>
                                <div className="space-y-2">
                                  {plan.features && plan.features.length > 0 ? (
                                    plan.features
                                      .slice()
                                      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                                      .slice(0, 4)
                                      .map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center space-x-3">
                                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                          <span className="text-sm text-gray-700">{feature.title}</span>
                                        </div>
                                      ))
                                  ) : (
                                    <>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Gym access for {plan.validityDays} days</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Basic equipment access</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Mobile app access</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Basic support</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Pricing Section */}
                              <div className="border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Payment Amount</div>
                                    <div className="text-xl font-semibold text-gray-900">
                                      {plan.discountPercent && savings > 0 ? (
                                        <div className='flex flex-col items-start'>
                                          <span className="text-lg text-gray-400 line-through mr-2">₹{plan.price.toLocaleString()}</span>
                                          ₹{regularPrice.toLocaleString()}
                                        </div>
                                      ) : (
                                        `₹${regularPrice.toLocaleString()}`
                                      )}
                                    </div>
                                    {/* {plan.discountPercent && savings > 0 && (
                                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold mt-1 inline-block">
                                        {Math.round(plan.discountPercent)}% OFF
                                      </span>
                                    )}
                                    <div className="text-sm text-gray-500 mt-1">{plan.validityDays} days • {period}</div> */}
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => handleSubscribe(plan, activeTab)}
                                      disabled={hasActiveSubscription}
                                      className={`px-6 py-3 rounded-sm font-semibold text-white transition-all text-sm ${
                                        hasActiveSubscription
                                          ? 'bg-gray-300 cursor-not-allowed'
                                          : 'bg-gradient-to-br from-pink-400 to-red-500 bg-opacity-90 backdrop-blur-sm'
                                      }`}
                                    >
                                      {hasActiveSubscription ? 'Subscribed' : 'PAY NOW'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="px-5 pb-5">
                              {/* Buffer Plan Benefits */}
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Buffer Plan Benefits</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Regular {plan.validityDays}-day access</span>
                                    <span className="text-gray-900 font-medium">₹{regularPrice}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-orange-600">+ {plan.bufferDays} extra buffer days</span>
                                    <span className="text-orange-600 font-medium">₹{plan.bufferFee}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Regular price for extra days</span>
                                    <span className="line-through">₹{Math.round((regularPrice / plan.validityDays) * (plan.bufferDays || 0))}</span>
                                  </div>
                                  <hr className="border-gray-200" />
                                  <div className="flex justify-between font-semibold">
                                    <span className="text-gray-900">Total: {plan.validityDays + (plan.bufferDays || 0)} days</span>
                                    <span className="text-green-600">Save ₹{Math.round((regularPrice / plan.validityDays) * (plan.bufferDays || 0)) - (plan.bufferFee || 0)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Features Section */}
                              <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Features</h4>
                                <div className="space-y-2">
                                  {plan.features && plan.features.length > 0 ? (
                                    plan.features
                                      .slice()
                                      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
                                      .slice(0, 4)
                                      .map((feature, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center space-x-3">
                                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                          <span className="text-sm text-gray-700">{feature.title}</span>
                                        </div>
                                      ))
                                  ) : (
                                    <>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Gym access for {plan.validityDays + (plan.bufferDays || 0)} days</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Basic equipment access</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Mobile app access</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">Basic support</span>
                                      </div>
                                      <div className="flex items-center space-x-3">
                                        <Sparkles className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                        <span className="text-sm text-orange-700 font-medium">+ {plan.bufferDays} extra flexibility days</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Pricing Section */}
                              <div className="border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">Payment Amount</div>
                                    <div className="text-xl font-semibold text-gray-900">₹{bufferPrice.toLocaleString()}</div>
                                    {/* <div className="text-sm text-gray-500 mt-1">{plan.validityDays} days + {plan.bufferDays} buffer days • {period}</div> */}
                                  </div>
                                  <div>
                                    <button
                                      onClick={() => handleSubscribe(plan, activeTab)}
                                      disabled={hasActiveSubscription}
                                      className={`px-6 py-3 rounded-sm font-semibold text-white transition-all text-sm ${
                                        hasActiveSubscription
                                          ? 'bg-gray-300 cursor-not-allowed'
                                          : 'bg-gradient-to-br from-pink-400 to-red-500 bg-opacity-90 backdrop-blur-sm'
                                      }`}
                                    >
                                      {hasActiveSubscription ? 'Subscribed' : 'PAY NOW'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

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
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide
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
