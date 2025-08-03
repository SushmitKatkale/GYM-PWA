import React from 'react';

export const EnvDebug: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded text-xs">
      <div>Environment Debug:</div>
      <div>API Key: {apiKey ? '✅ Loaded' : '❌ Missing'}</div>
      <div>Length: {apiKey?.length || 0}</div>
    </div>
  );
};
