// Exercise Management Components
export { ExerciseList } from './ExerciseList';
export { ExerciseDetail } from './ExerciseDetail';

// Slot Booking Components
export { SlotBooking } from './SlotBooking';
export { BookingManagement } from './BookingManagement';

// Video Player Component
export { VideoPlayer } from '../common/VideoPlayer';

// Exercise Service
export { exerciseService, ExerciseService } from '../../services/exerciseService';
export type { 
  Exercise, 
  ExerciseFilters, 
  ExerciseResponse,
  CategoryResponse,
  MuscleGroupsResponse,
  EquipmentResponse
} from '../../services/exerciseService';
