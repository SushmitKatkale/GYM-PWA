import React from 'react';
import { BRAND, BrandLogoProps, LOGO_SIZES, TEXT_SIZES } from '../../constants/branding';

export function BrandLogo({ 
  size = 'md', 
  variant = 'full', 
  className = '', 
  showTagline = false 
}: BrandLogoProps) {
  const iconSize = LOGO_SIZES[size];
  const textSize = TEXT_SIZES[size];

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={BRAND.logo.icon} 
          alt={BRAND.name}
          className={`${iconSize} object-contain`}
          onError={(e) => {
            // Fallback to PNG if SVG fails
            const target = e.target as HTMLImageElement;
            target.src = BRAND.logo.iconPng192;
          }}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <h1 className={`font-bold text-gray-900 ${textSize}`}>
          {BRAND.name}
        </h1>
        {showTagline && (
          <p className="text-gray-600 text-sm">
            {BRAND.shortTagline}
          </p>
        )}
      </div>
    );
  }

  // Full variant (icon + text)
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={BRAND.logo.icon} 
        alt={BRAND.name}
        className={`${iconSize} object-contain flex-shrink-0`}
        onError={(e) => {
          // Fallback to PNG if SVG fails
          const target = e.target as HTMLImageElement;
          target.src = BRAND.logo.iconPng192;
        }}
      />
      <div className="flex flex-col">
        <h1 className={`font-bold text-gray-900 ${textSize} leading-tight`}>
          {BRAND.name}
        </h1>
        {showTagline && (
          <p className="text-gray-600 text-sm leading-tight">
            {BRAND.shortTagline}
          </p>
        )}
      </div>
    </div>
  );
}

// Light variant for use on dark backgrounds
export function BrandLogoLight({ 
  size = 'md', 
  variant = 'full', 
  className = '', 
  showTagline = false 
}: BrandLogoProps) {
  const iconSize = LOGO_SIZES[size];
  const textSize = TEXT_SIZES[size];

  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src={BRAND.logo.icon} 
          alt={BRAND.name}
          className={`${iconSize} object-contain filter brightness-0 invert`}
          onError={(e) => {
            // Fallback to PNG if SVG fails
            const target = e.target as HTMLImageElement;
            target.src = BRAND.logo.iconPng192;
          }}
        />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex flex-col ${className}`}>
        <h1 className={`font-bold text-white ${textSize}`}>
          {BRAND.name}
        </h1>
        {showTagline && (
          <p className="text-white/80 text-sm">
            {BRAND.shortTagline}
          </p>
        )}
      </div>
    );
  }

  // Full variant (icon + text)
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={BRAND.logo.icon} 
        alt={BRAND.name}
        className={`${iconSize} object-contain flex-shrink-0 filter brightness-0 invert`}
        onError={(e) => {
          // Fallback to PNG if SVG fails  
          const target = e.target as HTMLImageElement;
          target.src = BRAND.logo.iconPng192;
        }}
      />
      <div className="flex flex-col">
        <h1 className={`font-bold text-white ${textSize} leading-tight`}>
          {BRAND.name}
        </h1>
        {showTagline && (
          <p className="text-white/80 text-sm leading-tight">
            {BRAND.shortTagline}
          </p>
        )}
      </div>
    </div>
  );
}
