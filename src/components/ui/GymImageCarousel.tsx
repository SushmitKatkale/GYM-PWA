import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface GymImage {
  id: number;
  url?: string;
  filePath?: string;
  title?: string;
}

interface GymImageCarouselProps {
  images: GymImage[];
  gymName: string;
  className?: string;
  fallbackImage?: string;
}

export const GymImageCarousel: React.FC<GymImageCarouselProps> = ({
  images,
  gymName,
  className = "relative h-48",
  fallbackImage
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!images || images.length === 0) {
    // No images available - show fallback or placeholder
    return (
      <div className={className}>
        {fallbackImage ? (
          <img
            src={fallbackImage}
            alt={gymName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-gray-500 text-sm">No image available</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  const validImages = images.filter((_, index) => !imageLoadErrors.has(index));
  
  // Auto-slide functionality
  const startAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (validImages.length > 1 && isAutoSliding && !isPaused && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      }, 10000); // 10 seconds
    }
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleAutoSlide = () => {
    setIsPaused(!isPaused);
  };
  
  const nextImage = () => {
    if (validImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
      // Temporarily pause auto-slide when user manually navigates
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    }
  };

  const prevImage = () => {
    if (validImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
      // Temporarily pause auto-slide when user manually navigates
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    }
  };

  const handleIndicatorClick = (index: number) => {
    setCurrentImageIndex(index);
    // Temporarily pause auto-slide when user clicks indicator
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
  };

  // Auto-slide effect
  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [validImages.length, isAutoSliding, isPaused, isHovered, currentImageIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAutoSlide();
  }, []);

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set([...prev, index]));
    
    // If current image failed and there are other images, move to next
    if (index === currentImageIndex && validImages.length > 1) {
      nextImage();
    }
  };

  const currentImage = validImages[currentImageIndex];
  const imageUrl = currentImage?.url || currentImage?.filePath;

  return (
    <div 
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {validImages.length > 0 ? (
        <>
          <img
            src={imageUrl}
            alt={`${gymName} image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            onError={() => handleImageError(currentImageIndex)}
          />
          
          {/* Navigation buttons - only show if more than 1 image */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          
          {/* Image indicators - only show if more than 1 image */}
          {validImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleIndicatorClick(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'bg-white'
                      : 'bg-white bg-opacity-50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Image counter and play/pause button */}
          {validImages.length > 1 && (
            <>
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                {currentImageIndex + 1} / {validImages.length}
              </div>
              
              {/* Play/Pause button */}
              <button
                onClick={toggleAutoSlide}
                className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                aria-label={isPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
                title={isPaused ? 'Resume auto-slide' : 'Pause auto-slide'}
              >
                {isPaused ? (
                  <Play className="w-3 h-3" />
                ) : (
                  <Pause className="w-3 h-3" />
                )}
              </button>
            </>
          )}
        </>
      ) : (
        // All images failed to load - show fallback
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-gray-500 text-sm">Images failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
};
