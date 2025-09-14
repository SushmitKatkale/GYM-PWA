import React from 'react';
import { Activity, Dumbbell, DumbbellIcon } from 'lucide-react';
import bodyBuilder from '../../assets/images/body-builder.png';

interface DailyActivityProps {
  className?: string;
  gymDetails?: {
    gymName: string;
    activeMembers: number;
    subscription: {
      duration: string;
      gymName: string;
    };
    trainer: {
      name: string;
      schedule: string;
      specialization: string;
    };
  };
}

// Today's activity data matching screenshot
const activityData = {
  members: 28,
  exercises: [
    {
      id: 'GymName',
      name: 'Gym Name',
      subtitle: 'Sun Fitness Center',
      icon: '💪',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      id: 'Subscription',
      name: 'Subscription',
      subtitle: '1 Months (5 days left)',
      icon: '🦵',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'TrainerName',
      name: 'Trainer Name',
      subtitle: 'John Doe (11:00 AM - 12:00 PM)',
      icon: '🏃‍♂️',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ]
};

const generateRandomWave = () => {
  const points = [];
  const numPoints = 4 + Math.floor(Math.random() * 2); // 4-5 points for smoother curves

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * 100;
    const y = 20 + Math.random() * 15; // y between 20-35 for less dramatic variation
    points.push({ x, y });
  }

  // Create ultra-smooth curve path using improved control points
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1] || curr;

    // Calculate smooth control points based on neighboring points
    const dx = curr.x - prev.x;
    const controlX1 = prev.x + dx * 0.5;
    const controlY1 = prev.y + (curr.y - prev.y) * 0.2;
    const controlX2 = curr.x - dx * 0.5;
    const controlY2 = curr.y - (curr.y - prev.y) * 0.2;

    path += ` C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${curr.x} ${curr.y}`;
  }

  return path;
};

const wavePath = generateRandomWave();

export const DailyActivity: React.FC<DailyActivityProps> = ({ className = '', gymDetails }) => {
  // Use API data if available, otherwise fall back to static data
  const displayData = gymDetails ? {
    members: gymDetails.activeMembers,
    exercises: [
      {
        id: 'GymName',
        name: 'Gym Name',
        subtitle: gymDetails.gymName,
        icon: '💪',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        id: 'Subscription',
        name: 'Subscription',
        subtitle: gymDetails.subscription.duration,
        icon: '🦵',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      },
      {
        id: 'TrainerName',
        name: 'Trainer Name',
        subtitle: `${gymDetails.trainer.name} (${gymDetails.trainer.schedule})`,
        icon: '🏃‍♂️',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600'
      }
    ]
  } : activityData;

  return (
    <div className={className}>
      {/* Activity Container */}
      <div className="font-poppins">
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-base font-normal text-gray-900 font-poppins">Gym Details</h2>
        </div>
        <div className="flex gap-4">
          {/* Left side - Active Members Card */}
          <div className="flex-shrink-0">
            <div className="relative bg-gradient-to-br h-full from-pink-400 to-red-500 rounded-md p-4 text-white w-20 flex flex-col justify-between">
              <div className="flex items-center justify-center">
                <div className='bg-pink-600 p-2 rounded-sm'>
                  <img src={bodyBuilder} alt="Body builder" className='filter invert brightness-0 contrast-200 w-8 h-8' />
                </div>
              </div>
              <div>
                <div className="text-lg font-bold leading-tight text-center">
                  {displayData.members.toLocaleString()}
                </div>
                <div className="text-xs opacity-90 leading-tight text-center">
                  Active Members
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-full opacity-15">
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <path
                    d={wavePath}
                    stroke="white"
                    strokeWidth="1"
                    fill="none"
                    opacity="1"
                  />
                  <path
                    d={`${wavePath} L 100 40 L 0 40 Z`}
                    fill="white"
                    opacity="1"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right side - Gym Details List */}
          <div className="flex-1 space-y-2">
            {displayData.exercises.map((exercise, index) => (
              <div key={exercise.id} className="flex items-center space-x-3 py-1">
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg ${exercise.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm">{exercise.icon}</span>
                </div>

                {/* Exercise Info */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{exercise.name}</h4>
                  <p className="text-xs text-gray-500">{exercise.subtitle}</p>
                </div>

                {/* Dot indicator */}
                {/* <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></div> */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
