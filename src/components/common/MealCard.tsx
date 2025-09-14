import React from 'react';
import { Clock, Star } from 'lucide-react';
import { imageService } from '../../services/imageService';
import { DietPlanMeal } from '../../models/Diet';

interface MealCardProps {
  meal: DietPlanMeal;
  onClick?: () => void;
  showNutrition?: boolean;
  className?: string;
}

export const MealCard: React.FC<MealCardProps> = ({ 
  meal, 
  onClick, 
  showNutrition = false,
  className = '' 
}) => {
  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      className={`bg-white rounded-t-sm shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:border-gray-300 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Meal Image */}
      <div className="relative h-32 sm:h-40 bg-gray-100 overflow-hidden">
        <img
          src={meal.fullUrl || meal.image_url || imageService.getMealPlaceholder(
            meal.food_item || meal.name || 'Meal', 
            meal.meal_type
          )}
          alt={meal.food_item || meal.name || 'Meal'}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = imageService.getMealPlaceholder(
              meal.food_item || meal.name || 'Meal', 
              meal.meal_type
            );
          }}
        />
        
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {meal.is_mandatory && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-[0.5rem] font-medium">
              Required
            </span>
          )}
          {meal.preferred_time && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-[0.5rem] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(meal.preferred_time)}
            </span>
          )}
        </div>

        {/* Nutrition overlay - top right */}
        {showNutrition && meal.calories && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-[0.5rem]">
            {meal.calories} cal
          </div>
        )}
      </div>

      {/* Meal Info */}
      <div className="p-3 sm:p-4">
        <h3 className="text-lg font-medium text-gray-900 sm:text-base mb-1 line-clamp-1">
          {meal.food_item || meal.name || 'Unnamed Meal'}
        </h3>
        
        {meal.description && (
          <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
            {meal.description}
          </p>
        )}

        {/* Nutrition info - horizontal layout */}
        {showNutrition && (
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
            {meal.calories && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-[0.5rem]"></div>
                {meal.calories} cal
              </span>
            )}
            {meal.protein && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-[0.5rem]"></div>
                {meal.protein}g protein
              </span>
            )}
            {meal.carbs && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-[0.5rem]"></div>
                {meal.carbs}g carbs
              </span>
            )}
            {(meal.fat || meal.fats) && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-[0.5rem]"></div>
                {meal.fat || meal.fats}g fat
              </span>
            )}
          </div>
        )}

        {/* Alternative options indicator */}
        {meal.alternatives && (
          <div className="text-xs text-blue-600 flex items-center gap-1 mt-2">
            <Star className="w-3 h-3" />
            <span>Alternatives available</span>
          </div>
        )}
      </div>
    </div>
  );
};
