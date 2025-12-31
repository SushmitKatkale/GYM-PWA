import React, { useEffect, useState } from 'react';
import { 
  Wallet, IndianRupee, ArrowUp, ArrowDown, TrendingUp, Calendar,
  RefreshCw, AlertCircle, Download, Eye, Plus, CreditCard, 
  Clock, CheckCircle, XCircle, Loader, Filter, Search
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { walletService, WalletData, Transaction } from '../../services/walletService';
import { 
  DevelopmentErrorDisplay, 
  createApiError, 
  useDevelopmentErrors, 
  shouldShowErrors 
} from '../../utils/developmentError';

interface OwnerWalletMobileProps {
  onBack?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export function OwnerWalletMobile({ onBack, onNavigate }: OwnerWalletMobileProps) {
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payouts'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { errors: devErrors, addError: addDevError, clearErrors: clearDevErrors } = useDevelopmentErrors();

  // Fetch wallet data on component mount
  useEffect(() => {
    fetchWalletData();
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchWalletData = async () => {
    try {
      setIsLoading(true);
      const response = await walletService.getWalletOverview();
      if (response.success && response.data) {
        setWalletData(response.data);
      } else {
        const apiError = createApiError('/api/owner/wallet', 'GET', new Error(response.message || 'Failed to fetch wallet data'));
        addDevError(apiError);
      }
    } catch (error) {
      const apiError = createApiError('/api/owner/wallet', 'GET', error);
      addDevError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await walletService.getTransactions(1, 20);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
      } else {
        const apiError = createApiError('/api/owner/wallet/transactions', 'GET', new Error(response.message || 'Failed to fetch transactions'));
        addDevError(apiError);
      }
    } catch (error) {
      const apiError = createApiError('/api/owner/wallet/transactions', 'GET', error);
      addDevError(apiError);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    clearDevErrors();
    try {
      await fetchWalletData();
      if (activeTab === 'transactions') {
        await fetchTransactions();
      }
    } catch (err) {
      const apiError = createApiError('/api/owner/wallet', 'GET', err);
      addDevError(apiError);
    } finally {
      setRefreshing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'payout': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'commission': return <IndianRupee className="w-4 h-4 text-orange-600" />;
      default: return <IndianRupee className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earning': return 'text-green-600';
      case 'payout': return 'text-red-600';
      case 'commission': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Loader className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-medium text-gray-900 font-poppins">Wallet</h1>
            <p className="text-sm text-gray-500">Earnings & payouts</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'transactions'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'payouts'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Payouts
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Development Error Display */}
        {shouldShowErrors() && devErrors.length > 0 && (
          <div className="space-y-2">
            {devErrors.map((devError, index) => (
              <DevelopmentErrorDisplay
                key={index}
                error={devError}
                onRetry={handleRefresh}
                onDismiss={() => clearDevErrors()}
              />
            ))}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wallet data...</p>
          </div>
        ) : activeTab === 'overview' && walletData && (
          <>
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">Current Balance</p>
                  <p className="text-3xl font-bold">₹{walletData.currentBalance.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs">Pending Earnings</p>
                  <p className="text-lg font-semibold">₹{walletData.pendingEarnings.toLocaleString()}</p>
                </div>
                <button className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors">
                  Request Payout
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Earnings</p>
                    <p className="text-lg font-semibold text-gray-900">₹{walletData.monthlyEarnings.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{walletData.weeklyGrowth}% this week</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Next Payout</p>
                    <p className="text-lg font-semibold text-gray-900">{walletData.nextPayoutDate}</p>
                    <p className="text-xs text-gray-500">Auto transfer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-4">This Month's Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gross Earnings</span>
                  <span className="font-medium text-gray-900">₹{(walletData.monthlyEarnings / (1 - walletData.commission)).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Commission ({(walletData.commission * 100).toFixed(0)}%)</span>
                  <span className="font-medium text-red-600">-₹{(walletData.monthlyEarnings * walletData.commission / (1 - walletData.commission)).toFixed(0)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Net Earnings</span>
                    <span className="font-semibold text-green-600">₹{walletData.monthlyEarnings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Preview */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Recent Transactions</h3>
                <button 
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-blue-600 font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            {/* Period Filter */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {['week', 'month', 'year'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period as any)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors capitalize ${
                      selectedPeriod === period
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{transaction.description}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">{transaction.date}</p>
                          {transaction.reference && (
                            <span className="text-xs text-gray-400">• {transaction.reference}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${getTransactionColor(transaction.type)}`}>
                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getStatusIcon(transaction.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {transaction.gymName && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Gym:</span> {transaction.gymName}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'payouts' && (
          <>
            {/* Payout Summary */}
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Payout Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">₹{walletData.currentBalance.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Available Balance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">₹{walletData.pendingEarnings.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Pending Amount</p>
                </div>
              </div>
              
              <button className="w-full mt-4 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Request New Payout
              </button>
            </div>

            {/* Payout History */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Payout History</h3>
              
              {payouts.map((payout) => (
                <div key={payout.id} className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">₹{payout.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{payout.method} • {payout.account}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(payout.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Requested:</span> {payout.requestDate}
                    </div>
                    <div>
                      <span className="font-medium">Processed:</span> {payout.processedDate || 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}