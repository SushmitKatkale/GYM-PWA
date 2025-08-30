import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  chartData?: number[];
  trend?: 'up' | 'down' | 'stable';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  color,
  bgColor,
  chartData = [],
  trend = 'stable'
}) => {
  // Create a smooth curved path for the full-card background chart
  const createSmoothPath = (data: number[], width: number, height: number) => {
    if (data.length < 2) return '';
    
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1;
    
    const points = data.map((point, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((point - minVal) / range) * (height * 0.4) // Use 40% of height for gentler variation
    }));
    
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Create smooth curves using quadratic bezier curves
    for (let i = 1; i < points.length; i++) {
      const prevPoint = points[i - 1];
      const currentPoint = points[i];
      
      // Calculate control point for smooth curve
      const controlX = (prevPoint.x + currentPoint.x) / 2;
      const controlY = (prevPoint.y + currentPoint.y) / 2;
      
      if (i === 1) {
        path += ` Q ${controlX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
      } else {
        path += ` T ${currentPoint.x} ${currentPoint.y}`;
      }
    }
    
    return path;
  };

  const getChartColor = (colorName: string) => {
    switch (true) {
      case colorName.includes('blue'): return '#3B82F6';
      case colorName.includes('purple'): return '#8B5CF6';
      case colorName.includes('amber') || colorName.includes('orange'): return '#F59E0B';
      case colorName.includes('green'): return '#10B981';
      case colorName.includes('red') || colorName.includes('pink'): return '#EF4444';
      case colorName.includes('indigo'): return '#6366F1';
      default: return '#6B7280';
    }
  };

  return (
    <div className={`${bgColor} rounded-lg p-4 min-w-[180px] max-w-[200px] flex-shrink-0 relative overflow-hidden shadow-sm border border-gray-100 font-poppins`}>
      {/* Background Chart - Full Card */}
      {chartData.length > 0 && (
        <div className="absolute inset-0 w-full h-full">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={getChartColor(color)} stopOpacity="0.2" />
                <stop offset="100%" stopColor={getChartColor(color)} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Chart line */}
            <path
              d={createSmoothPath(chartData, 160, 120)}
              stroke={getChartColor(color)}
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />
            
            {/* Fill area under the curve */}
            <path
              d={`${createSmoothPath(chartData, 160, 120)} L 160 120 L 0 120 Z`}
              fill={`url(#gradient-${color})`}
            />
            
            {/* Data points */}
            {chartData.map((point, index) => {
              const maxVal = Math.max(...chartData);
              const minVal = Math.min(...chartData);
              const range = maxVal - minVal || 1;
              const x = (index / (chartData.length - 1)) * 160;
              const y = 120 - ((point - minVal) / range) * (120 * 0.6);
              
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={getChartColor(color)}
                  opacity="0.8"
                />
              );
            })}
          </svg>
        </div>
      )}
      
      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[120px]">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-gray-600 font-medium bg-white/80 backdrop-blur-sm px-2 py-1 rounded">{title}</div>
          <div className="p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm">
            <Icon className="w-3 h-3 text-gray-500" />
          </div>
        </div>
        
        {/* Value and Unit */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1 bg-transparent px-2 py-1 rounded w-fit">
            <span className="text-lg font-semibold text-gray-900">{value}</span>
            <span className="text-sm font-medium text-gray-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
