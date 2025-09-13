import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  DietPlan, 
  DietChangeRequest, 
  DietPlanHistory,
  DietStats,
  DietPlanFilters, 
  ChangeRequestFilters,
  CreateChangeRequestRequest
} from '../models/Diet';
import { dietService, PaginatedResponse } from '../services/dietService';

interface DietStore {
  // State
  userDietPlans: DietPlan[];
  selectedDietPlan: DietPlan | null;
  dietPlanHistory: DietPlanHistory[];
  changeRequests: DietChangeRequest[];
  dietStats: DietStats | null;
  isLoading: boolean;
  error: string | null;

  // Pagination state
  userPlansPage: number;
  userPlansTotalPages: number;
  changeRequestsPage: number;
  changeRequestsTotalPages: number;

  // Actions
  loadUserDietPlans: (filters?: DietPlanFilters) => Promise<void>;
  loadDietPlanById: (id: number) => Promise<void>;
  loadDietPlanHistory: (id: number) => Promise<void>;
  loadChangeRequests: (filters?: ChangeRequestFilters) => Promise<void>;
  submitChangeRequest: (request: CreateChangeRequestRequest) => Promise<void>;
  clearSelectedPlan: () => void;
  clearError: () => void;
  
  // Utility actions
  getDietPlanById: (id: number) => DietPlan | null;
  getMealsByType: (planId: number, mealType: string) => any[];
  getPlanMacroSummary: (plan: DietPlan) => { calories: number; protein: number; carbs: number; fats: number };
}

export const useDietStore = create<DietStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userDietPlans: [],
        selectedDietPlan: null,
        dietPlanHistory: [],
        changeRequests: [],
        dietStats: null,
        isLoading: false,
        error: null,

        // Pagination state
        userPlansPage: 1,
        userPlansTotalPages: 1,
        changeRequestsPage: 1,
        changeRequestsTotalPages: 1,

        // Actions
        loadUserDietPlans: async (filters?: DietPlanFilters) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await dietService.getUserDietPlans({
              ...filters,
              page: filters?.page || get().userPlansPage,
              limit: filters?.limit || 10
            });

            if (response.success && response.data) {
              const { dietPlans, pagination } = response.data;
              
              set({
                userDietPlans: dietPlans || [],
                userPlansPage: pagination.currentPage,
                userPlansTotalPages: pagination.totalPages,
                isLoading: false
              });
            } else {
              throw new Error(response.message || 'Failed to load diet plans');
            }
          } catch (error) {
            console.error('Error loading user diet plans:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load diet plans',
              isLoading: false
            });
          }
        },

        loadDietPlanById: async (id: number) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await dietService.getDietPlanById(id);

            if (response.success && response.data) {
              set({
                selectedDietPlan: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message || 'Failed to load diet plan');
            }
          } catch (error) {
            console.error('Error loading diet plan:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load diet plan',
              isLoading: false
            });
          }
        },

        loadDietPlanHistory: async (id: number) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await dietService.getDietPlanHistory(id);

            if (response.success && response.data) {
              set({
                dietPlanHistory: response.data,
                isLoading: false
              });
            } else {
              throw new Error(response.message || 'Failed to load diet plan history');
            }
          } catch (error) {
            console.error('Error loading diet plan history:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load diet plan history',
              isLoading: false
            });
          }
        },

        loadChangeRequests: async (filters?: ChangeRequestFilters) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await dietService.getChangeRequests({
              ...filters,
              page: filters?.page || get().changeRequestsPage,
              limit: filters?.limit || 10
            });

            if (response.success && response.data) {
              const { changeRequests, pagination } = response.data;
              
              set({
                changeRequests: changeRequests || [],
                changeRequestsPage: pagination.currentPage,
                changeRequestsTotalPages: pagination.totalPages,
                isLoading: false
              });
            } else {
              throw new Error(response.message || 'Failed to load change requests');
            }
          } catch (error) {
            console.error('Error loading change requests:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to load change requests',
              isLoading: false
            });
          }
        },

        submitChangeRequest: async (request: CreateChangeRequestRequest) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await dietService.createChangeRequest(request);

            if (response.success && response.data) {
              // Add the new change request to the list
              set(state => ({
                changeRequests: [response.data!, ...state.changeRequests],
                isLoading: false
              }));
            } else {
              throw new Error(response.message || 'Failed to create change request');
            }
          } catch (error) {
            console.error('Error creating change request:', error);
            set({ 
              error: error instanceof Error ? error.message : 'Failed to create change request',
              isLoading: false
            });
          }
        },

        clearSelectedPlan: () => {
          set({ 
            selectedDietPlan: null,
            dietPlanHistory: []
          });
        },

        clearError: () => {
          set({ error: null });
        },

        // Utility actions
        getDietPlanById: (id: number) => {
          const plans = get().userDietPlans;
          return plans.find(plan => plan.id === id) || null;
        },

        getMealsByType: (planId: number, mealType: string) => {
          const plan = get().getDietPlanById(planId);
          return plan?.meals?.filter(meal => meal.meal_type === mealType) || [];
        },

        getPlanMacroSummary: (plan: DietPlan) => {
          return {
            calories: plan.calories || 0,
            protein: plan.protein_g || 0,
            carbs: plan.carbs_g || 0,
            fats: plan.fats_g || 0
          };
        }
      }),
      {
        name: 'diet-storage',
        // Only persist non-sensitive data
        partialize: (state) => ({
          userDietPlans: state.userDietPlans,
          userPlansPage: state.userPlansPage,
          userPlansTotalPages: state.userPlansTotalPages
        })
      }
    ),
    {
      name: 'diet-store'
    }
  )
);
