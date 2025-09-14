import React from 'react';
import { CollectionCard } from './CollectionCard';
import gymBoyImg from '../../assets/images/gym-boy.png';
import gymGirlImg from '../../assets/images/gym-girl.png';

interface CollectionData {
  id: string;
  title: string;
  subtitle: string;
  exerciseCount: number;
  image: string;
  backgroundColor: string;
  textColor?: string;
}

interface ExerciseCollectionsProps {
  collections?: CollectionData[];
  apiCollections?: {
    id: string;
    name: string;
    description: string;
    exerciseCount: number;
    type: string;
  }[];
  title?: string;
  className?: string;
  onCardClick?: (collection: CollectionData) => void;
}

// Default collections data based on the image
const defaultCollections: CollectionData[] = [
  {
    id: 'chest-abs',
    title: 'Diet Plans with meals',
    subtitle: 'Our Collection',
    exerciseCount: '1 Diet Plan',
    image: gymGirlImg,
    backgroundColor: 'bg-gradient-to-br from-amber-300 to-orange-400',
    textColor: 'text-gray-900'
  },
  {
    id: 'chest-abs-2',
    title: 'Daily exercises for you',
    subtitle: 'Premium Collection',
    exerciseCount: '15 Exercises',
    image: gymBoyImg,
    backgroundColor: 'bg-gradient-to-br from-purple-400 to-purple-500',
    textColor: 'text-white'
  }
];

export const ExerciseCollections: React.FC<ExerciseCollectionsProps> = ({
  collections,
  apiCollections,
  title = 'Our Collection',
  className = '',
  onCardClick
}) => {
  // Transform API data if available, otherwise use provided collections or defaults
  const collectionsToShow = React.useMemo(() => {
    if (apiCollections && apiCollections.length > 0) {
      return apiCollections.map((apiCollection, index) => ({
        id: apiCollection.id,
        title: apiCollection.name,
        subtitle: apiCollection.description || 'Premium Collection',
        exerciseCount: apiCollection.type === 'diet' ? 
          `${apiCollection.exerciseCount} Diet Plan${apiCollection.exerciseCount !== 1 ? 's' : ''}` :
          `${apiCollection.exerciseCount} Exercise${apiCollection.exerciseCount !== 1 ? 's' : ''}`,
        image: apiCollection.type === 'diet' ? gymGirlImg : gymBoyImg,
        backgroundColor: apiCollection.type === 'diet' ? 
          'bg-gradient-to-br from-amber-300 to-orange-400' : 
          'bg-gradient-to-br from-purple-400 to-purple-500',
        textColor: apiCollection.type === 'diet' ? 'text-gray-900' : 'text-white'
      }));
    }
    return collections || defaultCollections;
  }, [apiCollections, collections]);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-base font-normal text-gray-900 font-poppins">Diet Plan & Exercises</h2>
      </div>
      
      {/* Grid Container */}
      <div className="space-y-4">
        {collectionsToShow.map((collection) => (
          <CollectionCard
            key={collection.id}
            title={collection.title}
            subtitle={collection.subtitle}
            exerciseCount={collection.exerciseCount}
            image={collection.image}
            backgroundColor={collection.backgroundColor}
            textColor={collection.textColor}
            onClick={() => onCardClick?.(collection)}
          />
        ))}
      </div>
    </div>
  );
};
