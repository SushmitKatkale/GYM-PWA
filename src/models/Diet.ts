export interface DietPlan {
  id: number;
  trainer_id?: number | null; // Now nullable - supports user-created plans
  user_id: number;
  title: string;
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  status: 'active' | 'archived';
  record_status: number;
  created_at: string;
  updated_at: string;
  // Relations
  trainer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      bio?: string;
    };
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      height_cm?: number;
      weight_kg?: number;
      gender?: string;
    };
  };
  meals?: DietPlanMeal[];
}

export interface DietPlanMeal {
  id: number;
  plan_id: number;
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  // Enhanced meal fields
  food_item?: string;
  description?: string;
  instructions?: string;
  quantity?: string;
  // Nutrition information
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  // Additional fields
  image_url?: string;
  preferred_time?: string;
  is_mandatory?: boolean;
  alternatives?: string;
  // Legacy field for backward compatibility
  meal_description?: string;
  record_status: number;
  created_at: string;
  updated_at?: string;
}

export interface DietChangeRequest {
  id: number;
  user_id: number;
  trainer_id?: number | null; // Now nullable - can be general requests
  plan_id?: number;
  // Enhanced change request fields
  request_type: 'general' | 'meal_change' | 'allergy' | 'preference' | 'nutrition_adjustment';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  // Legacy field for backward compatibility
  request_text?: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'fulfilled';
  trainer_response?: string;
  record_status: number;
  created_at: string;
  updated_at?: string;
  responded_at?: string;
  // Relations
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  trainer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  plan?: {
    id: number;
    title: string;
  };
}

export interface DietPlanHistory {
  id: number;
  plan_id: number;
  old_data: Record<string, any>;
  changed_by: number;
  changed_at: string;
  // Relations
  changer?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DietStats {
  plans: {
    total: number;
    active: number;
    archived: number;
    thisMonth: number;
  };
  changeRequests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    fulfilled: number;
  };
}

export interface CreateDietPlanRequest {
  user_id: number;
  title: string;
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  meals?: {
    meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
    meal_description: string;
  }[];
}

export interface UpdateDietPlanRequest {
  title?: string;
  description?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fats_g?: number;
  status?: 'active' | 'archived';
}

// Legacy interface for backward compatibility
export interface AddMealRequest {
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  meal_description: string;
}

// Enhanced meal creation interface
export interface CreateMealRequest {
  meal_type: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  food_item?: string;
  description?: string;
  instructions?: string;
  quantity?: string;
  // Nutrition information
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  // Additional fields
  image_url?: string;
  preferred_time?: string;
  is_mandatory?: boolean;
  alternatives?: string;
  // Legacy field for backward compatibility
  meal_description?: string;
}

export interface UpdateMealRequest {
  meal_type?: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  food_item?: string;
  description?: string;
  instructions?: string;
  quantity?: string;
  // Nutrition information
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  // Additional fields
  image_url?: string;
  preferred_time?: string;
  is_mandatory?: boolean;
  alternatives?: string;
  // Legacy field for backward compatibility
  meal_description?: string;
}

// Legacy interface for backward compatibility
export interface CreateChangeRequestRequest {
  trainer_id: number;
  plan_id?: number;
  request_text: string;
}

// Enhanced change request interface
export interface CreateEnhancedChangeRequestRequest {
  trainer_id?: number | null;
  plan_id?: number;
  request_type: 'general' | 'meal_change' | 'allergy' | 'preference' | 'nutrition_adjustment';
  description: string;
  urgency?: 'low' | 'medium' | 'high';
  // Legacy field for backward compatibility
  request_text?: string;
}

export interface RespondToChangeRequestRequest {
  status: 'in_progress' | 'approved' | 'rejected' | 'fulfilled';
  trainer_response?: string;
}

export interface DietPlanFilters {
  status?: 'active' | 'archived';
  page?: number;
  limit?: number;
  user_id?: number;
}

export interface ChangeRequestFilters {
  status?: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'fulfilled';
  request_type?: 'general' | 'meal_change' | 'allergy' | 'preference' | 'nutrition_adjustment';
  urgency?: 'low' | 'medium' | 'high';
  trainer_id?: number;
  user_id?: number;
  plan_id?: number;
  page?: number;
  limit?: number;
}

export interface MealFilters {
  meal_type?: 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'other';
  plan_id?: number;
  is_mandatory?: boolean;
  page?: number;
  limit?: number;
}

export interface DietStatsFilters {
  startDate?: string;
  endDate?: string;
}
