import React from 'react';
import { ChevronRight, Utensils } from 'lucide-react';
import { MealCard } from './MealCard';
import { DietPlanMeal } from '../../models/Diet';

interface MealsSectionProps {
  meals: DietPlanMeal[];
  onMealClick?: (meal: DietPlanMeal) => void;
  onSectionClick?: (mealType: string, meals: DietPlanMeal[]) => void;
  showNutrition?: boolean;
  compact?: boolean;
  className?: string;
}

export const MealsSection: React.FC<MealsSectionProps> = ({
  meals,
  onMealClick,
  onSectionClick,
  showNutrition = false,
  compact = false,
  className = ''
}) => {
  // Group meals by type
  const groupMealsByType = (meals: DietPlanMeal[]) => {
    const grouped = meals.reduce((acc, meal) => {
      if (!acc[meal.meal_type]) {
        acc[meal.meal_type] = [];
      }
      acc[meal.meal_type].push(meal);
      return acc;
    }, {} as Record<string, DietPlanMeal[]>);

    // Sort meal types by typical order
    const order = ['breakfast', 'snack', 'lunch', 'snack', 'dinner', 'snack', 'other'];
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
      const aIndex = order.indexOf(a.toLowerCase());
      const bIndex = order.indexOf(b.toLowerCase());
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return sortedEntries;
  };

  const getMealTypeDisplayName = (mealType: string) => {
    const mealTypeMap: Record<string, string> = {
      'breakfast': 'Breakfast',
      'lunch': 'Lunch',
      'snack': 'Snack',
      'dinner': 'Dinner',
      'other': 'Other'
    };
    return mealTypeMap[mealType] || mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  const getMealTypeColor = (mealType: string) => {
    const colorMap: Record<string, string> = {
      'breakfast': 'text-yellow-600',
      'lunch': 'text-blue-600',
      'dinner': 'text-purple-600',
      'snack': 'text-green-600',
      'other': 'text-gray-600'
    };
    return colorMap[mealType] || 'text-gray-600';
  };

  if (meals.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Meals Available
        </h3>
        <p className="text-gray-500 text-sm">
          This diet plan doesn't have any meals assigned yet.
        </p>
      </div>
    );
  }

  const mealsByType = groupMealsByType(meals);

  return (
    <div className={`space-y-6 ${className}`}>
      {mealsByType.map(([mealType, typeMeals]) => (
        <div key={mealType} className="space-y-3">
          {/* Section Header */}
          <div 
            className={`flex items-center justify-between ${onSectionClick ? 'cursor-pointer' : ''}`}
            onClick={() => onSectionClick?.(mealType, typeMeals)}
          >
            <div className="flex items-center space-x-2">
              <h3 className={`text-lg font-medium ${getMealTypeColor(mealType)}`}>
                {getMealTypeDisplayName(mealType)}
              </h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-[0.5rem]">
                {typeMeals.length} {typeMeals.length === 1 ? 'Meal' : 'Meals'}
              </span>
            </div>
            {/* {onSectionClick && (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )} */}
          </div>

          {/* Meals Grid */}
          {compact ? (
            // Compact horizontal scrollable view
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {typeMeals.map((meal, index) => (
                <MealCard
                  key={meal.id || `${mealType}-${index}`}
                  meal={meal}
                  onClick={() => onMealClick?.(meal)}
                  showNutrition={showNutrition}
                  className="flex-shrink-0 w-48"
                />
              ))}
            </div>
          ) : (
            // Full grid view
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {typeMeals.map((meal, index) => (
                <MealCard
                  key={meal.id || `${mealType}-${index}`}
                  meal={meal}
                  onClick={() => onMealClick?.(meal)}
                  showNutrition={showNutrition}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
