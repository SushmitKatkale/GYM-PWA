import React from 'react';
import { Calendar, Clock, MapPin, Star, IndianRupee, Navigation, FileText, Eye } from 'lucide-react';

interface GymSubscriptionCardProps {
  subscription: {
    id: number;
    subscriptionId: number;
    userEmail: string;
    validFrom: string;
    validTo: string;
    activeStatus: boolean;
    subscription: {
      id: number;
      title: string;
      validityDays: number;
      price: number;
      discountedPrice?: number;
      gym: {
        id: number;
        name: string;
        address: string;
        city: string;
        rating: number;
      };
    };
    payment: {
      id: number;
      paymentAmount: number;
      status: 'pending' | 'completed' | 'failed' | 'cancelled';
      gateway: 'razorpay' | 'phonepe';
    };
  };
  onViewDetails: (subscription: any) => void;
  onDownloadInvoice: (paymentId: number) => void;
  onOpenMaps: (gym: any) => void;
  gradientIndex: number;
}

// const activeGradients = [
//   'from-emerald-500 to-teal-600',
//   'from-blue-500 to-indigo-600',
//   'from-purple-500 to-violet-600',
//   'from-cyan-500 to-blue-600',
//   'from-green-500 to-emerald-600',
//   'from-indigo-500 to-purple-600',
// ];

// const expiringGradients = [
//   'from-yellow-500 to-orange-600',
//   'from-orange-500 to-amber-600',
//   'from-amber-500 to-yellow-600',
// ];

// const expiredGradients = [
//   'from-gray-500 to-slate-600',
//   'from-slate-500 to-gray-600',
//   'from-stone-500 to-neutral-600',
// ];

// Active → stronger, vibrant red/pink blends
const activeGradients = [
  'from-[#a51c2e] via-[#c87883] to-[#fbf5f6]',  // deep red → soft pink → light bg
  'from-[#a51c2e] via-[#c97c87] to-[#a41a2c]',  // red → dusty pink → darker red
  'from-[#a31729] via-[#c87883] to-[#a51b2d]',  // crimson → pink → crimson
];

// Expiring → warmer amber + brand red (warning but still on-brand)
const expiringGradients = [
  'from-yellow-400 via-orange-500 to-[#a51c2e]',  // yellow → orange → brand red
  'from-amber-500 via-[#c87883] to-[#a41a2c]',   // amber → soft pink → dark red
  'from-orange-400 via-[#c97c87] to-[#a31729]',  // orange → dusty pink → crimson
];

// Expired → muted grays with a hint of brand red (subtle but consistent)
const expiredGradients = [
  'from-gray-400 via-gray-500 to-[#a51c2e]',     // gray fade with brand red undertone
  'from-slate-500 via-stone-600 to-[#c87883]',   // muted gray → soft pink highlight
  'from-neutral-500 via-gray-600 to-[#a41b2d]',  // grayish → crimson tint
];



export function GymSubscriptionCard({
  subscription,
  onViewDetails,
  onDownloadInvoice,
  onOpenMaps,
  gradientIndex
}: GymSubscriptionCardProps) {
  const getDaysRemaining = (validTo: string) => {
    const today = new Date();
    const expiry = new Date(validTo);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(subscription.endDate);
  const isExpiring = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  // Choose gradient based on status
  let gradient: string;
  if (isExpired || !subscription.activeStatus) {
    gradient = expiredGradients[gradientIndex % expiredGradients.length];
  } else if (isExpiring) {
    gradient = expiringGradients[gradientIndex % expiringGradients.length];
  } else {
    gradient = activeGradients[gradientIndex % activeGradients.length];
  }

  return (
    <div className={`relative rounded-2xl p-6 text-white overflow-hidden bg-gradient-to-br ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${isExpired ? 'opacity-80' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>

      <div onClick={() => onViewDetails(subscription)}>
        {/* Status indicators */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {subscription.activeStatus && !isExpired && !isExpiring && (
            <div className="flex items-center space-x-1 bg-green-400 bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-white">Active</span>
            </div>
          )}
          {isExpiring && (
            <div className="bg-yellow-400 bg-opacity-90 text-yellow-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              ⚠️ Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
            </div>
          )}
          {isExpired && (
            <div className="bg-red-400 bg-opacity-90 text-red-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              🚫 Expired
            </div>
          )}
          {!subscription.recordStatus && !isExpired && (
            <div className="bg-gray-400 bg-opacity-90 text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
              ⏸️ Inactive
            </div>
          )}
        </div>

        {/* Gym info */}
        <div className="relative z-10 mb-4 mt-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-lg font-semibold text-white">
                {subscription.subscription.gym.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white truncate">
                {subscription.subscription.gym.name}
              </h3>
              <div className="flex items-center space-x-2 text-white text-opacity-80">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">{subscription.subscription.gym.rating}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start text-white text-opacity-90 mb-2">
            <MapPin className="w-4 h-4 min-w-4 min-h-4 mt-1 mr-2" />
            <p className="text-sm">{`${subscription.subscription.gym.address}, ${subscription.subscription.gym.city}, ${subscription.subscription.gym.state}, ${subscription.subscription.gym.zipCode}`}</p>
          </div>
        </div>

        {/* Subscription plan */}
        <div className="relative z-10 mb-4">
          <h4 className="text-xl font-medium text-white mb-2">
            {subscription.subscription.name}
          </h4>
          <div className="flex items-baseline space-x-1 mb-2">
            <IndianRupee className="w-5 h-5 text-white" />
            <span className="text-2xl font-medium text-white">
              {parseFloat(subscription.payment.amount)}
            </span>
            <span className="text-white text-opacity-80">
              /{parseInt(subscription.subscription.validityDays) + (subscription.payment.isBuffer ? parseInt(subscription.subscription.bufferDays) : 0 || 0)}d
            </span>
          </div>
        </div>

        {/* Duration and status */}
        <div className="relative z-10 space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-white text-opacity-90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {new Date(subscription.startDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })} - {new Date(subscription.endDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>

          </div>

          <div className="flex items-center space-x-2 text-white text-opacity-90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 flex space-x-2">
        <button
          onClick={() => onOpenMaps(subscription.subscription.gym)}
          className="flex-1 py-2 px-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-1"
        >
          <Navigation className="w-4 h-4" />
          <span>Navigate</span>
        </button>

        {subscription.payment.status === 1 && (
          <button
            onClick={() => onDownloadInvoice(subscription.payment.id)}
            className="flex-1 py-2 px-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-1"
          >
            <FileText className="w-4 h-4" />
            <span>Invoice</span>
          </button>
        )}
      </div>
    </div>
  );
}
