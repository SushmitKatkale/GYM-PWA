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
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Wallet & Payments</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and payment history</p>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold">${walletData.balance.toFixed(2)}</p>
            </div>
            <Wallet className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900">${walletData.pendingAmount.toFixed(2)}</p>
            </div>
            <RefreshCw className="w-6 h-6 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${walletData.totalSpent.toFixed(2)}</p>
            </div>
            <CreditCard className="w-6 h-6 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cashback Earned</p>
              <p className="text-2xl font-bold text-gray-900">${walletData.cashbackEarned.toFixed(2)}</p>
            </div>
            <Gift className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setShowTopup(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Top Up</span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
            <Download className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Download Statements</span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
            <Gift className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Cashback</span>
          </button>

          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <History className="w-6 h-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Transaction History</span>
          </button>
        </div>
      </div>

      {/* Promo Code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Have a Promo Code?</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handlePromoCode}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()} • {transaction.reference}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className={`text-sm ${
                    transaction.status === 'completed' ? 'text-green-600' :
                    transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </p>
                </div>
                <button
                  onClick={() => downloadInvoice(transaction.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Up Wallet</h3>
            
            {/* Quick Amount Buttons */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Select</p>
              <div className="grid grid-cols-5 gap-2">
                {quickTopupAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopupAmount(amount.toString())}
                    className={`p-2 text-sm border rounded-lg transition-colors ${
                      topupAmount === amount.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Amount
              </label>
              <input
                type="number"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                step="0.01"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit/Debit Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Bank Transfer
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTopup(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
