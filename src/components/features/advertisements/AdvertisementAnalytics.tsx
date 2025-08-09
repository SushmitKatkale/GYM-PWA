import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Eye, MousePointer, Share2, Calendar, Filter } from 'lucide-react';
import { useAdvertisementStore } from '../../../stores/advertisementStore';

interface AdvertisementAnalyticsProps {
  onBack: () => void;
}

export function AdvertisementAnalytics({ onBack }: AdvertisementAnalyticsProps) {
  const {
    advertisements,
    advertisementStats,
    performance,
    fetchAdvertisements,
    fetchAdvertisementStats,
    fetchAdvertisementPerformance
  } = useAdvertisementStore();

  const [selectedAdId, setSelectedAdId] = useState<string>('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAdvertisements();
    fetchAdvertisementStats();
  }, [fetchAdvertisements, fetchAdvertisementStats]);

  useEffect(() => {
    if (selectedAdId) {
      fetchAdvertisementPerformance(selectedAdId, startDate, endDate);
    }
  }, [selectedAdId, startDate, endDate, fetchAdvertisementPerformance]);

  const handleDateRangeChange = (range: '7d' | '30d' | '90d') => {
    setDateRange(range);
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
    }

    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
  };

  const selectedPerformance = selectedAdId ? performance[selectedAdId] : null;

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    change?: string; 
    icon: any; 
    color: string; 
  }) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Advertisements
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advertisement Analytics</h1>
            <p className="text-sm text-gray-600">Track performance and engagement metrics</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDateRangeChange('7d')}
              className={`px-3 py-1 text-xs rounded-full ${
                dateRange === '7d' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => handleDateRangeChange('30d')}
              className={`px-3 py-1 text-xs rounded-full ${
                dateRange === '30d' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => handleDateRangeChange('90d')}
              className={`px-3 py-1 text-xs rounded-full ${
                dateRange === '90d' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              90 days
            </button>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      {advertisementStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Advertisements"
            value={advertisementStats.totalAds}
            icon={TrendingUp}
            color="bg-blue-600"
          />
          <MetricCard
            title="Total Impressions"
            value={advertisementStats.totalImpressions.toLocaleString()}
            icon={Eye}
            color="bg-purple-600"
          />
          <MetricCard
            title="Total Clicks"
            value={advertisementStats.totalClicks.toLocaleString()}
            icon={MousePointer}
            color="bg-green-600"
          />
          <MetricCard
            title="Average CTR"
            value={`${(advertisementStats.averageCTR * 100).toFixed(2)}%`}
            icon={TrendingUp}
            color="bg-orange-600"
          />
        </div>
      )}

      {/* Top Performing Ads */}
      {advertisementStats?.topPerformingAds && advertisementStats.topPerformingAds.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Top Performing Advertisements</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Advertisement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {advertisementStats.topPerformingAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ad.impressions.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ad.clicks.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(ad.ctr * 100).toFixed(2)}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedAdId(ad.id)}
                        className="text-blue-600 hover:text-blue-500 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Individual Ad Analysis */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Individual Advertisement Analysis</h2>
          <select
            value={selectedAdId}
            onChange={(e) => setSelectedAdId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an advertisement</option>
            {advertisements.map((ad) => (
              <option key={ad.id} value={ad.id}>
                {ad.title}
              </option>
            ))}
          </select>
        </div>

        {selectedPerformance ? (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Total Views"
                value={selectedPerformance.totalViews.toLocaleString()}
                icon={Eye}
                color="bg-blue-600"
              />
              <MetricCard
                title="Total Clicks"
                value={selectedPerformance.totalClicks.toLocaleString()}
                icon={MousePointer}
                color="bg-green-600"
              />
              <MetricCard
                title="Click-through Rate"
                value={`${(selectedPerformance.ctr * 100).toFixed(2)}%`}
                icon={TrendingUp}
                color="bg-purple-600"
              />
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-600">Total Shares</p>
                <p className="text-xl font-bold text-gray-900">{selectedPerformance.totalShares}</p>
              </div>
              {selectedPerformance.avgViewDuration && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Avg. View Duration</p>
                  <p className="text-xl font-bold text-gray-900">{selectedPerformance.avgViewDuration}s</p>
                </div>
              )}
              {selectedPerformance.conversionRate && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-xl font-bold text-gray-900">{(selectedPerformance.conversionRate * 100).toFixed(2)}%</p>
                </div>
              )}
              {selectedPerformance.costPerClick && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Cost Per Click</p>
                  <p className="text-xl font-bold text-gray-900">${selectedPerformance.costPerClick.toFixed(2)}</p>
                </div>
              )}
            </div>

            {/* Daily Performance Chart Placeholder */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Performance</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would go here</p>
                <p className="text-xs text-gray-400 ml-2">
                  (Integration with Chart.js or similar library needed)
                </p>
              </div>
            </div>

            {/* Geographic Performance */}
            {selectedPerformance.geographicData && selectedPerformance.geographicData.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Performance</h3>
                <div className="space-y-2">
                  {selectedPerformance.geographicData.slice(0, 5).map((geo, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-900">{geo.location}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{geo.views} views</span>
                        <span className="text-sm text-gray-600">{geo.clicks} clicks</span>
                        <span className="text-sm font-medium text-blue-600">
                          {geo.views > 0 ? ((geo.clicks / geo.views) * 100).toFixed(1) : 0}% CTR
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Device Performance */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Device Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedPerformance.deviceStats.mobile}</p>
                  <p className="text-sm text-gray-600">Mobile</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedPerformance.deviceStats.desktop}</p>
                  <p className="text-sm text-gray-600">Desktop</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedPerformance.deviceStats.tablet}</p>
                  <p className="text-sm text-gray-600">Tablet</p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedAdId ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading performance data...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Select an advertisement to view detailed analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
