import React from 'react';
import { Calendar, Clock, CreditCard } from 'lucide-react';

interface SubscriptionCardProps {
  id: string;
  appName: string;
  appIcon?: string;
  price: number;
  period: string;
  daysLeft: number;
  gradientFrom: string;
  gradientTo: string;
  paymentDue?: string;
  isActive?: boolean;
}

export function SubscriptionCard({
  id,
  appName,
  appIcon,
  price,
  period,
  daysLeft,
  gradientFrom,
  gradientTo,
  paymentDue,
  isActive = true
}: SubscriptionCardProps) {
  return (
    <div className={`relative rounded-2xl p-6 text-white overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
      
      {/* App icon and name */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {appIcon ? (
              <img src={appIcon} alt={appName} className="w-8 h-8 rounded-lg" />
            ) : (
              <span className="text-lg font-bold text-white">
                {appName.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{appName}</h3>
            {isActive && (
              <p className="text-white text-opacity-80 text-sm">Active subscription</p>
            )}
          </div>
        </div>
        
        {/* Status indicator */}
        {isActive && (
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </div>
      
      {/* Price */}
      <div className="relative z-10 mb-4">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold text-white">₹{price}</span>
          <span className="text-white text-opacity-80">/{period}</span>
        </div>
      </div>
      
      {/* Payment and time info */}
      <div className="relative z-10 space-y-2">
        {paymentDue && (
          <div className="flex items-center space-x-2 text-white text-opacity-90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Payment in {paymentDue}</span>
          </div>
        )}
        
        {daysLeft > 0 && (
          <div className="flex items-center space-x-2 text-white text-opacity-90">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{daysLeft} days left</span>
          </div>
        )}
      </div>
      
      {/* Manage button */}
      <div className="relative z-10 mt-4">
        <button className="w-full py-2 px-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm">
          Manage
        </button>
      </div>
    </div>
  );
}
