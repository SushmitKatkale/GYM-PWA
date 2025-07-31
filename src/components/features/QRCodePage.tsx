import React, { useState, useEffect } from 'react';
import { QrCode, Scan, Clock, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

export function QRCodePage() {
  const { user } = useAuth();
  const { addAttendance, updateAttendance, attendance } = useApp();
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  // Check for active session
  useEffect(() => {
    const active = attendance.find(a => a.userId === user?.id && !a.checkOut);
    setActiveSession(active?.id || null);
  }, [attendance, user?.id]);

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

  const handleCheckIn = (gymId: string = 'gym1') => {
    if (user) {
      addAttendance({
        userId: user.id,
        gymId,
        checkIn: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleCheckOut = () => {
    if (activeSession) {
      const checkOutTime = new Date().toISOString();
      const session = attendance.find(a => a.id === activeSession);
      if (session) {
        const duration = (new Date(checkOutTime).getTime() - new Date(session.checkIn).getTime()) / 1000;
        updateAttendance(activeSession, {
          checkOut: checkOutTime,
          duration
        });
        setActiveSession(null);
      }
    }
  };

  const handleManualEntry = () => {
    if (manualCode.length === 6) {
      if (activeSession) {
        handleCheckOut();
      } else {
        handleCheckIn();
      }
      setManualCode('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">QR Check-in</h1>
        <p className="text-gray-600 mt-2">
          {activeSession ? 'Currently checked in' : 'Scan or enter code to check in'}
        </p>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl p-6 text-white ${
        activeSession 
          ? 'bg-gradient-to-r from-green-500 to-teal-600' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {activeSession ? 'Active Session' : 'Ready to Check In'}
            </h3>
            <p className="text-sm opacity-90 mt-1">
              {activeSession ? 'You are currently checked in' : 'Use QR code or enter gym code'}
            </p>
          </div>
          <div className="text-right">
            {activeSession && (
              <>
                <div className="flex items-center text-sm opacity-90 mb-1">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Since {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center text-sm opacity-90">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>FitZone Downtown</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your QR Code</h3>
          <div className="inline-block p-6 bg-gray-50 rounded-xl">
            <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center mx-auto">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-mono">{qrCode}</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Show this QR code to the gym scanner or scan a gym's QR code
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Code refreshes every 30 seconds for security
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!activeSession ? (
          <>
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-colors"
            >
              <Scan className="w-5 h-5" />
              <span>Scan Gym QR Code</span>
            </button>
            <button
              onClick={() => handleCheckIn()}
              className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-6 rounded-xl transition-colors"
            >
              <QrCode className="w-5 h-5" />
              <span>Quick Check In</span>
            </button>
          </>
        ) : (
          <div className="md:col-span-2">
            <button
              onClick={handleCheckOut}
              className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-xl transition-colors"
            >
              <Clock className="w-5 h-5" />
              <span>Check Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Manual Code Entry */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
        <div className="flex space-x-3">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit gym code"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
            maxLength={6}
          />
          <button
            onClick={handleManualEntry}
            disabled={manualCode.length !== 6}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {activeSession ? 'Check Out' : 'Check In'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Ask gym staff for the 6-digit code if QR scanning is not available
        </p>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Check-ins</h3>
        <div className="space-y-3">
          {attendance
            .filter(a => a.userId === user?.id)
            .slice(0, 5)
            .map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(session.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {session.checkOut && (
                      ` - ${new Date(session.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {session.duration ? (
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round(session.duration / 60)} mins
                  </span>
                ) : (
                  <span className="text-sm text-green-600 font-medium">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}