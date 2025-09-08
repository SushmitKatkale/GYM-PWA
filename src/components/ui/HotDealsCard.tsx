import React from 'react';
import { Calendar, Zap, Gift } from 'lucide-react';

interface HotDealsCardProps {
  id: string;
  appName: string;
  appIcon?: string;
  trialDays: number;
  originalPrice?: number;
  gradientFrom: string;
  gradientTo: string;
  description?: string;
  isPopular?: boolean;
}

export function HotDealsCard({
  id,
  appName,
  appIcon,
  trialDays,
  originalPrice,
  gradientFrom,
  gradientTo,
  description,
  isPopular = false
}: HotDealsCardProps) {
  return (
    <div className={`relative rounded-2xl p-4 text-white overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${isPopular ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -mr-12 -mt-12"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>
      
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
          🔥 HOT
        </div>
      )}
      
      {/* App icon */}
      <div className="relative z-10 mb-3">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          {appIcon ? (
            <img src={appIcon} alt={appName} className="w-8 h-8 rounded-lg" />
          ) : (
            <span className="text-lg font-bold text-white">
              {appName.charAt(0)}
            </span>
          )}
        </div>
      </div>
      
      {/* App name */}
      <div className="relative z-10 mb-2">
        <h3 className="text-base font-semibold text-white truncate">{appName}</h3>
        {description && (
          <p className="text-white text-opacity-80 text-xs mt-1">{description}</p>
        )}
      </div>
      
      {/* Trial offer */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center space-x-1 mb-1">
          <Gift className="w-4 h-4 text-white" />
          <span className="text-2xl font-bold text-white">{trialDays} days free</span>
        </div>
        {originalPrice && (
          <p className="text-white text-opacity-80 text-xs">
            Then ₹{originalPrice}/month
          </p>
        )}
      </div>
      
      {/* Try now button */}
      <div className="relative z-10">
        <button className="w-full py-2 px-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-white text-sm font-medium transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-2">
          <Zap className="w-4 h-4" />
          <span>Try Now</span>
        </button>
      </div>
    </div>
  );
}
