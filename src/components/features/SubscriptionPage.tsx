import { useState } from 'react';
import { CreditCard, Calendar, DollarSign, Star, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';

interface Subscription {
  id: string;
  planType: 'daily' | 'weekly' | 'monthly' | 'yearly';
  gymId: string;
  gymName: string;
  startDate: string;
  endDate: string;
  price: number;
  status: 'active' | 'expired' | 'cancelled';
  autoRenewal: boolean;
}

interface Plan {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export function SubscriptionPage() {
  const { user } = useAuthStore();
  const { gyms, addNotification } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedGym, setSelectedGym] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; discount: number } | null>(null);

  // Mock subscription data
  const [subscriptions] = useState<Subscription[]>([
    {
      id: '1',
      planType: 'monthly',
      gymId: 'gym1',
      gymName: 'FitZone Downtown',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      price: 59.99,
      status: 'active',
      autoRenewal: true
    },
    {
      id: '2',
      planType: 'weekly',
      gymId: 'gym2',
      gymName: 'PowerHouse Gym',
      startDate: '2023-12-15',
      endDate: '2023-12-22',
      price: 75,
      status: 'expired',
      autoRenewal: false
    }
  ]);

  const plans: Plan[] = [
    {
      type: 'daily',
      price: 15,
      duration: '1 Day',
      features: ['Full gym access', 'Basic equipment', 'Locker access']
    },
    {
      type: 'weekly',
      price: 75,
      originalPrice: 105,
      duration: '7 Days',
      features: ['Full gym access', 'Group classes', 'Locker access', 'Shower facilities']
    },
    {
      type: 'monthly',
      price: 59.99,
      originalPrice: 89.99,
      duration: '30 Days',
      features: ['Full gym access', 'All group classes', 'Personal trainer consultation', 'Locker access', 'Shower facilities', 'Nutrition guidance'],
      popular: true
    },
    {
      type: 'yearly',
      price: 599,
      originalPrice: 719.88,
      duration: '365 Days',
      features: ['Full gym access', 'All group classes', 'Monthly personal training', 'Locker access', 'Shower facilities', 'Nutrition guidance', 'Guest passes (5/month)', 'Priority booking']
    }
  ];

  const handleApplyDiscount = () => {
    const validCodes = {
      'WELCOME10': 10,
      'STUDENT20': 20,
      'FITNESS15': 15
    };
    
    if (validCodes[discountCode as keyof typeof validCodes]) {
      setAppliedDiscount({
        code: discountCode,
        discount: validCodes[discountCode as keyof typeof validCodes]
      });
      addNotification({
        title: 'Discount Applied!',
        message: `${discountCode} discount applied successfully`,
        type: 'success'
      });
    } else {
      addNotification({
        title: 'Invalid Code',
        message: 'The discount code you entered is not valid',
        type: 'error'
      });
    }
  };

  const handleSubscribe = (planType: string) => {
    if (!selectedGym) {
      addNotification({
        title: 'Select a Gym',
        message: 'Please select a gym before subscribing',
        type: 'warning'
      });
      return;
    }
    
    setSelectedPlan(planType);
    setShowPayment(true);
  };

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      addNotification({
        title: 'Subscription Activated!',
        message: `Your ${selectedPlan} subscription has been activated`,
        type: 'success'
      });
      setShowPayment(false);
      setSelectedPlan(null);
    }, 2000);
  };

  const calculatePrice = (basePrice: number) => {
    if (appliedDiscount) {
      return basePrice - (basePrice * appliedDiscount.discount / 100);
    }
    return basePrice;
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Current Subscriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">My Subscriptions</h2>
        <div className="space-y-4">
          {subscriptions.map((subscription) => {
            const daysLeft = getDaysUntilExpiry(subscription.endDate);
            return (
              <div key={subscription.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      subscription.status === 'active' ? 'bg-green-500' : 
                      subscription.status === 'expired' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{subscription.gymName}</h3>
                      <p className="text-sm text-gray-500 capitalize">{subscription.planType} Plan</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${subscription.price}</p>
                    <p className={`text-sm ${
                      subscription.status === 'active' && daysLeft <= 3 ? 'text-red-600' :
                      subscription.status === 'active' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {subscription.status === 'active' 
                        ? `${daysLeft} days left` 
                        : subscription.status === 'expired' 
                        ? 'Expired' 
                        : 'Cancelled'
                      }
                    </p>
                  </div>
                </div>
                {subscription.status === 'active' && (
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Auto-renewal: {subscription.autoRenewal ? 'On' : 'Off'}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Manage
                      </button>
                      <button className="text-sm text-red-600 hover:text-red-700">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gym Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Gym</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gyms.map((gym) => (
            <div
              key={gym.id}
              onClick={() => setSelectedGym(gym.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
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
              <h3 className="font-semibold text-gray-900">{gym.name}</h3>
              <p className="text-sm text-gray-500">{gym.address}</p>
              <div className="flex items-center mt-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">{gym.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Plan</h2>
        
        {/* Discount Code */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Have a discount code?</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter discount code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleApplyDiscount}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
          {appliedDiscount && (
            <div className="mt-2 flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-sm">{appliedDiscount.discount}% discount applied</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const finalPrice = calculatePrice(plan.price);
            return (
              <div
                key={plan.type}
                className={`relative border-2 rounded-xl p-6 ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } transition-colors`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {plan.type}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.duration}</p>
                  
                  <div className="mb-4">
                    {plan.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        ${plan.originalPrice}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-gray-900">
                      ${finalPrice.toFixed(2)}
                    </p>
                    {appliedDiscount && finalPrice !== plan.price && (
                      <p className="text-sm text-green-600">
                        Save ${(plan.price - finalPrice).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <ul className="text-sm text-gray-600 space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.type)}
                    disabled={!selectedGym}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Payment</h3>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium capitalize">{selectedPlan}</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">
                  ${calculatePrice(plans.find(p => p.type === selectedPlan)?.price || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit/Debit Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <DollarSign className="w-4 h-4 mr-2" />
                  Wallet Balance
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPayment(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
