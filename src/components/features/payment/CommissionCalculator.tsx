import React, { useState } from 'react';
import { Calculator, IndianRupee, Percent, TrendingUp, TrendingDown } from 'lucide-react';
import { adminPaymentService } from '../../../services/adminPaymentService';

export function CommissionCalculator() {
  const [totalAmount, setTotalAmount] = useState<number>(1000);
  const [cutValue, setCutValue] = useState<number>(15);
  const [cutType, setCutType] = useState<'percentage' | 'flat'>('percentage');

  const calculation = adminPaymentService.calculateCommission(totalAmount, cutValue, cutType);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Calculator className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Commission Calculator</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Order Amount (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={cutType === 'percentage'}
                    onChange={(e) => setCutType(e.target.value as 'percentage' | 'flat')}
                    className="mr-2"
                  />
                  <Percent className="w-4 h-4 mr-1" />
                  Percentage
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="flat"
                    checked={cutType === 'flat'}
                    onChange={(e) => setCutType(e.target.value as 'percentage' | 'flat')}
                    className="mr-2"
                  />
                  <IndianRupee className="w-4 h-4 mr-1" />
                  Flat Amount
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Value {cutType === 'percentage' ? '(%)' : '(₹)'}
              </label>
              <div className="relative">
                {cutType === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                ) : (
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                )}
                <input
                  type="number"
                  value={cutValue}
                  onChange={(e) => setCutValue(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  min="0"
                  step={cutType === 'percentage' ? '0.01' : '1'}
                  max={cutType === 'percentage' ? '100' : undefined}
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Calculation Results
            </h4>

            <div className="space-y-4">
              {/* Platform Commission */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Platform Commission</span>
                  </div>
                  <span className="text-lg font-bold text-blue-900">
                    ₹{calculation.commission.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* GST on Commission */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-yellow-900">GST on Commission (18%)</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-900">
                    ₹{calculation.gstOnCommission.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total Deduction */}
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-900">Total Deduction</span>
                  </div>
                  <span className="text-lg font-bold text-red-900">
                    ₹{calculation.totalDeduction.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Vendor Amount */}
              <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <IndianRupee className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-900">Vendor Amount</span>
                  </div>
                  <span className="text-xl font-bold text-green-900">
                    ₹{calculation.vendorAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">Breakdown:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Total Amount: ₹{totalAmount.toFixed(2)}</div>
                <div>Commission ({cutType === 'percentage' ? `${cutValue}%` : `₹${cutValue}`}): ₹{calculation.commission.toFixed(2)}</div>
                <div>GST on Commission (18%): ₹{calculation.gstOnCommission.toFixed(2)}</div>
                <div className="border-t border-gray-300 pt-1 mt-2">
                  <div className="font-medium">Vendor receives: ₹{calculation.vendorAmount.toFixed(2)}</div>
                  <div className="font-medium">Platform keeps: ₹{calculation.totalDeduction.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Examples */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {[
              { amount: 1000, cut: 10, type: 'percentage' },
              { amount: 2000, cut: 15, type: 'percentage' },
              { amount: 1500, cut: 200, type: 'flat' }
            ].map((example, index) => {
              const calc = adminPaymentService.calculateCommission(example.amount, example.cut, example.type as 'percentage' | 'flat');
              return (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-900">
                    ₹{example.amount} - {example.cut}{example.type === 'percentage' ? '%' : ' ₹'}
                  </div>
                  <div className="text-gray-600">
                    Vendor: ₹{calc.vendorAmount.toFixed(0)} | Platform: ₹{calc.totalDeduction.toFixed(0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
