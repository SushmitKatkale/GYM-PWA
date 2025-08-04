import React from 'react';
import { Building, Users, Calendar, TrendingUp, Clock, DollarSign } from 'lucide-react';

export function OwnerDashboard() {
  const stats = [
    { label: 'Active Members', value: '245', change: '+8%', icon: Users, color: 'bg-blue-500' },
    { label: "Today's Check-ins", value: '89', change: '+15%', icon: Clock, color: 'bg-green-500' },
    { label: 'Monthly Revenue', value: '$12,450', change: '+12%', icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Occupancy Rate', value: '78%', change: '+5%', icon: TrendingUp, color: 'bg-purple-500' }
  ];

  const recentActivity = [
    { user: 'John Smith', action: 'Checked in', gym: 'FitZone Downtown', time: '10 mins ago' },
    { user: 'Sarah Johnson', action: 'Booked class', gym: 'FitZone Downtown', time: '25 mins ago' },
    { user: 'Mike Davis', action: 'Renewed subscription', gym: 'FitZone Downtown', time: '1 hour ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from yesterday</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gym Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Gyms Performance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">FitZone Downtown</p>
                  <p className="text-sm text-gray-500">245 active members</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">78%</p>
                <p className="text-xs text-gray-500">Capacity</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Building className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">PowerHouse Gym</p>
                  <p className="text-sm text-gray-500">189 active members</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">65%</p>
                <p className="text-xs text-gray-500">Capacity</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-500">{activity.action} at {activity.gym}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-medium">Schedule Class</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-green-600 font-medium">Add Member</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-purple-600 font-medium">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}