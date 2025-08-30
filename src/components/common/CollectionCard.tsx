import React from 'react';
import { Banana, Bookmark, Diameter, LucideIcon, PieChartIcon } from 'lucide-react';

interface CollectionCardProps {
  title: string;
  subtitle: string;
  exerciseCount: string;
  image: string;
  backgroundColor: string;
  textColor?: string;
  onClick?: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  title,
  subtitle,
  exerciseCount,
  image,
  backgroundColor,
  textColor = 'text-gray-900',
  onClick
}) => {
  // Generate smooth random wave pattern
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
  
  return (
    <div 
      onClick={onClick}
      className={`${backgroundColor} rounded-lg p-4 w-full relative overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg min-h-[100px]`}
    >
      {/* Background decorative graph - randomly generated wave */}
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

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between h-full">
        {/* Left side - Text content */}
        <div className="flex-1 pr-1 w-[60%]">
          <h3 className={`text-base font-medium ${textColor} mb-1 leading-tight font-poppins`}>
            {title}
          </h3>
          {/* <p className={`text-xs ${textColor} opacity-70 mb-2 font-poppins`}>
            {subtitle}
          </p> */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-white/30 rounded-sm flex items-center justify-center">
              {/* <div className="w-1.5 h-1.5 bg-white rounded-full"></div> */}
              <Bookmark className="absolute w-4 h-4 text-white/40" />
            </div>
            <span className={`text-xs font-medium ${textColor} font-poppins`}>
              {exerciseCount}
            </span>
          </div>
        </div>
        
        {/* Right side - Image (transparent/faded) */}
        <div className="relative w-[25%]">
          <div className="w-16 h-16 rounded-lg">
            <img 
              src={image} 
              alt={title}
              className="w-full h-[200%] object-cover opacity-90 mix-blend-multiply"
              onError={(e) => {
                // Hide image on error
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
