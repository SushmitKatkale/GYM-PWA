// Exercise Management Components
export { ExerciseList } from './ExerciseList';
export { ExerciseDetail } from './ExerciseDetail';

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
