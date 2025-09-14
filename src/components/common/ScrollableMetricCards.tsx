import React from 'react';
import { MetricCard } from './MetricCard';
import { 
  Flame, 
  Heart, 
  Footprints, 
  Timer, 
  Target, 
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';

interface MetricData {
  id: string;
  title: string;
  value: number | string;
  unit: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  chartData?: number[];
}

interface ScrollableMetricCardsProps {
  metrics?: MetricData[];
  apiMetrics?: {
    steps: number;
    workoutTime: number;
    activeEnergy: number;
    weeklyGoalProgress: number;
  };
  className?: string;
}

// Default metrics data similar to the image
const defaultMetrics: MetricData[] = [
  {
    id: 'steps',
    title: 'Steps',
    value: '5.5',
    unit: 'k',
    icon: Footprints,
    color: 'amber',
    bgColor: 'bg-white',
    chartData: [4.2, 5.1, 4.8, 5.5, 5.2, 5.8, 5.5]
  },
  {
    id: 'workoutTime',
    title: 'Workout Time',
    value: 45,
    unit: 'min',
    icon: Timer,
    color: 'green',
    bgColor: 'bg-white',
    chartData: [30, 40, 35, 45, 42, 48, 45]
  },
  {
    id: 'activeEnergy',
    title: 'Active Energy',
    value: 280,
    unit: 'cal',
    icon: Zap,
    color: 'red',
    bgColor: 'bg-white',
    chartData: [250, 270, 260, 280, 275, 285, 280]
  },
  {
    id: 'progress',
    title: 'Weekly Goal',
    value: 85,
    unit: '%',
    icon: Target,
    color: 'indigo',
    bgColor: 'bg-white',
    chartData: [60, 65, 70, 75, 80, 82, 85]
  }
];

export const ScrollableMetricCards: React.FC<ScrollableMetricCardsProps> = ({
  metrics,
  apiMetrics,
  className = ''
}) => {
  // Use API data when available, otherwise fall back to provided metrics or defaults
  const metricsToShow = React.useMemo(() => {
    if (apiMetrics) {
      return [
        {
          id: 'steps',
          title: 'Steps',
          value: apiMetrics.steps >= 1000 ? (apiMetrics.steps / 1000).toFixed(1) : apiMetrics.steps.toString(),
          unit: apiMetrics.steps >= 1000 ? 'k' : '',
          icon: Footprints,
          color: 'amber',
          bgColor: 'bg-white',
          chartData: [4.2, 5.1, 4.8, Math.max(5.5, apiMetrics.steps / 1000), 5.2, 5.8, apiMetrics.steps / 1000]
        },
        {
          id: 'workoutTime',
          title: 'Workout Time',
          value: apiMetrics.workoutTime,
          unit: 'min',
          icon: Timer,
          color: 'green',
          bgColor: 'bg-white',
          chartData: [30, 40, 35, Math.max(45, apiMetrics.workoutTime), 42, 48, apiMetrics.workoutTime]
        },
        {
          id: 'activeEnergy',
          title: 'Active Energy',
          value: apiMetrics.activeEnergy,
          unit: 'cal',
          icon: Zap,
          color: 'red',
          bgColor: 'bg-white',
          chartData: [250, 270, 260, Math.max(280, apiMetrics.activeEnergy), 275, 285, apiMetrics.activeEnergy]
        },
        {
          id: 'progress',
          title: 'Weekly Goal',
          value: Math.round(apiMetrics.weeklyGoalProgress),
          unit: '%',
          icon: Target,
          color: 'indigo',
          bgColor: 'bg-white',
          chartData: [60, 65, 70, 75, 80, 82, Math.round(apiMetrics.weeklyGoalProgress)]
        }
      ];
    }
    return metrics || defaultMetrics;
  }, [apiMetrics, metrics]);

  return (
    <div className={`${className}`}>
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-semibold text-gray-900">Today's Metrics</h2>
        <button className="text-sm text-purple-600 font-medium">View All</button>
      </div> */}
      
      {/* Scrollable Container */}
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {metricsToShow.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.title}
            value={metric.value}
            unit={metric.unit}
            icon={metric.icon}
            color={metric.color}
            bgColor={metric.bgColor}
            chartData={metric.chartData}
          />
        ))}
      </div>
      
      {/* Custom scrollbar styling */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
