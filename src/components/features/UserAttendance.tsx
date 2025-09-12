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
  TrendingUp
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
    const totalHours = currentMonthAttendance.reduce((sum, session) => {
      return sum + (session.duration || session.durationMinutes || 0) / 60;
    }, 0);
    
    return {
      totalDays,
      totalHours: totalHours.toFixed(1),
      averageHours: totalDays > 0 ? (totalHours / totalDays).toFixed(1) : '0'
    };
  };
  
  const stats = getAttendanceStats();

  // Get today's schedule
  const todaysSchedule = {
    date: format(new Date(), 'EEE, dd MMM yyyy'),
    workingHours: '09:00 - 18:00'
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
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get first day of month and last day
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const days = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Generate attendance chart data for the last 7 days
  const generateChartData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayAttendance = attendance.find(session => {
        const sessionDate = session.date 
          ? new Date(session.date)
          : session.checkInTime 
          ? new Date(session.checkInTime)
          : null;
        return sessionDate && isSameDay(sessionDate, date);
      });
      
      const duration = dayAttendance 
        ? (dayAttendance.duration || dayAttendance.durationMinutes || 0) / 60
        : 0;
      
      last7Days.push({
        date: format(date, 'EEE'),
        duration: duration,
        hasAttendance: !!dayAttendance
      });
    }
    
    return last7Days;
  };
  
  const chartData = generateChartData();
  const maxDuration = Math.max(...chartData.map(d => d.duration), 8); // minimum 8 hours for scale
  
  // Generate simple linear path
  const generateLinearPath = (data: any[], isArea = false) => {
    if (data.length === 0) return '';
    
    const points = data.map((item, index) => ({
      x: (index * 300) / (data.length - 1),
      y: 110 - (item.duration / maxDuration) * 100
    }));
    
    if (points.length === 1) {
      const point = points[0];
      if (isArea) {
        return `M 0 110 L ${point.x} ${point.y} L 300 110 Z`;
      }
      return `M ${point.x} ${point.y}`;
    }
    
    // Create simple linear path
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-gray-900">
                Morning, {user?.username || 'Vera Angelina'}
              </h1>
              <p className="text-sm text-gray-600">Business Process Development</p>
            </div>
          </div>
          <Bell className="w-6 h-6 text-gray-400" />
        </div>

        {/* Attendance Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">Today's Schedule</p>
              <p className="text-lg font-semibold text-gray-900">{todaysSchedule.date}</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-4">
            {todaysSchedule.workingHours}
          </div>
          
          {/* Attendance Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalDays}</div>
              <div className="text-xs text-gray-500">Days This Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalHours}h</div>
              <div className="text-xs text-gray-500">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.averageHours}h</div>
              <div className="text-xs text-gray-500">Avg/Day</div>
            </div>
          </div>
        </div>

        {/* Attendance Time Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Time</h3>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-2xl font-bold text-green-600">
                {stats.averageHours}h
              </span>
            </div>
          </div>
          
          {/* Chart */}
          <div className="relative h-32">
            <svg className="w-full h-full" viewBox="0 0 300 120">
              {/* Grid lines */}
              {[0, 2, 4, 6, 8].map((hour, index) => (
                <line
                  key={hour}
                  x1="0"
                  y1={110 - (hour / maxDuration) * 100}
                  x2="300"
                  y2={110 - (hour / maxDuration) * 100}
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
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data points */}
              {chartData.map((item, index) => {
                const x = (index * 300) / (chartData.length - 1);
                const y = 110 - (item.duration / maxDuration) * 100;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#10b981"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {item.hasAttendance && (
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="white"
                      />
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-2">
              {chartData.map((item, index) => (
                <span key={index} className="text-xs text-gray-500 font-medium">
                  {item.date}
                </span>
              ))}
            </div>
          </div>
          
          {/* Current value display */}
          <div className="mt-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {chartData[chartData.length - 1]?.duration.toFixed(1) || '0.0'}
                <span className="text-lg text-gray-500 ml-1">hours</span>
              </div>
              <div className="text-sm text-gray-500">Today's attendance</div>
            </div>
          </div>
        </div>

      </div>

      {/* Attendance Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Attendance</h2>
              <div className="flex items-center space-x-2">
                {/* View Mode Switcher */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('expanded')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'expanded'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <button className="text-sm text-purple-600 hover:text-purple-700">View All</button>
              </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const dayAttendance = getAttendanceForDate(day);
                    const isCurrentDay = isToday(day);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`aspect-square flex flex-col items-center justify-center p-1 rounded-lg text-xs ${
                          isCurrentDay 
                            ? 'bg-purple-100 border border-purple-300'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`font-medium ${
                          isCurrentDay ? 'text-purple-700' : 'text-gray-700'
                        }`}>
                          {day.getDate()}
                        </span>
                        {dayAttendance && (
                          <div className="flex flex-col items-center mt-1">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-gray-600">
                                {dayAttendance.checkIn 
                                  ? format(new Date(dayAttendance.checkIn), 'HH:mm') 
                                  : dayAttendance.checkInTime 
                                  ? format(new Date(dayAttendance.checkInTime), 'HH:mm')
                                  : '08:59'
                                }
                              </span>
                            </div>
                            {(dayAttendance.checkOut || dayAttendance.checkOutTime) && (
                              <div className="flex items-center space-x-1 mt-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">
                                  {dayAttendance.checkOut
                                    ? format(new Date(dayAttendance.checkOut), 'HH:mm')
                                    : format(new Date(dayAttendance.checkOutTime), 'HH:mm')
                                  }
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
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
                    const duration = session.duration || session.durationMinutes;
                    
                    return (
                      <div key={session.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{gym?.name || session.gymName || 'Gym Session'}</h3>
                              <p className="text-sm text-gray-500">
                                {sessionDate ? format(new Date(sessionDate), 'EEE, dd MMM yyyy') : 'Recent'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-xs text-gray-500">Start Day</p>
                              <p className="text-sm font-medium text-gray-900">
                                {checkInTime ? format(new Date(checkInTime), 'HH:mm') : '08:59'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div>
                              <p className="text-xs text-gray-500">End Day</p>
                              <p className="text-sm font-medium text-gray-900">
                                {checkOutTime ? format(new Date(checkOutTime), 'HH:mm') : '--:--'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {duration && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-medium text-gray-900">
                              {Math.floor(duration / 60)}h {duration % 60}m
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Expanded View */}
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
                    const duration = session.duration || session.durationMinutes;
                    
                    return (
                      <div key={session.id || index} className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{gym?.name || session.gymName || 'Gym Session'}</h3>
                              <p className="text-sm text-gray-600">
                                {sessionDate ? format(new Date(sessionDate), 'EEEE, dd MMMM yyyy') : 'Recent Session'}
                              </p>
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            checkOutTime 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {checkOutTime ? 'Completed' : 'Active'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Check In</h4>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {checkInTime ? format(new Date(checkInTime), 'HH:mm') : '08:59'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {checkInTime ? format(new Date(checkInTime), 'dd MMM, yyyy') : 'Today'}
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Check Out</h4>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                              {checkOutTime ? format(new Date(checkOutTime), 'HH:mm') : '--:--'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {checkOutTime ? format(new Date(checkOutTime), 'dd MMM, yyyy') : 'Not checked out'}
                            </p>
                          </div>
                          
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                              <h4 className="font-medium text-gray-900">Duration</h4>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                              {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '0h 0m'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Total session time
                            </p>
                          </div>
                        </div>
                        
                        {session.sessionNotes && (
                          <div className="mt-4 p-3 bg-white rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-2">Session Notes</h5>
                            <p className="text-sm text-gray-600">{session.sessionNotes}</p>
                          </div>
                        )}
                        
                        {session.method && (
                          <div className="mt-4 flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Check-in method:</span>
                            <span className="px-2 py-1 bg-white rounded-full text-xs font-medium text-gray-700">
                              {session.method === 'qr' ? 'QR Code' : session.method === 'manual' ? 'Manual' : 'Code Entry'}
                            </span>
                          </div>
                        )}
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
