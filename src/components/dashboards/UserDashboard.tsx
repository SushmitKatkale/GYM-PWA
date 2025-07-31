import { MapPin, Calendar, Clock, CreditCard, Activity, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp, Attendance } from '../../contexts/AppContext';

export function UserDashboard() {
  const { user } = useAuth();
  const { attendance } = useApp();

  const userAttendance = attendance.filter((a: Attendance) => a.userId === user?.id);
  const thisWeekAttendance = userAttendance.filter((a: Attendance) => {
    const attendanceDate = new Date(a.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return attendanceDate >= weekAgo;
  });

  const stats = [
    { label: 'This Week', value: thisWeekAttendance.length, icon: Clock, color: 'bg-blue-500' },
    { label: 'This Month', value: userAttendance.length, icon: Calendar, color: 'bg-green-500' },
    { label: 'Active Subscriptions', value: user?.subscriptions?.length || 0, icon: CreditCard, color: 'bg-yellow-500' },
    { label: 'Favorite Gym', value: 'FitZone', icon: MapPin, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Ready for another great workout?</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Quick Check-in
          </button>
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
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Subscription */}
      {user?.subscriptions && user.subscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Active Subscription</h3>
              <p className="text-green-100 mt-1">{user.subscriptions[0].gymName}</p>
              <p className="text-sm text-green-100 mt-2">
                {user.subscriptions[0].planType.charAt(0).toUpperCase() + user.subscriptions[0].planType.slice(1)} Plan
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${user.subscriptions[0].amount}</p>
              <p className="text-sm text-green-100">
                Expires: {new Date(user.subscriptions[0].endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h3>
          {userAttendance.length > 0 ? (
            <div className="space-y-3">
              {userAttendance.slice(0, 3).map((session: Attendance, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Workout Session</p>
                    <p className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {session.duration ? `${Math.round(session.duration / 60)} mins` : 'In progress'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No workouts yet</p>
              <p className="text-sm text-gray-400">Start your fitness journey today!</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-medium">Find Nearby Gyms</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-blue-600 font-medium">Book a Class</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-purple-600 font-medium">Set Fitness Goals</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
