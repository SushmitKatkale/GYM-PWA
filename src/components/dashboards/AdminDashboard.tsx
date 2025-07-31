import React from 'react';
import { Users, Building, TrendingUp, DollarSign, Activity } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '12,345', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Gyms', value: '156', change: '+5%', icon: Building, color: 'bg-green-500' },
    { label: 'Monthly Revenue', value: '$45,678', change: '+18%', icon: DollarSign, color: 'bg-yellow-500' },
    { label: 'Platform Growth', value: '23%', change: '+8%', icon: TrendingUp, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

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
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Gym Registrations</h3>
          <div className="space-y-3">
            {[
              { name: 'PowerFit Center', owner: 'Mike Johnson', date: '2 hours ago' },
              { name: 'Elite Fitness', owner: 'Sarah Wilson', date: '5 hours ago' },
              { name: 'Iron Paradise', owner: 'David Chen', date: '1 day ago' }
            ].map((gym, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{gym.name}</p>
                  <p className="text-sm text-gray-500">Owner: {gym.owner}</p>
                </div>
                <span className="text-xs text-gray-400">{gym.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Server Status</span>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Database</span>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Gateway</span>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="text-green-600 font-medium">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}