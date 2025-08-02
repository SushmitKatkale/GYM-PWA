import React, { useState } from 'react';
import { Wallet, CreditCard, Plus, Minus, Download, History, Gift, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useApp } from '../../contexts/AppContext';

interface Transaction {
  id: string;
  type: 'topup' | 'payment' | 'refund' | 'cashback';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface WalletData {
  balance: number;
  pendingAmount: number;
  totalSpent: number;
  cashbackEarned: number;
}

export function WalletPage() {
  const { user } = useAuthStore();
  const { addNotification } = useApp();
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [promoCode, setPromoCode] = useState('');

  // Mock wallet data
  const [walletData] = useState<WalletData>({
    balance: 125.50,
    pendingAmount: 25.00,
    totalSpent: 450.00,
    cashbackEarned: 12.75
  });

  // Mock transaction history
  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'payment',
      amount: -59.99,
      description: 'Monthly subscription - FitZone Downtown',
      date: '2024-01-15T10:30:00Z',
      status: 'completed',
      reference: 'PAY-001'
    },
    {
      id: '2',
      type: 'topup',
      amount: 100.00,
      description: 'Wallet top-up via Credit Card',
      date: '2024-01-14T15:45:00Z',
      status: 'completed',
      reference: 'TOP-001'
    },
    {
      id: '3',
      type: 'cashback',
      amount: 5.99,
      description: 'Cashback from monthly subscription',
      date: '2024-01-12T09:15:00Z',
      status: 'completed',
      reference: 'CB-001'
    },
    {
      id: '4',
      type: 'payment',
      amount: -15.00,
      description: 'Day pass - PowerHouse Gym',
      date: '2024-01-10T14:20:00Z',
      status: 'completed',
      reference: 'PAY-002'
    },
    {
      id: '5',
      type: 'refund',
      amount: 30.00,
      description: 'Refund for cancelled booking',
      date: '2024-01-08T11:30:00Z',
      status: 'pending',
      reference: 'REF-001'
    }
  ]);

  const quickTopupAmounts = [10, 25, 50, 100, 200];

  const handleTopup = () => {
    const amount = parseFloat(topupAmount);
    if (amount > 0) {
      // Simulate payment processing
      addNotification({
        title: 'Top-up Initiated',
        message: `$${amount} top-up is being processed`,
        type: 'info'
      });
      
      setTimeout(() => {
        addNotification({
          title: 'Top-up Successful!',
          message: `$${amount} has been added to your wallet`,
          type: 'success'
        });
        setShowTopup(false);
        setTopupAmount('');
      }, 2000);
    }
  };

  const handlePromoCode = () => {
    const validCodes = {
      'WALLET10': 10,
      'BONUS5': 5,
      'SAVE15': 15
    };
    
    if (validCodes[promoCode as keyof typeof validCodes]) {
      const bonus = validCodes[promoCode as keyof typeof validCodes];
      addNotification({
        title: 'Promo Code Applied!',
        message: `$${bonus} bonus will be added to your next top-up`,
        type: 'success'
      });
    } else {
      addNotification({
        title: 'Invalid Promo Code',
        message: 'Please enter a valid promo code',
        type: 'error'
      });
    }
  };

  const downloadInvoice = (transactionId: string) => {
    // Generate and download invoice
    addNotification({
      title: 'Invoice Downloaded',
      message: 'Transaction receipt has been downloaded',
      type: 'success'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup': return <Plus className="w-4 h-4 text-green-600" />;
      case 'payment': return <Minus className="w-4 h-4 text-red-600" />;
      case 'refund': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'cashback': return <Gift className="w-4 h-4 text-purple-600" />;
      default: return <History className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup': return 'text-green-600';
      case 'payment': return 'text-red-600';
      case 'refund': return 'text-blue-600';
      case 'cashback': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-3 px-2 sm:px-4 pb-4">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg col-span-1 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-sm font-medium">Available Balance</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-2">${walletData.balance.toFixed(2)}</p>
            </div>
            <Wallet className="w-10 h-10 sm:w-12 sm:h-12 text-blue-200 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Pending Amount</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">${walletData.pendingAmount.toFixed(2)}</p>
            </div>
            <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Spent</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">${walletData.totalSpent.toFixed(2)}</p>
            </div>
            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-red-500 flex-shrink-0" />
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Cashback Earned</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 mt-1">${walletData.cashbackEarned.toFixed(2)}</p>
            </div>
            <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-green-500 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTopup(true)}
            className="flex flex-col items-center p-4 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 touch-target active:scale-95"
          >
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mb-3" />
            <span className="text-sm font-semibold text-gray-900 text-center leading-tight">Top Up</span>
          </button>

          <button className="flex flex-col items-center p-4 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-200 touch-target active:scale-95">
            <Download className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 mb-3" />
            <span className="text-sm font-semibold text-gray-900 text-center leading-tight">Statements</span>
          </button>

          <button className="flex flex-col items-center p-4 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 touch-target active:scale-95">
            <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600 mb-3" />
            <span className="text-sm font-semibold text-gray-900 text-center leading-tight">Cashback</span>
          </button>

          <button className="flex flex-col items-center p-4 sm:p-5 border-2 border-gray-200 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 touch-target active:scale-95">
            <History className="w-7 h-7 sm:w-8 sm:h-8 text-gray-600 mb-3" />
            <span className="text-sm font-semibold text-gray-900 text-center leading-tight">History</span>
          </button>
        </div>
      </div>

      {/* Promo Code */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Have a Promo Code?</h2>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium transition-all"
          />
          <button
            onClick={handlePromoCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl transition-all duration-200 text-base font-semibold w-full sm:w-auto touch-target active:scale-95 shadow-md"
          >
            Apply Code
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-5">Recent Transactions</h2>
        <div className="space-y-3 sm:space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center p-3 sm:p-4 border border-gray-100 rounded-xl sm:rounded-2xl hover:border-gray-200 transition-all active:scale-[0.98] sm:active:scale-100">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-gray-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{transaction.description}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: new Date(transaction.date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                    <span className="hidden sm:inline"> • {transaction.reference}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                <div className="text-right">
                  <p className={`font-bold text-sm sm:text-base ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className={`text-xs font-medium ${
                    transaction.status === 'completed' ? 'text-green-600' :
                    transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {transaction.status === 'completed' ? '✓' : 
                     transaction.status === 'pending' ? '⏳' : '✗'}
                    <span className="hidden sm:inline ml-1">
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => downloadInvoice(transaction.id)}
                  className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 transition-colors touch-target rounded-lg hover:bg-gray-100 active:scale-95"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-md w-full p-6 sm:p-6 max-h-[90vh] md:max-h-[85vh] overflow-y-auto mb-0 sm:mb-0 mt-auto sm:mt-4 custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Top Up Wallet</h3>
              <button
                onClick={() => setShowTopup(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="mb-6">
              <p className="text-base font-semibold text-gray-800 mb-4">Quick Select</p>
              <div className="grid grid-cols-3 gap-3">
                {quickTopupAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopupAmount(amount.toString())}
                    className={`p-4 text-base font-semibold border-2 rounded-2xl transition-all duration-200 touch-target active:scale-95 ${
                      topupAmount === amount.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-800 mb-3">
                Custom Amount
              </label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
                min="1"
                step="0.01"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-8">
              <label className="block text-base font-semibold text-gray-800 mb-4">
                Payment Method
              </label>
              <div className="space-y-4">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all touch-target active:scale-98">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5"
                  />
                  <CreditCard className="w-6 h-6 mr-4 text-gray-600" />
                  <span className="text-base font-semibold text-gray-900">Credit/Debit Card</span>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all touch-target active:scale-98">
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-4 w-5 h-5"
                  />
                  <span className="text-base font-semibold text-gray-900">Bank Transfer</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => setShowTopup(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 px-6 rounded-2xl transition-all duration-200 font-bold text-lg touch-target active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg touch-target active:scale-95 shadow-lg"
              >
                Top Up ${topupAmount || '0'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
