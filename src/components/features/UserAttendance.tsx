import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Bell,
  User,
  FileText,
  Plus,
  Grid,
  List,
  Maximize2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Pyramid
} from 'lucide-react';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';
import { format, isToday, startOfDay, isSameDay } from 'date-fns';


export function UserAttendance() {
  const { user } = useAuthStore();
  const { getUserAttendance, loadUserAttendance, isLoading } = useAttendanceStore();
  const { gyms } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'expanded'>('calendar');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = Math.round(minutes % 60);
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
  };


  const attendance = user ? getUserAttendance(user.id) : [];

  useEffect(() => {
    if (user) {
      loadUserAttendance(user.id);
    }
  }, [user, loadUserAttendance]);

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const currentMonthAttendance = attendance.filter(session => {
      const sessionDate = new Date(session.date || session.checkInTime);
      return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
    });
    
    const totalDays = currentMonthAttendance.length;
    const totalMinutes = currentMonthAttendance.reduce((sum, session) => {
      return sum + ((session.duration || session.durationMinutes || 0) / 60);
    }, 0);
    
    return {
      totalDays,
      totalMinutes: Math.round(totalMinutes),
      averageMinutes: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0
    };
  };
  
  const stats = getAttendanceStats();

  // Get today's schedule
  const todaysSchedule = {
    date: format(new Date(), 'EEE, dd MMM yyyy'),
    workingHours: '9:00 AM - 6:00 PM'
  };

  // Get attendance for selected date
  const getAttendanceForDate = (date: Date) => {
    return attendance.find(session => {
      const sessionDate = session.date 
        ? new Date(session.date)
        : session.checkInTime 
        ? new Date(session.checkInTime)
        : null;
      return sessionDate && isSameDay(sessionDate, date);
    });
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const currentMonth = currentCalendarDate.getMonth();
    const currentYear = currentCalendarDate.getFullYear();
    
    // Get first day of month and last day
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    return days;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentCalendarDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    
    // Don't allow navigation beyond current month
    const today = new Date();
    if (newDate.getFullYear() <= today.getFullYear() && 
        newDate.getMonth() <= today.getMonth()) {
      setCurrentCalendarDate(newDate);
    }
  };

  const goToCurrentMonth = () => {
    setCurrentCalendarDate(new Date());
  };

  const calendarDays = generateCalendarDays();

  // Generate attendance chart data for the last 7 days
  const generateChartData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Find all sessions for this day
      const dayAttendanceSessions = attendance.filter(session => {
        const sessionDate = session.date 
          ? new Date(session.date)
          : session.checkInTime 
          ? new Date(session.checkInTime)
          : null;
        return sessionDate && isSameDay(sessionDate, date);
      });
      
      // Sum all durations for the day
      const totalDuration = dayAttendanceSessions.reduce((sum, session) => {
        return sum + ((session.duration || session.durationMinutes || 0) / 60);
      }, 0);
      
      last7Days.push({
        date: format(date, 'EEE'),
        duration: totalDuration,
        hasAttendance: dayAttendanceSessions.length > 0
      });
    }
    
    return last7Days;
  };
  
  const chartData = generateChartData();
  const maxDuration = Math.max(...chartData.map(d => d.duration), 480); // minimum 480 minutes (8 hours) for scale
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  
  // Generate path using MetricCard reference approach
  const generateLinearPath = (data: any[], isArea = false) => {
    if (data.length === 0) return '';
    
    const maxVal = Math.max(...data.map(d => d.duration));
    const minVal = Math.min(...data.map(d => d.duration), 0);
    const range = maxVal - minVal || 1;
    
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 300,
      y: 110 - ((item.duration - minVal) / range) * (110 * 0.6) // Use 60% of height like MetricCard
    }));
    
    if (points.length < 2) {
      const point = points[0] || { x: 150, y: 110 };
      if (isArea) {
        return `M 0 110 L ${point.x} ${point.y} L 300 110 Z`;
      }
      return `M ${point.x} ${point.y}`;
    }
    
    // Create straight line path
    let path = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      path += ` L ${point.x} ${point.y}`;
    }
    
    if (isArea) {
      path += ` L 300 110 L 0 110 Z`;
    }
    
    return path;
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 font-poppins">

      {/* User Info */}
      {user && (
        <div className="mb-2">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 border border-red-600 rounded-full flex items-center justify-center overflow-hidden mt-[2px]">
                <img src={user.profileImage} alt={user.username} />
              </div>
              <div>
                <h1 className="text-lg font-medium text-gray-900">Hey, {user.username}!</h1>
                <p className="text-xs text-gray-500">Ready for new wins? <span>Crush it!</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        {/* Attendance Summary Card */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className='mb-4'>
              <p className="text-sm text-gray-600 mb-2">Today's Schedule</p>
              <p className="text-lg font-semibold text-gray-900">{todaysSchedule.date} <span className="text-sm font-medium">({todaysSchedule.workingHours})</span></p>
            </div>
          </div>
          
          {/* Attendance Stats */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="text-center">
              <div className="text-xl font-semibold text-purple-600">{stats.totalDays}</div>
              <div className="text-xs text-gray-500">Days This Month</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-blue-600">{formatDuration(stats.totalMinutes)}</div>
              <div className="text-xs text-gray-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-green-600">{formatDuration(stats.averageMinutes)}</div>
              <div className="text-xs text-gray-500">Avg/Day</div>
            </div>
          </div>
        </div>

        {/* Attendance Time Chart */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Attendance Time</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-xl font-semibold text-green-600">
                {formatDuration(stats.averageMinutes)}
              </span>
            </div>
          </div>
          
          {/* Chart */}
          <div className="relative h-32">
            <svg className="w-full h-full" viewBox="0 0 300 120">
              {/* Grid lines */}
              {[0, 120, 240, 360, 480].map((minutes, index) => (
                <line
                  key={minutes}
                  x1="0"
                  y1={110 - (minutes / maxDuration) * 100}
                  x2="300"
                  y2={110 - (minutes / maxDuration) * 100}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
              
              {/* Area chart */}
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {/* Linear area chart */}
              <path
                d={generateLinearPath(chartData, true)}
                fill="url(#attendanceGradient)"
              />
              
              {/* Linear line chart */}
              <path
                d={generateLinearPath(chartData, false)}
                stroke="#10b981"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {chartData.map((item, index) => {
                const maxVal = Math.max(...chartData.map(d => d.duration));
                const minVal = Math.min(...chartData.map(d => d.duration), 0);
                const range = maxVal - minVal || 1;
                const x = (index / (chartData.length - 1)) * 300;
                const y = 110 - ((item.duration - minVal) / range) * (110 * 0.6);
                return (
                  <g key={index}>
                    {/* Hover area */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(index)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Data point */}
                    <circle
                      cx={x}
                      cy={y}
                      r={hoveredPoint === index ? "4" : "2.5"}
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                      opacity={hoveredPoint === index ? "1" : "0.8"}
                      className="transition-all duration-200"
                    />
                    {/* Tooltip */}
                    {hoveredPoint === index && (
                      <g>
                        <rect
                          x={x - 25}
                          y={y - 35}
                          width="50"
                          height="25"
                          rx="4"
                          fill="#374151"
                          opacity="0.9"
                        />
                        <text
                          x={x}
                          y={y - 18}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                          fontWeight="medium"
                        >
                          {formatDuration(item.duration)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="relative mt-2">
              {chartData.map((item, index) => {
                const x = (index / (chartData.length - 1)) * 300;
                const leftOffset = (x / 300) * 100; // Convert to percentage
                return (
                  <span 
                    key={index} 
                    className="absolute text-xs text-gray-500 font-medium transform -translate-x-1/2"
                    style={{ left: `${leftOffset}%` }}
                  >
                    {item.date}
                  </span>
                );
              })}
            </div>
          </div>
          
          {/* Current value display */}
          <div className="mt-4 flex items-center justify-center">
            <div className="text-center mt-6">
              <div className="text-2xl font-semibold text-gray-900">
                {formatDuration(chartData[chartData.length - 1]?.duration || 0)}
              </div>
              <div className="text-sm text-gray-500">Today's attendance</div>
            </div>
          </div>
        </div>

      </div>

      {/* Attendance Section */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Attendance</h2>
              <div className="flex items-center space-x-2">
                {/* View Mode Switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 px-4 rounded-md transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 px-4 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('expanded')}
                    className={`p-2 px-4 rounded-md transition-colors ${
                      viewMode === 'expanded'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {format(currentCalendarDate, 'MMM yyyy')}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Previous</span>
                    </button>
                    
                    <button
                      onClick={goToNextMonth}
                      disabled={format(currentCalendarDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        format(currentCalendarDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-sm font-medium">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    if (!day) {
                      // Empty cell for days before the month starts
                      return (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square"
                        ></div>
                      );
                    }
                    
                    const dayAttendance = getAttendanceForDate(day);
                    const isCurrentDay = isToday(day);
                    const today = new Date();
                    const isPastDate = day < today.setHours(0, 0, 0, 0);
                    const isFutureDate = day > new Date();
                    const isCurrentMonth = day.getMonth() === new Date().getMonth() && day.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg text-xs ${
                          isCurrentDay 
                            ? 'bg-purple-100 border border-purple-300'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`font-medium ${
                          isCurrentDay 
                            ? 'text-purple-700' 
                            : isFutureDate 
                            ? 'text-gray-400'
                            : 'text-gray-700'
                        }`}>
                          {day.getDate()}
                        </span>
                        {(isPastDate || (isCurrentDay && isCurrentMonth)) && (
                          <div className="flex items-center justify-center mt-1">
                            <div className={`w-3 h-3 rounded-full ${
                              dayAttendance ? 'bg-blue-500' : 'bg-red-500'
                            }`}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* List View - Compact */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {attendance.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No attendance records found</p>
                    <p className="text-sm text-gray-400">Your attendance history will appear here</p>
                  </div>
                ) : (
                  attendance.map((session, index) => {
                    const gym = gyms.find(g => g.id === session.gymId);
                    const checkInTime = session.checkIn || session.checkInTime;
                    const checkOutTime = session.checkOut || session.checkOutTime;
                    const sessionDate = session.date || (checkInTime ? new Date(checkInTime).toISOString().split('T')[0] : null);
                    const duration = (session.duration || session.durationMinutes || 0) / 60;
                    
                    return (
                      <div key={session.id || index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 truncate">{gym?.name || session.gymName || 'Gym Session'}</h3>
                            <p className="text-sm text-gray-500">
                              {sessionDate ? format(new Date(sessionDate), 'MMM dd, yy') : 'Recent'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-right">
                            <div className="text-gray-900 font-medium">
                              {checkInTime ? format(new Date(checkInTime), 'h:mm a') : '--:--'}
                            </div>
                            <div className="text-xs text-gray-500">Check In</div>
                          </div>
                          
                          {duration > 0 && (
                            <div className="text-right">
                              <div className="text-purple-600 font-semibold">
                                {formatDuration(duration)}
                              </div>
                              <div className="text-xs text-gray-500">Duration</div>
                            </div>
                          )}
                          
                          {/* <div className={`w-3 h-3 rounded-full ${
                            checkOutTime ? 'bg-green-500' : 'bg-yellow-500'
                          }`} title={checkOutTime ? 'Completed' : 'Active'}></div> */}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Expanded View - Detailed */}
            {viewMode === 'expanded' && (
              <div className="space-y-4">
                {attendance.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No attendance records found</p>
                    <p className="text-sm text-gray-400">Your attendance history will appear here</p>
                  </div>
                ) : (
                  attendance.map((session, index) => {
                    const gym = gyms.find(g => g.id === session.gymId);
                    const checkInTime = session.checkIn || session.checkInTime;
                    const checkOutTime = session.checkOut || session.checkOutTime;
                    const sessionDate = session.date || (checkInTime ? new Date(checkInTime).toISOString().split('T')[0] : null);
                    const duration = (session.duration || session.durationMinutes || 0) / 60;
                    
                    // Calculate additional metrics
                    const sessionTime = checkInTime && checkOutTime 
                      ? new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()
                      : 0;
                    const sessionHours = sessionTime > 0 ? sessionTime / (1000 * 60 * 60) : 0;
                    const isLongSession = duration > 120; // More than 2 hours
                    const isRecentSession = sessionDate && new Date(sessionDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div key={session.id || index} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-sm p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                              <Pyramid className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">{session?.gymName || 'Gym Session'}</h3>
                              <p className="text-sm text-gray-600 mb-1">
                                {sessionDate ? format(new Date(sessionDate), 'EE, dd MMM yyyy') : 'Recent Session'}
                              </p>
                              {gym?.address && (
                                <p className="text-xs text-gray-500 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {gym.address}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              checkOutTime 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {checkOutTime ? 'Completed' : 'Active'}
                            </div>
                            {isLongSession && (
                              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Long Session
                              </div>
                            )}
                            {isRecentSession && (
                              <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                Recent
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Check In</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {checkInTime ? format(new Date(checkInTime), 'h:mm a') : '--:--'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {checkInTime ? format(new Date(checkInTime), 'dd MMM, yyyy') : 'No check-in'}
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Check Out</h4>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                              {checkOutTime ? format(new Date(checkOutTime), 'h:mm a') : '--:--'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {checkOutTime ? format(new Date(checkOutTime), 'dd MMM, yyyy') : 'Still active'}
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Duration</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                              {duration > 0 ? formatDuration(duration) : '0 min'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Total time
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Session ID</h4>
                            </div>
                            <p className="text-lg font-mono text-purple-600">
                              #{session.id ? String(session.id).slice(-6) : `${index + 1}`.padStart(6, '0')}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Unique identifier
                            </p>
                          </div>
                        </div>
                        
                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Session Details */}
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Clock className="w-4 h-4 mr-2" />
                              Session Details
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span className="font-medium">{sessionDate ? format(new Date(sessionDate), 'PPP') : 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Day of Week:</span>
                                <span className="font-medium">{sessionDate ? format(new Date(sessionDate), 'EEEE') : 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span className={`font-medium ${
                                  checkOutTime ? 'text-green-600' : 'text-yellow-600'
                                }`}>
                                  {checkOutTime ? 'Completed' : 'In Progress'}
                                </span>
                              </div>
                              {session.method && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Check-in Method:</span>
                                  <span className="font-medium">
                                    {session.method === 'qr' ? 'QR Code' : session.method === 'manual' ? 'Manual' : 'Code Entry'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Gym Information */}
                          <div className="bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Location Details
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Gym Name:</span>
                                <span className="font-medium">{gym?.name || session.gymName || 'Unknown Gym'}</span>
                              </div>
                              {gym?.type && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Gym Type:</span>
                                  <span className="font-medium capitalize">{gym.type}</span>
                                </div>
                              )}
                              {gym?.address && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Address:</span>
                                  <span className="font-medium text-right">{gym.address}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-500">Gym ID:</span>
                                <span className="font-mono text-sm">{session.gymId || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Session Notes */}
                        {session.sessionNotes && (
                          <div className="mt-4 bg-white rounded-lg p-4">
                            <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Session Notes
                            </h5>
                            <p className="text-sm text-gray-600 leading-relaxed">{session.sessionNotes}</p>
                          </div>
                        )}
                        
                        {/* Metadata Footer */}
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                          <span>Session #{session.id ? String(session.id).slice(-8) : `temp-${index + 1}`}</span>
                          <span>Recorded {sessionDate ? format(new Date(sessionDate), 'PPpp') : 'recently'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

    </div>
  );
}
