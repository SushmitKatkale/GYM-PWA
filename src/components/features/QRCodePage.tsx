import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { QrCode, Scan, Clock, MapPin, Calendar } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAttendanceStore } from '../../stores/attendanceStore';
import { useGymStore } from '../../stores/gymStore';
import { QrScanner } from './QrScanner';

export function QRCodePage() {
  const { user } = useAuthStore();
  const { checkIn, checkOut, getUserAttendance, getActiveSession, isLoading, error } = useAttendanceStore();
  const { gyms, updateGymOccupancy } = useGymStore();
  const [qrCode, setQrCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const activeSession = user ? getActiveSession(user.id) : null;
  const userAttendance = user ? getUserAttendance(user.id) : [];

  // Get current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Generate dynamic QR code
  useEffect(() => {
    const generateQR = () => {
      const timestamp = Date.now();
      const userId = user?.id || '';
      const code = `${userId}-${timestamp}`;
      setQrCode(code);
    };

    generateQR();
    const interval = setInterval(generateQR, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user?.id]);

  const handleCheckIn = async (gymId: string = 'gym1') => {
    if (user && !activeSession) {
      const success = await checkIn(user.id, gymId, 'manual', currentLocation || undefined, qrCode);
      if (success) {
        updateGymOccupancy(gymId, 1);
      }
    }
  };

  const handleCheckOut = async () => {
    if (activeSession) {
      const success = await checkOut(activeSession.id);
      if (success) {
        updateGymOccupancy(activeSession.gymId, -1);
      }
    }
  };

  const handleManualEntry = async () => {
    if (manualCode.length === 6) {
      if (activeSession) {
        await handleCheckOut();
      } else {
        await handleCheckIn();
      }
      setManualCode('');
    }
  };

  const handleQRScan = async (scannedData: string) => {
    console.log('QR Code scanned:', scannedData);
    // Process the scanned QR code data
    if (activeSession) {
      await handleCheckOut();
    } else {
      await handleCheckIn();
    }
    setShowScanner(false);
  };

  const getCurrentGym = () => {
    if (!activeSession) return null;
    return gyms.find(gym => gym.id === activeSession.gymId);
  };

  const currentGym = getCurrentGym();

  return (
    <div className="space-y-4 pb-4">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Status Card */}
      <div className={`rounded-xl p-4 sm:p-6 text-white ${
        activeSession 
          ? 'bg-gradient-to-r from-green-500 to-teal-600' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-semibold">
              {activeSession ? 'Active Session' : 'Ready to Check In'}
            </h3>
            <p className="text-xs sm:text-sm opacity-90 mt-1">
              {activeSession ? 'You are currently checked in' : 'Use QR code or enter gym code'}
            </p>
          </div>
          <div className="text-left sm:text-right">
            {activeSession && (
              <>
                <div className="flex items-center text-xs sm:text-sm opacity-90 mb-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span>Since {new Date(activeSession.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center text-xs sm:text-sm opacity-90">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="truncate max-w-32 sm:max-w-none">{currentGym?.name || 'Unknown Gym'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Your QR Code</h3>
          <div className="inline-block p-4 sm:p-6 bg-gray-50 rounded-xl">
            <div className="w-40 h-40 sm:w-48 sm:h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mx-auto p-3 sm:p-4">
              <div className="text-center w-full">
                <div className="mb-2">
                  <QRCode
                    value={qrCode}
                    size={window.innerWidth < 640 ? 140 : 160}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-xs text-gray-500 font-mono">{qrCode.slice(-8)}</p>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-4">
            Show this QR code to the gym scanner or scan a gym's QR code
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Code refreshes every 30 seconds for security
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {!activeSession ? (
          <>
            <button
              disabled={isLoading}
              onClick={() => setShowScanner(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Scan Gym QR Code</span>
            </button>
            <button
              disabled={isLoading}
              onClick={() => handleCheckIn()}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isLoading ? 'Checking In...' : 'Quick Check In'}</span>
            </button>
          </>
        ) : (
          <div className="sm:col-span-2">
            <button
              disabled={isLoading}
              onClick={handleCheckOut}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isLoading ? 'Checking Out...' : 'Check Out'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual Code Entry */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit gym code"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-base sm:text-lg tracking-widest"
            maxLength={6}
          />
          <button
            onClick={handleManualEntry}
            disabled={manualCode.length !== 6}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {activeSession ? 'Check Out' : 'Check In'}
          </button>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">
          Ask gym staff for the 6-digit code if QR scanning is not available
        </p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
        <div className="space-y-3">
          {userAttendance
            .slice(0, 5)
            .map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {new Date(session.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(session.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {session.checkOut && (
                      ` - ${new Date(session.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {session.duration ? (
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {Math.round(session.duration / 60)} mins
                  </span>
                ) : (
                  <span className="text-xs sm:text-sm text-green-600 font-medium">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QrScanner 
        isOpen={showScanner}
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
      />
    </div>
  );
}