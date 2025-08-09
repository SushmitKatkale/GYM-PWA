import React, { useState, useEffect } from 'react';
import { X, Activity, Calendar, Clock, Smartphone, Monitor, Tablet } from 'lucide-react';
import { adminUserService, User as AdminUser } from '../../../services/adminUserService';

interface UserActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
}

interface UserActivityData {
  loginHistory: { date: string; count: number }[];
  activitySummary: {
    totalLogins: number;
    lastLogin: string;
    avgSessionDuration: number;
    deviceTypes: { [key: string]: number };
  };
}

export function UserActivityModal({ isOpen, onClose, user }: UserActivityModalProps) {
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    if (isOpen && user) {
      loadActivityData();
    }
  }, [isOpen, user, selectedPeriod]);

  const loadActivityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await adminUserService.getUserActivity(user.id, selectedPeriod);
      
      if (response.success && response.data) {
        setActivityData(response.data);
      } else {
        setError('Failed to load user activity data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
      case 'phone':
        return <Smartphone className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'desktop':
      case 'computer':
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
              <p className="text-sm text-gray-500">
                Activity data for {user.firstName} {user.lastName} (@{user.username})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Period Selection */}
          <div className="flex space-x-2 mb-6">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  selectedPeriod === days
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Last {days} days
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          ) : activityData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Logins</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {activityData.activitySummary.totalLogins}
                  </p>
                  <p className="text-xs text-blue-700">
                    In the last {selectedPeriod} days
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Avg. Session</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {formatDuration(activityData.activitySummary.avgSessionDuration)}
                  </p>
                  <p className="text-xs text-green-700">Average duration</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Last Login</span>
                  </div>
                  <p className="text-sm font-bold text-purple-900 mt-2">
                    {activityData.activitySummary.lastLogin 
                      ? new Date(activityData.activitySummary.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                  <p className="text-xs text-purple-700">
                    {activityData.activitySummary.lastLogin 
                      ? new Date(activityData.activitySummary.lastLogin).toLocaleTimeString()
                      : 'No login recorded'
                    }
                  </p>
                </div>
              </div>

              {/* Device Usage */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Device Usage</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(activityData.activitySummary.deviceTypes).map(([device, count]) => (
                    <div key={device} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        {getDeviceIcon(device)}
                      </div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{device}</p>
                      <p className="text-xs text-gray-500">{count} logins</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Login History Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Login Activity</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityData.loginHistory.length > 0 ? (
                    activityData.loginHistory.map((entry, index) => {
                      const maxCount = Math.max(...activityData.loginHistory.map(e => e.count));
                      const percentage = maxCount > 0 ? (entry.count / maxCount) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                            <div 
                              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                              {entry.count} login{entry.count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No login activity in the selected period</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Activity Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Most active day:</span> {' '}
                      {activityData.loginHistory.length > 0 
                        ? new Date(
                            activityData.loginHistory.reduce((max, entry) => 
                              entry.count > max.count ? entry : max
                            ).date
                          ).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                        : 'No data'
                      }
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Login frequency:</span> {' '}
                      {activityData.activitySummary.totalLogins > 0 
                        ? `${(activityData.activitySummary.totalLogins / selectedPeriod * 7).toFixed(1)} times/week`
                        : 'No activity'
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Account age:</span> {' '}
                      {Math.floor((Date.now() - new Date(user.createTimestamp).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">User type:</span> {' '}
                      {user.type === '1' ? 'Regular User' : user.type === '2' ? 'Gym Owner' : 'Admin'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
