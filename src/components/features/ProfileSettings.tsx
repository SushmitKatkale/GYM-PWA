import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Bell, Shield, Camera, Save, Eye, EyeOff, Settings, Loader2, Plus, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';
import { 
  userService, 
  type NotificationSettings, 
  type PrivacySettings, 
  type AppPreferences, 
  type EmergencyContact,
  type FitnessGoal 
} from '../../services/userService';

interface EmergencyContactInfo {
  id?: string;
  name: string;
  phone: string;
  relationship: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  height: string;
  weight: string;
  fitnessGoals: string[];
  emergencyContacts: EmergencyContactInfo[];
}

interface ProfileSettingsProps {
  activeSettingsTab?: string;
  onTabChange?: (tab: string) => void;
}

export function ProfileSettings({ activeSettingsTab = 'profile', onTabChange }: ProfileSettingsProps) {
  const { user, logout } = useAuthStore();
  const { addNotification } = useApp();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy' | 'preferences'>(activeSettingsTab as any || 'profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [availableFitnessGoals, setAvailableFitnessGoals] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // Profile data
  const [profile, setProfile] = useState<UserProfile>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    fitnessGoals: [],
    emergencyContacts: []
  });

  // Security settings
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    subscriptionReminders: true,
    classReminders: true,
    promotionalEmails: false,
    workoutReminders: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    shareWorkoutData: false,
    shareProgressPhotos: false,
    allowFriendRequests: true
  });

  // App preferences
  const [appPreferences, setAppPreferences] = useState({
    darkMode: false,
    language: 'en',
    units: 'metric',
    autoSync: true,
    offlineMode: false,
    dataUsage: 'normal',
    animationsEnabled: true,
    soundEffects: true
  });

  const fitnessGoalOptions = [
    'Weight Loss', 'Muscle Building', 'Endurance', 'Flexibility', 
    'General Fitness', 'Strength Training', 'Cardio Health'
  ];

  // Sync activeTab with prop changes
  useEffect(() => {
    setActiveTab(activeSettingsTab as any || 'profile');
  }, [activeSettingsTab]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsDataLoading(true);
        
        // Load complete profile data
        const profileResponse = await userService.getCompleteProfile();
        if (profileResponse.success) {
          const data = profileResponse.data;
          
          // Update profile state with backend data
          setProfile(prev => ({
            ...prev,
            firstName: data.firstName || prev.firstName,
            lastName: data.lastName || prev.lastName,
            email: data.email || prev.email,
            phone: data.phoneNumber || '',
            dateOfBirth: data.profile?.dateOfBirth || '',
            gender: data.profile?.gender || '',
            height: data.profile?.height || '',
            weight: data.profile?.weight || '',
            emergencyContacts: data.emergencyContacts?.map(contact => ({
              id: contact.id,
              name: contact.name,
              phone: contact.phoneNumber,
              relationship: contact.relationship
            })) || [],
            fitnessGoals: data.fitnessGoals?.map(fg => fg.goalName) || []
          }));

          // Load current profile image if available
          try {
            const imageUrl = await userService.getProfileImageUrl();
            setProfileImage(imageUrl);
          } catch (error) {
            // Profile image not found or error occurred - this is OK
            console.log('No profile image found or error loading image:', error);
          }

          // Update settings with backend data
          if (data.notificationSettings) {
            setNotificationSettings({
              emailNotifications: data.notificationSettings.emailNotifications ?? true,
              pushNotifications: data.notificationSettings.pushNotifications ?? true,
              smsNotifications: data.notificationSettings.smsNotifications ?? false,
              subscriptionReminders: data.notificationSettings.subscriptionReminders ?? true,
              classReminders: data.notificationSettings.classReminders ?? true,
              promotionalEmails: data.notificationSettings.promotionalEmails ?? false,
              workoutReminders: data.notificationSettings.workoutReminders ?? true
            });
          }
          if (data.privacySettings) {
            setPrivacySettings({
              profileVisibility: data.privacySettings.profileVisibility ?? 'private',
              shareWorkoutData: data.privacySettings.shareWorkoutData ?? false,
              shareProgressPhotos: data.privacySettings.shareProgressPhotos ?? false,
              allowFriendRequests: data.privacySettings.allowFriendRequests ?? true
            });
          }
          if (data.appPreferences) {
            setAppPreferences({
              darkMode: data.appPreferences.darkMode ?? false,
              language: data.appPreferences.language ?? 'en',
              units: data.appPreferences.units ?? 'metric',
              autoSync: data.appPreferences.autoSync ?? true,
              offlineMode: data.appPreferences.offlineMode ?? false,
              dataUsage: data.appPreferences.dataUsage ?? 'normal',
              animationsEnabled: data.appPreferences.animationsEnabled ?? true,
              soundEffects: data.appPreferences.soundEffects ?? true
            });
          }
        }

        // Load available fitness goals
        const goalsResponse = await userService.getFitnessGoals();
        if (goalsResponse.success) {
          setAvailableFitnessGoals(goalsResponse.data);
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
        addNotification({
          title: 'Error',
          message: 'Failed to load profile data',
          type: 'error'
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    loadUserData();
  }, [addNotification]);

  const handleAddEmergencyContact = () => {
    setProfile((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relationship: '' }]
    }));
  };

  const handleRemoveEmergencyContact = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContactInfo, value: string) => {
    setProfile((prev) => {
      const updatedContacts = [...prev.emergencyContacts];
      updatedContacts[index] = { ...updatedContacts[index], [field]: value };
      return { ...prev, emergencyContacts: updatedContacts };
    });
  };

  const handleProfileSave = async () => {
    // Validate required fields
    if (!profile.firstName || !profile.lastName) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Update basic profile information and extended data
      // Validate and sanitize date before sending
      let sanitizedDateOfBirth = profile.dateOfBirth;
      if (profile.dateOfBirth) {
        const date = new Date(profile.dateOfBirth);
        if (isNaN(date.getTime())) {
          sanitizedDateOfBirth = null;
        }
      } else {
        sanitizedDateOfBirth = null;
      }

      await userService.updateUserProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phoneNumber: profile.phone,
        dateOfBirth: sanitizedDateOfBirth,
        gender: profile.gender,
        height: profile.height || null,
        weight: profile.weight || null
      });

      // Update emergency contacts if provided
      if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
        for (const contact of profile.emergencyContacts) {
          if (contact.name || contact.phone) {
            if (contact.id) {
              // Update existing contact
              await userService.updateEmergencyContact(parseInt(contact.id), {
                name: contact.name,
                phoneNumber: contact.phone,
                relationship: contact.relationship
              });
            } else {
              // Add new contact
              await userService.addEmergencyContact({
                name: contact.name,
                phoneNumber: contact.phone,
                relationship: contact.relationship
              });
            }
          }
        }
      }

      // Update fitness goals
      const goalIds = profile.fitnessGoals.map((goalName, index) => ({
        goalId: availableFitnessGoals.find(g => g.goalName === goalName)?.id || index + 1,
        priority: index + 1
      }));
      
      if (goalIds.length > 0) {
        await userService.updateFitnessGoals(goalIds);
      }

      addNotification({
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      addNotification({
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all password fields',
        type: 'error'
      });
      return;
    }

    if (passwords.new !== passwords.confirm) {
      addNotification({
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match',
        type: 'error'
      });
      return;
    }

    if (passwords.new.length < 8) {
      addNotification({
        title: 'Weak Password',
        message: 'Password must be at least 8 characters long',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    userService.changePassword(profile.email, passwords.current, passwords.new)
      .then((response) => {
        if (response.success) {
          addNotification({
            title: 'Password Changed',
            message: 'Your password has been successfully updated',
            type: 'success'
          });
          setPasswords({ current: '', new: '', confirm: '' });
        } else {
          addNotification({
            title: 'Update Failed',
            message: response.message || 'Unable to change password',
            type: 'error'
          });
        }
      })
      .catch(error => {
        console.error('Error changing password:', error);
        addNotification({
          title: 'Error',
          message: 'An unexpected error occurred while changing the password',
          type: 'error'
        });
      }).finally(() => {
        setIsLoading(false);
      });
  };

  const handleFitnessGoalToggle = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal]
    }));
  };

  const handleNotificationSettingsSave = async () => {
    try {
      setIsLoading(true);
      await userService.updateNotificationSettings(notificationSettings);
      addNotification({
        title: 'Settings Updated',
        message: 'Your notification settings have been saved',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      addNotification({
        title: 'Update Failed',
        message: 'Failed to update notification settings',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacySettingsSave = async () => {
    try {
      setIsLoading(true);
      await userService.updatePrivacySettings(privacySettings);
      addNotification({
        title: 'Settings Updated',
        message: 'Your privacy settings have been saved',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      addNotification({
        title: 'Update Failed',
        message: 'Failed to update privacy settings',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppPreferencesSave = async () => {
    try {
      setIsLoading(true);
      await userService.updateAppPreferences(appPreferences);
      addNotification({
        title: 'Settings Updated',
        message: 'Your app preferences have been saved',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating app preferences:', error);
      addNotification({
        title: 'Update Failed',
        message: 'Failed to update app preferences',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDisable = () => {
    if (window.confirm('Are you sure you want to disable your account? You can reactivate it later by contacting support.')) {
      // Simulate account disable
      addNotification({
        title: 'Account Disabled',
        message: 'Your account has been disabled. Contact support to reactivate.',
        type: 'info'
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification({
        title: 'Invalid File',
        message: 'Please select a valid image file',
        type: 'error'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        title: 'File Too Large',
        message: 'Image size should be less than 5MB',
        type: 'error'
      });
      return;
    }

    try {
      setIsImageUploading(true);
      
      // Create a preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);

      // Upload to backend
      const response = await userService.uploadProfileImage(file);
      
      if (response.success) {
        // After successful upload, load the image from backend to get proper URL
        try {
          const imageUrl = await userService.getProfileImageUrl();
          setProfileImage(imageUrl);
        } catch (imageError) {
          console.error('Error loading uploaded image:', imageError);
          // Keep the preview URL if we can't load from backend
        }
        
        addNotification({
          title: 'Image Uploaded',
          message: 'Profile image has been updated successfully',
          type: 'success'
        });
      } else {
        throw new Error(response.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading image:', error);
      addNotification({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        type: 'error'
      });
      // Reset to previous state on error
      setProfileImage(null);
    } finally {
      setIsImageUploading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden">
                  {profileImage ? (
                    <img 
                      src={profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span>
                      {profile.firstName[0]}{profile.lastName[0]}
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-image-upload"
                />
                <button 
                  type="button"
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  disabled={isImageUploading}
                >
                  {isImageUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
                <p className="text-sm text-gray-600">Click the camera icon to upload a new photo (max 5MB)</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Physical Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Fitness Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goals</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {fitnessGoalOptions.map((goal) => (
                  <label key={goal} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.fitnessGoals.includes(goal)}
                      onChange={() => handleFitnessGoalToggle(goal)}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
                <button
                  onClick={handleAddEmergencyContact}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Contact</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {profile.emergencyContacts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No emergency contacts added yet.</p>
                ) : (
                  profile.emergencyContacts.map((contact, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Contact {index + 1}</h4>
                        {profile.emergencyContacts.length > 0 && (
                          <button
                            onClick={() => handleRemoveEmergencyContact(index)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={contact.name}
                            onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                          <input
                            type="text"
                            value={contact.relationship}
                            onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Spouse, Parent, Friend"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleProfileSave}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                  }
                }}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwords.current}
                      onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwords.new}
                      onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Password
                </button>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            {/* <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div> */}

            {/* Account Disable */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Disable Account</h3>
              <p className="text-sm text-orange-700 mb-4">
                Temporarily disable your account. You can reactivate it later by contacting support.
              </p>
              <button
                onClick={handleAccountDisable}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Disable My Account
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getNotificationDescription(key)}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <button
                onClick={handleNotificationSettingsSave}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Notification Settings</span>
              </button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Profile Visibility</h3>
              <p className="text-sm text-gray-600 mb-3">Control who can see your profile information</p>
              <div className="space-y-2">
                {['public', 'friends', 'private'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      value={option}
                      checked={privacySettings.profileVisibility === option}
                      onChange={(e) => setPrivacySettings(prev => ({
                        ...prev,
                        profileVisibility: e.target.value
                      }))}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {Object.entries(privacySettings).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getPrivacyDescription(key)}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => setPrivacySettings(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <button
                onClick={handlePrivacySettingsSave}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Privacy Settings</span>
              </button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            {Object.entries(appPreferences).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setAppPreferences(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <button
                onClick={handleAppPreferencesSave}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save App Preferences</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getNotificationDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      emailNotifications: 'Receive notifications via email',
      pushNotifications: 'Receive push notifications on your device',
      smsNotifications: 'Receive SMS notifications on your phone',
      subscriptionReminders: 'Get reminded about subscription renewals',
      classReminders: 'Get reminded about upcoming classes',
      promotionalEmails: 'Receive promotional offers and updates',
      workoutReminders: 'Get reminded about your workout schedule'
    };
    return descriptions[key] || '';
  };

  const getPrivacyDescription = (key: string) => {
    const descriptions: { [key: string]: string } = {
      shareWorkoutData: 'Allow sharing your workout statistics',
      shareProgressPhotos: 'Allow sharing your progress photos',
      allowFriendRequests: 'Allow other users to send friend requests'
    };
    return descriptions[key] || '';
  };

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-6 max-w-full mx-auto">
      {/* Desktop Tab Navigation */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy', icon: Lock },
              { id: 'preferences', label: 'Preferences', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {renderTabContent()}
      </div>
    </div>
  );
}
