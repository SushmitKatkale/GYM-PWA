import { useState, useRef } from 'react';
import { Download, Calendar, Clock, TrendingUp, BarChart, FileText, Filter } from 'lucide-react';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';
import { format, startOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface AttendanceStats {
  totalSessions: number;
  totalHours: number;
  averageSessionDuration: number;
  mostVisitedGym: string;
  currentStreak: number;
}

export function AttendanceReports() {
  const { user } = useAuthStore();
  const { getUserAttendance } = useAttendanceStore();
  const { gyms } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedGym, setSelectedGym] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const attendance = user ? getUserAttendance(user.id) : [];

  // Filter attendance based on selected criteria
  const filteredAttendance = attendance.filter(session => {
    const sessionDate = new Date(session.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const isInDateRange = isWithinInterval(sessionDate, { start: startDate, end: endDate });
    const isSelectedGym = selectedGym === 'all' || session.gymId === selectedGym;
    
    return isInDateRange && isSelectedGym;
  });

  // Calculate statistics
  const calculateStats = (): AttendanceStats => {
    const totalSessions = filteredAttendance.length;
    const totalHours = filteredAttendance.reduce((sum, session) => {
      return sum + (session.duration || 0) / 60; // Convert minutes to hours
    }, 0);
    
    const averageSessionDuration = totalSessions > 0 ? totalHours / totalSessions : 0;
    
    // Find most visited gym
    const gymCounts: { [key: string]: number } = {};
    filteredAttendance.forEach(session => {
      gymCounts[session.gymId] = (gymCounts[session.gymId] || 0) + 1;
    });
    
    const mostVisitedGymId = Object.keys(gymCounts).reduce((a, b) => 
      gymCounts[a] > gymCounts[b] ? a : b, ''
    );
    
    const mostVisitedGym = gyms.find(gym => gym.id === mostVisitedGymId)?.name || 'N/A';
    
    // Calculate current streak (simplified)
    const currentStreak = Math.min(totalSessions, 7); // Mock streak calculation
    
    return {
      totalSessions,
      totalHours,
      averageSessionDuration,
      mostVisitedGym,
      currentStreak
    };
  };

  const stats = calculateStats();

  // Group attendance by period
  const groupAttendanceByPeriod = () => {
    const grouped: { [key: string]: typeof filteredAttendance } = {};
    
    filteredAttendance.forEach(session => {
      let key = '';
      const date = new Date(session.date);
      
      switch (selectedPeriod) {
        case 'daily':
          key = format(date, 'yyyy-MM-dd');
          break;
        case 'weekly':
          key = format(startOfWeek(date), 'yyyy-MM-dd');
          break;
        case 'monthly':
          key = format(date, 'yyyy-MM');
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(session);
    });
    
    return grouped;
  };

  const groupedAttendance = groupAttendanceByPeriod();

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Gym', 'Check In', 'Check Out', 'Duration (minutes)'];
    const csvData = filteredAttendance.map(session => [
      format(new Date(session.date), 'yyyy-MM-dd'),
      gyms.find(gym => gym.id === session.gymId)?.name || 'Unknown',
      format(new Date(session.checkIn), 'HH:mm'),
      session.checkOut ? format(new Date(session.checkOut), 'HH:mm') : 'Active',
      session.duration?.toString() || '0'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`attendance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gym</label>
            <select
              value={selectedGym}
              onChange={(e) => setSelectedGym(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Gyms</option>
              {gyms.map(gym => (
                <option key={gym.id} value={gym.id}>{gym.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex space-x-3 mt-4">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div ref={reportRef}>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours.toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BarChart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageSessionDuration.toFixed(1)}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Favorite Gym</p>
                <p className="text-lg font-bold text-gray-900 truncate">{stats.mostVisitedGym}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Timeline</h2>
          <div className="space-y-4">
            {Object.entries(groupedAttendance).map(([period, sessions]) => (
              <div key={period} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">
                    {selectedPeriod === 'monthly' 
                      ? format(new Date(period + '-01'), 'MMMM yyyy')
                      : format(new Date(period), 'MMM dd, yyyy')
                    }
                  </h3>
                  <span className="text-sm text-gray-500">
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sessions.map(session => {
                    const gym = gyms.find(g => g.id === session.gymId);
                    return (
                      <div key={session.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{gym?.name || 'Unknown Gym'}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(session.checkIn), 'HH:mm')}
                              {session.checkOut && ` - ${format(new Date(session.checkOut), 'HH:mm')}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {session.duration ? `${Math.round(session.duration / 60)}h ${session.duration % 60}m` : 'Active'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedAttendance).length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No attendance data found for the selected period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
