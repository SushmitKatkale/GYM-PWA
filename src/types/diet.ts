export interface Meal {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;
  servings: number;
  verified: boolean;
  image?: string;
  ingredients?: string[];
  instructions?: string[];
  tags?: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface DietPlan {
  id: number;
  name: string;
  title?: string;
  description?: string;
  user_id: number;
  trainer_id?: number;
  status: 'active' | 'archived';
  goal?: string;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  trainer?: {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface DietChangeRequest {
  id: number;
  user_id: number;
  trainer_id?: number;
  plan_id?: number;
  request_type: 'general' | 'meal_change' | 'allergy' | 'preference' | 'nutrition_adjustment';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'fulfilled';
  trainer_response?: string;
  created_at: string;
  updated_at: string;
  responded_at?: string;
  user?: {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  trainer?: {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface MealStats {
  total: number;
  verified: number;
  pending: number;
  avgRating: number;
  totalViews: number;
}
