import React, { useState } from 'react';
import { CreditCard, Calendar, MapPin, Star, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'daily' | 'weekly' | 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

interface UserSubscription {
  id: string;
  gymId: string;
  gymName: string;
  planId: string;
  planName: string;
  planType: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

export function SubscriptionManagement() {
  const { user } = useAuth();
  const { gyms } = useApp();
  const [activeTab, setActiveTab] = useState<'current' | 'plans' | 'history'>('current');
  const [selectedGym, setSelectedGym] = useState<string>('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic-daily',
      name: 'Basic Daily',
      price: 15,
      duration: 'daily',
      features: ['Gym Access', 'Basic Equipment', 'Locker Room']
    },
    {
      id: 'premium-weekly',
      name: 'Premium Weekly',
      price: 89,
      duration: 'weekly',
      features: ['Gym Access', 'All Equipment', 'Group Classes', 'Personal Trainer (1 session)'],
      popular: true
    },
    {
      id: 'basic-monthly',
      name: 'Basic Monthly',
      price: 299,
      duration: 'monthly',
      features: ['Gym Access', 'Basic Equipment', 'Locker Room', 'Nutrition Consultation']
    },
    {
      id: 'premium-monthly',
      name: 'Premium Monthly',
      price: 599,
      duration: 'monthly',
      features: ['Gym Access', 'All Equipment', 'Unlimited Classes', 'Personal Trainer (4 sessions)', 'Nutrition Plan'],
      popular: true
    },
    {
      id: 'annual-premium',
      name: 'Annual Premium',
      price: 5999,
      duration: 'yearly',
      features: ['Everything Included', 'Unlimited Access', 'Personal Trainer (Weekly)', 'Meal Plans', 'Priority Booking']
    }
  ];

  const userSubscriptions: UserSubscription[] = [
    {
      id: 'sub-1',
      gymId: 'gym-1',
      gymName: 'FitZone Downtown',
      planId: 'premium-monthly',
      planName: 'Premium Monthly',
      planType: 'monthly',
      amount: 599,
      startDate: '2025-01-01',
      endDate: '2025-02-01',
      status: 'active',
      autoRenew: true
    },
    {
      id: 'sub-2',
      gymId: 'gym-2',
      gymName: 'PowerGym Elite',
      planId: 'basic-monthly',
      planName: 'Basic Monthly',
      planType: 'monthly',
      amount: 299,
      startDate: '2024-12-01',
      endDate: '2025-01-01',
      status: 'expired',
      autoRenew: false
    }
  ];

  const activeSubscriptions = userSubscriptions.filter(sub => sub.status === 'active');
  const expiredSubscriptions = userSubscriptions.filter(sub => sub.status === 'expired' || sub.status === 'cancelled');

  const handleSubscribe = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    console.log('Cancelling subscription:', subscriptionId);
  };

  const handleToggleAutoRenew = (subscriptionId: string) => {
    console.log('Toggling auto-renew for:', subscriptionId);
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'daily': return 'per day';
      case 'weekly': return 'per week';
      case 'monthly': return 'per month';
      case 'yearly': return 'per year';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
        <p className="text-gray-600">Manage your gym memberships and subscription plans</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex bg-gray-200 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'current' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
            }`}
          >
            Current Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'plans' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
            }`}
          >
            Available Plans
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'history' ? 'bg-white shadow-sm text-green-600' : 'text-gray-600'
            }`}
          >
            Subscription History
          </button>
        </div>
      </div>

      {/* Current Subscriptions Tab */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {activeSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeSubscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subscription.gymName}</h3>
                      <p className="text-sm text-gray-600">{subscription.planName}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {getStatusIcon(subscription.status)}
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="font-semibold text-gray-900">${subscription.amount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Start Date</span>
                      <span className="text-sm text-gray-900">{new Date(subscription.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">End Date</span>
                      <span className="text-sm text-gray-900">{new Date(subscription.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto Renew</span>
                      <button
                        onClick={() => handleToggleAutoRenew(subscription.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          subscription.autoRenew ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            subscription.autoRenew ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCancelSubscription(subscription.id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button className="flex-1 px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      Upgrade
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No active subscriptions</p>
              <p className="text-sm text-gray-400 mb-4">Subscribe to a gym to start your fitness journey</p>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Browse Plans
              </button>
            </div>
          )}
        </div>
      )}

      {/* Available Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <select
              value={selectedGym}
              onChange={(e) => setSelectedGym(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Gyms</option>
              {gyms.map((gym) => (
                <option key={gym.id} value={gym.id}>{gym.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${
                plan.popular ? 'border-green-500' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-sm text-gray-600 ml-1">{getDurationLabel(plan.duration)}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {[...activeSubscriptions, ...expiredSubscriptions].map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{subscription.gymName}</h3>
                    <p className="text-sm text-gray-600">{subscription.planName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${subscription.amount}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(subscription.startDate).toLocaleDateString()} - {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                    {getStatusIcon(subscription.status)}
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Subscribe to {selectedPlan.name}</h3>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center">
                  <span className="text-2xl font-bold text-gray-900">${selectedPlan.price}</span>
                  <span className="text-sm text-gray-600 ml-1">{getDurationLabel(selectedPlan.duration)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Subscribing to:', selectedPlan);
                  setShowUpgradeModal(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
