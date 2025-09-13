import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Flame, Target, Users, Star, 
  Dumbbell, Heart, Zap, Share2, Bookmark, 
  BookmarkCheck, Play, RotateCcw, Timer,
  Info, CheckCircle, AlertCircle
} from 'lucide-react';
import { Exercise, exerciseService, ExerciseService } from '../../services/exerciseService';
import { VideoPlayer } from '../common/VideoPlayer';

interface ExerciseDetailProps {
  exerciseId: number;
  onBack: () => void;
}

export const ExerciseDetail: React.FC<ExerciseDetailProps> = ({ exerciseId, onBack }) => {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'instructions' | 'details'>('overview');
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    loadExercise();
  }, [exerciseId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isResting, restTimer]);

  const loadExercise = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await exerciseService.getExerciseById(parseInt(exerciseId.id));
      
      if (response.success) {
        setExercise(response.data);
      } else {
        setError('Exercise not found');
      }
    } catch (err) {
      setError('Failed to load exercise details');
      console.error('Error loading exercise:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    setWorkoutStarted(true);
    setCurrentSet(1);
  };

  const handleCompleteSet = () => {
    if (exercise?.sets && currentSet < exercise.sets) {
      setCurrentSet(prev => prev + 1);
      if (exercise.restTime) {
        setRestTimer(exercise.restTime);
        setIsResting(true);
      }
    } else {
      // Workout completed
      setWorkoutStarted(false);
      setCurrentSet(1);
      setIsResting(false);
      setRestTimer(0);
    }
  };

  const handleShare = async () => {
    if (navigator.share && exercise) {
      try {
        await navigator.share({
          title: exercise.exerciseTitle,
          text: exercise.description || 'Check out this exercise!',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      if (exercise) {
        navigator.clipboard.writeText(window.location.href);
        // Could show a toast notification here
      }
    }
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to user's bookmarks
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-poppins">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">Error</h2>
          <p className="text-gray-600 mb-4 font-poppins">{error}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-poppins"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-900 font-poppins line-clamp-1">
                  {exercise.exerciseTitle}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ExerciseService.getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ExerciseService.getCategoryColor(exercise.category)}`}>
                    {exercise.category}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleBookmark}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-purple-600" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      {(exercise.media?.primaryVideo || exercise.youtubeUrl) && (
        <div className="p-4">
          <VideoPlayer
            videoUrl={exercise.media?.primaryVideo?.fullUrl || exercise.media?.primaryVideo?.url || exercise.youtubeUrl!}
            thumbnailUrl={exercise.media?.primaryThumbnail?.fullUrl || exercise.media?.primaryThumbnail?.url || exercise.youtubeThumbnail || exercise.thumbnailUrl}
            title={exercise.exerciseTitle}
            className="w-full"
            lazyLoad={true}
            preload="metadata"
            muted={true}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            {exercise.duration && (
              <div>
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium">{ExerciseService.formatDuration(exercise.duration)}</p>
              </div>
            )}
            
            {exercise.calories && (
              <div>
                <Flame className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Calories</p>
                <p className="text-sm font-medium">{exercise.calories}</p>
              </div>
            )}
            
            {exercise.sets && (
              <div>
                <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Sets</p>
                <p className="text-sm font-medium">{exercise.sets}</p>
              </div>
            )}
            
            {exercise.reps && (
              <div>
                <RotateCcw className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Reps</p>
                <p className="text-sm font-medium">{exercise.reps}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workout Controls */}
      {!workoutStarted ? (
        <div className="px-4 pb-4">
          <button
            onClick={handleStartWorkout}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-poppins font-medium flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>Start Exercise</span>
          </button>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4">
            {/* Current Set Display */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900 font-poppins">
                Set {currentSet} of {exercise.sets || 1}
              </p>
              {exercise.reps && (
                <p className="text-gray-600 font-poppins">{exercise.reps} reps</p>
              )}
            </div>

            {/* Rest Timer */}
            {isResting && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-800 font-semibold font-poppins">Rest Time</p>
                <p className="text-2xl font-bold text-blue-600 font-poppins">{formatTime(restTimer)}</p>
              </div>
            )}

            {/* Action Button */}
            {!isResting ? (
              <button
                onClick={handleCompleteSet}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-poppins font-medium flex items-center justify-center space-x-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>
                  {exercise.sets && currentSet < exercise.sets ? 'Complete Set' : 'Finish Exercise'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsResting(false);
                  setRestTimer(0);
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-poppins font-medium"
              >
                Skip Rest
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4">
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            {(['overview', 'instructions', 'details'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-b-lg shadow-sm border-l border-r border-b border-gray-200 p-4">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {exercise.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 font-poppins">Description</h3>
                  <p className="text-gray-600 leading-relaxed font-poppins">{exercise.description}</p>
                </div>
              )}

              {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 font-poppins">Target Muscles</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.muscleGroups.map((muscle) => (
                      <span
                        key={muscle}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {muscle.replace('_', ' ').charAt(0).toUpperCase() + muscle.replace('_', ' ').slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {exercise.equipmentNeeded && exercise.equipmentNeeded.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 font-poppins">Equipment Needed</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipmentNeeded.map((equipment) => (
                      <span
                        key={equipment}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center space-x-1"
                      >
                        <Dumbbell className="w-3 h-3" />
                        <span>{equipment.replace('_', ' ').charAt(0).toUpperCase() + equipment.replace('_', ' ').slice(1)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              {exercise.instructions ? (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2 font-poppins">
                    <Info className="w-5 h-5 text-blue-600" />
                    <span>How to Perform</span>
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-poppins">
                      {exercise.instructions}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 font-poppins">No instructions available for this exercise.</p>
                </div>
              )}

              {exercise.restTime && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2 font-poppins">Rest Period</h4>
                  <p className="text-yellow-700 font-poppins">
                    Rest for {formatTime(exercise.restTime)} between sets for optimal recovery.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-poppins">Difficulty</p>
                  <p className="font-medium capitalize font-poppins">{exercise.difficulty}</p>
                </div>
                
                <div>
                  <p className="text-gray-500 font-poppins">Category</p>
                  <p className="font-medium capitalize font-poppins">{exercise.category}</p>
                </div>
                
                {exercise.creator && (
                  <div>
                    <p className="text-gray-500 font-poppins">Created by</p>
                    <p className="font-medium font-poppins">
                      {exercise.creator.firstName} {exercise.creator.lastName}
                    </p>
                  </div>
                )}
                
                {exercise.gym && (
                  <div>
                    <p className="text-gray-500 font-poppins">Gym</p>
                    <p className="font-medium font-poppins">{exercise.gym.name}</p>
                  </div>
                )}
              </div>

              {exercise.tags && exercise.tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 font-poppins">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
