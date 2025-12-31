import React, { useState } from 'react';
import { 
  Settings, User, Shield, Bell, CreditCard, HelpCircle, 
  ChevronRight, Edit, Camera, LogOut, ArrowLeft, Phone, 
  Mail, MapPin, Globe, Clock, IndianRupee, Eye, EyeOff,
  Save, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';

interface OwnerSettingsMobileProps {
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function OwnerSettingsMobile({ onBack, onNavigate }: OwnerSettingsMobileProps) {
  const { user, logout } = useAuthStore();
  
  const [activeSection, setActiveSection] = useState<'main' | 'profile' | 'business' | 'notifications' | 'security'>('main');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();

  // Mock business settings
  const [businessSettings, setBusinessSettings] = useState({
    businessName: 'FitLife Gym Chain',
    email: user?.email || '',
    phone: '+1 234-567-8900',
    website: 'www.fitlifegym.com',
    address: '123 Fitness Street, Gym City, GC 12345',
    gstNumber: 'GST123456789',
    panNumber: 'ABCDE1234F',
    bankAccount: '****1234',
    ifscCode: 'HDFC0001234',
    autoPayouts: true,
    payoutFrequency: 'monthly',
    commissionRate: 15
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newMemberJoined: true,
    paymentReceived: true,
    memberCheckin: false,
    lowAttendance: true,
    monthlyReport: true,
    systemUpdates: true,
    marketingEmails: false,
    pushNotifications: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  const handleSave = async () => {
    setIsSaving(true);
    clearDevErrors();
    try {
      // Simulate API call - would be real API in production
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      const apiError = createApiError('/api/owner/settings', 'PUT', err);
      addDevError(apiError);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      onNavigate?.('login');
    }
  };

  // Profile Settings Section
  if (activeSection === 'profile') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Profile Settings</h1>
              <p className="text-sm text-gray-500">Personal information</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Profile Photo */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user?.username} className='object-cover h-full w-full' />
                  ) : (
                    <span className="text-white font-semibold text-2xl">
                      {(user?.username || user?.firstName || 'O')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Profile Photo</h3>
                <p className="text-sm text-gray-500">Update your profile picture</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Personal Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  defaultValue={user?.firstName || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  defaultValue={user?.lastName || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={user?.phoneNumber || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <div className="flex items-center space-x-2">
                {saveMessage.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">{saveMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Business Settings Section
  if (activeSection === 'business') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Business Settings</h1>
              <p className="text-sm text-gray-500">Business preferences</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Business Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Business Information</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessSettings.businessName}
                  onChange={(e) => setBusinessSettings(prev => ({...prev, businessName: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={businessSettings.website}
                  onChange={(e) => setBusinessSettings(prev => ({...prev, website: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={businessSettings.gstNumber}
                  onChange={(e) => setBusinessSettings(prev => ({...prev, gstNumber: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Payout Settings */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Payout Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Auto Payouts</p>
                  <p className="text-sm text-gray-500">Automatic transfers to your bank</p>
                </div>
                <button
                  onClick={() => setBusinessSettings(prev => ({...prev, autoPayouts: !prev.autoPayouts}))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    businessSettings.autoPayouts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      businessSettings.autoPayouts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payout Frequency</label>
                <select
                  value={businessSettings.payoutFrequency}
                  onChange={(e) => setBusinessSettings(prev => ({...prev, payoutFrequency: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={businessSettings.bankAccount}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Information */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Commission Structure</h3>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <IndianRupee className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Platform Commission</span>
              </div>
              <p className="text-sm text-blue-800">
                You are charged {businessSettings.commissionRate}% on all transactions processed through our platform.
              </p>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <div className="flex items-center space-x-2">
                {saveMessage.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">{saveMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Notifications Section
  if (activeSection === 'notifications') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Notifications</h1>
              <p className="text-sm text-gray-500">Manage your notifications</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Business Notifications */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Business Notifications</h3>
            
            {Object.entries(notificationSettings).slice(0, 6).map(([key, value]) => {
              const labels: Record<string, string> = {
                newMemberJoined: 'New member joined',
                paymentReceived: 'Payment received',
                memberCheckin: 'Member check-ins',
                lowAttendance: 'Low attendance alerts',
                monthlyReport: 'Monthly reports',
                systemUpdates: 'System updates'
              };
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{labels[key]}</p>
                  <button
                    onClick={() => setNotificationSettings(prev => ({...prev, [key]: !value}))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Marketing & Communication */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Marketing & Communication</h3>
            
            {Object.entries(notificationSettings).slice(6).map(([key, value]) => {
              const labels: Record<string, string> = {
                marketingEmails: 'Marketing emails',
                pushNotifications: 'Push notifications'
              };
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{labels[key]}</p>
                  <button
                    onClick={() => setNotificationSettings(prev => ({...prev, [key]: !value}))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <div className="flex items-center space-x-2">
                {saveMessage.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">{saveMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Security Section
  if (activeSection === 'security') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-medium text-gray-900 font-poppins">Security</h1>
              <p className="text-sm text-gray-500">Account security settings</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Password */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Password</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
            </div>
            
            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Change Password
            </button>
          </div>

          {/* Security Features */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Security Features</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add extra security to your account</p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({...prev, twoFactorAuth: !prev.twoFactorAuth}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Login Alerts</p>
                <p className="text-sm text-gray-500">Get notified of new logins</p>
              </div>
              <button
                onClick={() => setSecuritySettings(prev => ({...prev, loginAlerts: !prev.loginAlerts}))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.loginAlerts ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={`p-3 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <div className="flex items-center space-x-2">
                {saveMessage.includes('Error') ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                <span className="text-sm font-medium">{saveMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Settings Menu
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-900 font-poppins">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="p-4 space-y-4">
        {/* Account Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Account</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setActiveSection('profile')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Profile</p>
                  <p className="text-sm text-gray-500">Personal information</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setActiveSection('business')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Business Settings</p>
                  <p className="text-sm text-gray-500">Business preferences</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setActiveSection('security')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Security</p>
                  <p className="text-sm text-gray-500">Password & authentication</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Preferences</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setActiveSection('notifications')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-500">Manage your notifications</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigate?.('owner-support')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Support</p>
                  <p className="text-sm text-gray-500">Get help & contact support</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-600"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-red-600">Sign Out</p>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}