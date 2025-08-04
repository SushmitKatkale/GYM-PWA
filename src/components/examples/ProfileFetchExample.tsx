import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { User, RefreshCw } from 'lucide-react';

/**
 * Example component showing how to manually fetch user profile
 * This can be used when the automatic profile fetch during login fails
 * or when you need to refresh user data
 */
export function ProfileFetchExample() {
  const { user, fetchUserProfile, isLoading } = useAuthStore();
  const [isFetching, setIsFetching] = React.useState(false);

  const handleFetchProfile = async () => {
    setIsFetching(true);
    try {
      const success = await fetchUserProfile();
      if (success) {
        console.log('Profile fetched successfully');
      } else {
        console.log('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsFetching(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <User className="w-5 h-5 mr-2" />
        User Profile
      </h3>
      
      <div className="space-y-2 mb-4">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Name:</strong> {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not set'}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
      </div>

      <button
        onClick={handleFetchProfile}
        disabled={isLoading || isFetching}
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
        {isFetching ? 'Fetching Profile...' : 'Refresh Profile'}
      </button>
      
      <p className="text-sm text-gray-600 mt-2">
        Use this button to manually fetch the latest user profile data from the API.
      </p>
    </div>
  );
}
