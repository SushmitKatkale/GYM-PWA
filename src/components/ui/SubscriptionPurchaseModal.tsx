import React, { useState } from 'react';
import { X, CreditCard, IndianRupee, AlertCircle, Check, Star, Zap, Crown } from 'lucide-react';
import { PaymentGatewayModal } from '../payments/PaymentGatewayModal';

interface SubscriptionDetails {
  planType: string;
  price: number;
  discountedPrice?: number;
  gymName: string;
  validityDays: number;
  id: string;
  features?: (string | { title?: string; name?: string; isHighlighted?: boolean; [key: string]: any })[];
  isMostPopular?: boolean;
  isCheapest?: boolean;
  amenities?: (string | { name?: string; title?: string; [key: string]: any })[];
  location?: string;
}

interface SubscriptionPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (subscriptionId: string) => void;
  subscriptions: SubscriptionDetails[];
}

const SubscriptionPurchaseModal: React.FC<SubscriptionPurchaseModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  subscriptions
}) => {

if (!isOpen || subscriptions.length === 0) return null;

  const formatPlanDuration = (days: number) => {
    if (days === 1) return '1 Day';
    if (days === 7) return '1 Week';
    if (days === 30) return '1 Month';
    if (days === 365) return '1 Year';
    return `${days} Days`;
  };

  const gymName = subscriptions[0]?.gymName || 'Gym';
  const gymAmenities = subscriptions[0]?.amenities || [];
  const gymLocation = subscriptions[0]?.location || 'Location not available';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Choose Your Plan
              </h3>
              <p className="text-gray-600 text-sm mt-1">{gymName}</p>
              <p className="text-gray-500 text-xs mt-1">{gymLocation}</p>
              {gymAmenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {gymAmenities.slice(0, 4).map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {typeof amenity === 'string' ? amenity : amenity.name || amenity.title || 'Amenity'}
                    </span>
                  ))}
                  {gymAmenities.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{gymAmenities.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subscription Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => {
              const finalPrice = subscription.discountedPrice || subscription.price;
              const hasDiscount = subscription.discountedPrice && subscription.discountedPrice < subscription.price;
              return (
                <div 
                  key={subscription.id} 
                  className="relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 transition-colors cursor-pointer"
                  onClick={() => onSelectPlan(subscription.id)}
                >
                  {/* Tags */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {subscription.isMostPopular && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        MOST POPULAR
                      </span>
                    )}
                    {subscription.isCheapest && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        BEST VALUE
                      </span>
                    )}
                  </div>

                  {/* Plan Header */}
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {subscription.planType}
                    </h4>
                    <div className="mb-2">
                      {hasDiscount && (
                        <span className="text-sm line-through text-gray-400 mr-2">
                          ₹{subscription.price}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-green-600">
                        ₹{finalPrice}
                      </span>
                    </div>
                    {hasDiscount && (
                      <div className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium mb-2">
                        {Math.round(((subscription.price - finalPrice) / subscription.price) * 100)}% OFF
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      Valid for {formatPlanDuration(subscription.validityDays)}
                    </p>
                  </div>

                  {/* Features */}
                  {subscription.features && subscription.features.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4">
                        What's Included
                      </h5>
                      <div className="space-y-2">
                        {subscription.features.map((feature, index) => {
                          const isHighlighted = typeof feature === 'object' && feature.isHighlighted;
                          const featureText = typeof feature === 'string' ? feature : feature.title || feature.name || 'Feature';
                          
                          return (
                            <div key={index} className={`flex items-center text-sm p-2 rounded-md transition-colors ${
                              isHighlighted 
                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-3 border-blue-500 text-blue-900 font-medium' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-3 flex-shrink-0 ${
                                isHighlighted ? 'bg-blue-500' : 'bg-green-500'
                              }`}></div>
                              <span className="leading-relaxed">
                                {featureText}
                              </span>
                              {isHighlighted && (
                                <Zap className="w-3 h-3 text-blue-500 ml-auto flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pay Now Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(subscription.id);
                    }}
                    className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                  >
                    Pay Now
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionPurchaseModal;
