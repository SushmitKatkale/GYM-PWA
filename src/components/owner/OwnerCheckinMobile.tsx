import React, { useEffect, useState } from 'react';
import { 
  QrCode, Activity, Clock, Users, Calendar, Eye, 
  Scan, RefreshCw, AlertCircle, Download, Share2,
  ArrowLeft, Plus, BarChart3, TrendingUp, MapPin
} from 'lucide-react';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useGymStore } from '../../stores/gymStore';
import { useAuthStore } from '../../stores/authStore';
import QRCode from 'react-qr-code';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';

interface OwnerCheckinMobileProps {
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function OwnerCheckinMobile({ onBack, onNavigate }: OwnerCheckinMobileProps) {
  const { user } = useAuthStore();
  const { gyms, fetchOwnerGyms } = useGymStore();
  const {
    attendanceRecords,
    isLoading,
    error,
    fetchAttendanceRecords
  } = useAttendanceStore();
  
  const [selectedGym, setSelectedGym] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'qr-codes' | 'attendance' | 'analytics'>('qr-codes');
  const [refreshing, setRefreshing] = useState(false);
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();

  useEffect(() => {
    if (user?.role === 'owner') {
      fetchOwnerGyms();
    }
  }, [user, fetchOwnerGyms]);

  useEffect(() => {
    if (selectedGym) {
      fetchAttendanceRecords(selectedGym.id);
    }
  }, [selectedGym, fetchAttendanceRecords]);

  // Auto-select owner's gym when gyms are loaded
  useEffect(() => {
    if (gyms && gyms.length > 0 && !selectedGym) {
      setSelectedGym(gyms[0]);
    }
  }, [gyms, selectedGym]);

  const handleRefresh = async () => {
    setRefreshing(true);
    clearDevErrors();
    try {
      await Promise.all([
        fetchOwnerGyms(),
        selectedGym ? fetchAttendanceRecords(selectedGym.id) : Promise.resolve()
      ]);
    } catch (err) {
      const apiError = createApiError(
        selectedGym ? `/api/attendance/${selectedGym.id}` : '/api/owner/gyms',
        'GET',
        err
      );
      addDevError(apiError);
    } finally {
      setRefreshing(false);
    }
  };

  const generateQRCode = (gymId: string, type: 'checkin' | 'checkout') => {
    return `${window.location.origin}/checkin/${type}/${gymId}`;
  };

  const downloadQR = (gymId: string, gymName: string, type: string) => {
    // Implementation for downloading QR code as image
    console.log(`Download QR for ${gymName} - ${type}`);
  };

  const shareQR = (gymId: string, gymName: string, type: string) => {
    const url = generateQRCode(gymId, type as 'checkin' | 'checkout');
    if (navigator.share) {
      navigator.share({
        title: `${gymName} ${type} QR Code`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('QR code URL copied to clipboard!');
    }
  };

  // Mock attendance data for today
  const todayAttendance = {
    totalCheckins: 45,
    totalCheckouts: 38,
    currentlyInside: 7,
    peakHour: '6:00 PM'
  };

  const recentCheckins = [
    { id: 1, userName: 'John Doe', action: 'Check-in', time: '2:30 PM', gym: 'Main Branch' },
    { id: 2, userName: 'Jane Smith', action: 'Check-out', time: '2:15 PM', gym: 'Main Branch' },
    { id: 3, userName: 'Mike Johnson', action: 'Check-in', time: '2:00 PM', gym: 'Downtown' },
    { id: 4, userName: 'Sarah Wilson', action: 'Check-in', time: '1:45 PM', gym: 'Main Branch' },
    { id: 5, userName: 'Tom Brown', action: 'Check-out', time: '1:30 PM', gym: 'Downtown' }
  ];

  // Show available data even if there are errors - hide error throwing

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-medium text-gray-900 font-poppins">Check-in Management</h1>
            <p className="text-sm text-gray-500">QR codes & attendance tracking</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || isLoading}
            className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>


        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('qr-codes')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'qr-codes'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            QR Codes
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'attendance'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Development Error Display */}
        {shouldShowErrors() && devErrors.length > 0 && (
          <div className="space-y-2">
            {devErrors.map((devError, index) => (
              <DevelopmentErrorDisplay
                key={index}
                error={devError}
                onRetry={handleRefresh}
                onDismiss={() => clearDevErrors()}
              />
            ))}
          </div>
        )}
        
        {!gyms || gyms.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Gym Found</h3>
            <p className="text-gray-500">Register your gym first to manage check-ins.</p>
          </div>
        ) : (
          <>
            {/* Current Gym Display */}
            {selectedGym && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedGym.name}</h3>
                    <p className="text-sm text-blue-600">Managing check-ins for this gym</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'qr-codes' && (
              <div className="space-y-4">
                {/* Check-in QR Code */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Check-in QR Code</h3>
                      <p className="text-sm text-gray-500">For members to scan when entering</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => shareQR(selectedGym.id, selectedGym.name, 'checkin')}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => downloadQR(selectedGym.id, selectedGym.name, 'checkin')}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center bg-gray-50 rounded-lg p-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <QRCode 
                        value={generateQRCode(selectedGym.id, 'checkin')}
                        size={120}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      QR Code ID: {selectedGym.id}-checkin
                    </p>
                  </div>
                </div>

                {/* Check-out QR Code */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Check-out QR Code</h3>
                      <p className="text-sm text-gray-500">For members to scan when leaving</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => shareQR(selectedGym.id, selectedGym.name, 'checkout')}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => downloadQR(selectedGym.id, selectedGym.name, 'checkout')}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center bg-gray-50 rounded-lg p-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <QRCode 
                        value={generateQRCode(selectedGym.id, 'checkout')}
                        size={120}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      QR Code ID: {selectedGym.id}-checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                {/* Today's Summary */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Today's Activity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{todayAttendance.totalCheckins}</div>
                      <div className="text-xs text-gray-500">Check-ins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{todayAttendance.totalCheckouts}</div>
                      <div className="text-xs text-gray-500">Check-outs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{todayAttendance.currentlyInside}</div>
                      <div className="text-xs text-gray-500">Currently Inside</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{todayAttendance.peakHour}</div>
                      <div className="text-xs text-gray-500">Peak Hour</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Recent Activity</h3>
                    <button 
                      onClick={() => onNavigate?.('owner-attendance-reports')}
                      className="text-sm text-blue-600 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {recentCheckins.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            record.action === 'Check-in' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <Activity className={`w-4 h-4 ${
                              record.action === 'Check-in' ? 'text-green-600' : 'text-red-600'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{record.userName}</p>
                            <p className="text-xs text-gray-500">{record.action} • {record.gym}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {record.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">+15%</div>
                    <div className="text-xs text-gray-500">Weekly Growth</div>
                  </div>
                  <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">2.5h</div>
                    <div className="text-xs text-gray-500">Avg Session</div>
                  </div>
                </div>

                {/* Peak Hours Chart */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Peak Hours This Week</h3>
                  <div className="space-y-2">
                    {['6:00 AM', '12:00 PM', '6:00 PM', '8:00 PM'].map((hour, index) => (
                      <div key={hour} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{hour}</span>
                        <div className="flex items-center space-x-2 flex-1 mx-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${[60, 45, 85, 70][index]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{[60, 45, 85, 70][index]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Summary */}
                <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                  <h3 className="font-medium text-gray-900 mb-4">This Week's Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Visits</span>
                      <span className="font-medium text-gray-900">287</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Unique Members</span>
                      <span className="font-medium text-gray-900">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Average Daily Visits</span>
                      <span className="font-medium text-gray-900">41</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Busiest Day</span>
                      <span className="font-medium text-gray-900">Saturday</span>
                    </div>
                  </div>
                </div>

                {/* Full Report Button */}
                <button 
                  onClick={() => onNavigate?.('owner-attendance-reports')}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  <BarChart3 className="w-5 h-5 inline mr-2" />
                  View Full Report
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}