import React from 'react';
import { SubscriptionCard } from '../ui/SubscriptionCard';
import { HotDealsCard } from '../ui/HotDealsCard';
import { GymSubscriptionCard } from '../ui/GymSubscriptionCard';

export function SubscriptionDemo() {
  // Mock data for app subscription cards (like your image)
  const appSubscriptions = [
    {
      id: '1',
      appName: 'Tidal',
      price: 99,
      period: 'month',
      daysLeft: 22,
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-purple-600',
      paymentDue: '22 days',
      isActive: true
    },
    {
      id: '2',
      appName: 'MS Office 365',
      price: 489,
      period: 'month',
      daysLeft: 15,
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-600',
      paymentDue: '15 days',
      isActive: true
    }
  ];

  // Mock data for hot deals
  const hotDeals = [
    {
      id: '1',
      appName: 'Spotify',
      trialDays: 30,
      originalPrice: 119,
      gradientFrom: 'from-green-500',
      gradientTo: 'to-emerald-600',
      description: 'Music streaming',
      isPopular: true
    },
    {
      id: '2',
      appName: 'Netflix',
      trialDays: 7,
      originalPrice: 649,
      gradientFrom: 'from-red-500',
      gradientTo: 'to-rose-600',
      description: 'Video streaming'
    },
    {
      id: '3',
      appName: 'Adobe CC',
      trialDays: 30,
      originalPrice: 1699,
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-600',
      description: 'Creative suite'
    }
  ];

  // Mock data for gym subscriptions
  const gymSubscriptions = [
    {
      id: 1,
      subscriptionId: 1,
      paymentId: 1,
      userEmail: 'user@example.com',
      validFrom: '2024-01-01',
      validTo: '2024-12-31',
      bufferDays: 5,
      activeStatus: true,
      createTimestamp: '2024-01-01T00:00:00Z',
      subscription: {
        id: 1,
        title: 'Gold Membership',
        validityDays: 365,
        price: 15000,
        gym: {
          id: 1,
          name: 'FitMax Gym',
          address: '123 Fitness Street',
          city: 'Mumbai',
          rating: 4.5
        }
      },
      payment: {
        id: 1,
        paymentAmount: 15000,
        status: 'completed' as const,
        gateway: 'razorpay' as const
      }
    },
    {
      id: 2,
      subscriptionId: 2,
      paymentId: 2,
      userEmail: 'user@example.com',
      validFrom: '2024-01-15',
      validTo: '2024-04-15',
      bufferDays: 3,
      activeStatus: true,
      createTimestamp: '2024-01-15T00:00:00Z',
      subscription: {
        id: 2,
        title: 'Silver Plan',
        validityDays: 90,
        price: 4500,
        gym: {
          id: 2,
          name: 'PowerHouse Fitness',
          address: '456 Strength Ave',
          city: 'Delhi',
          rating: 4.8
        }
      },
      payment: {
        id: 2,
        paymentAmount: 4500,
        status: 'completed' as const,
        gateway: 'phonepe' as const
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Subscription Management Demo
        </h1>

        {/* App Subscriptions (like your image inspiration) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">App Subscriptions Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                {...subscription}
              />
            ))}
          </div>
        </section>

        {/* Hot Deals */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <span>Hot Deals</span>
            <span className="text-2xl">🔥</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotDeals.map((deal) => (
              <HotDealsCard
                key={deal.id}
                {...deal}
              />
            ))}
          </div>
        </section>

        {/* Gym Subscriptions (actual app data structure) */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Gym Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {gymSubscriptions.map((subscription, index) => (
              <GymSubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onViewDetails={(sub) => console.log('View details:', sub)}
                onDownloadInvoice={(id) => console.log('Download invoice:', id)}
                onOpenMaps={(gym) => console.log('Open maps:', gym)}
                gradientIndex={index}
              />
            ))}
          </div>
        </section>

        <div className="text-center text-gray-500 text-sm">
          <p>✨ Modern subscription cards with gradient backgrounds</p>
          <p className="mt-1">Inspired by your design mockup</p>
        </div>
      </div>
    </div>
  );
}
