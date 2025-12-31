import React, { useEffect, useState } from 'react';
import { X, Users, Search, Filter, Plus, User, Mail, Phone, Calendar, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { buildApiUrl } from '../../config/api';
import { useAuthStore } from '../../stores/authStore';

interface ViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  gym: any; // Gym data from the API
}

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  joinDate: string;
  subscriptionStatus: 'active' | 'expired' | 'suspended';
  planType: string;
  expiryDate?: string;
}

export function ViewMembersModal({ isOpen, onClose, gym }: ViewMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'suspended'>('all');
  const { getAccessToken } = useAuthStore();

  // Mock data for demonstration - replace with actual API call
  const mockMembers: Member[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phone: '+1234567890',
      joinDate: '2024-01-15',
      subscriptionStatus: 'active',
      planType: 'Monthly Premium',
      expiryDate: '2024-12-15'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@email.com',
      phone: '+0987654321',
      joinDate: '2024-02-01',
      subscriptionStatus: 'active',
      planType: 'Yearly Basic',
      expiryDate: '2025-02-01'
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@email.com',
      joinDate: '2023-12-01',
      subscriptionStatus: 'expired',
      planType: 'Monthly Basic',
      expiryDate: '2024-01-01'
    },
    {
      id: 4,
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+1122334455',
      joinDate: '2024-03-10',
      subscriptionStatus: 'active',
      planType: 'Weekly Premium',
      expiryDate: '2024-12-10'
    }
  ];

  useEffect(() => {
    if (isOpen && gym) {
      fetchMembers();
    }
  }, [isOpen, gym]);

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, using mock data
      // TODO: Replace with actual API call
      /*
      const token = getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(buildApiUrl(`/owner/gym/${gym.id}/members`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setMembers(result.data || []);
      */

      // Using mock data for now
      setTimeout(() => {
        setMembers(mockMembers);
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('❌ Error fetching members:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch members';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = !searchQuery || 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || member.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white md:bg-black md:bg-opacity-50 md:flex md:items-center md:justify-center md:p-4">
      <div className="bg-white md:rounded-lg md:shadow-xl md:max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Members</h2>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {gym?.name} • {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden md:block"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50">
          <div className="space-y-3 md:space-y-0 md:flex md:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 md:gap-4">
              {/* Status Filter */}
              <div className="flex-1 md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Add Member Button */}
              <button className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-3 md:w-4 h-3 md:h-4 mr-1 md:mr-2" />
                <span className="text-xs md:text-sm">Add</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4">
            <div className="text-center p-2 md:p-3 bg-white rounded-lg">
              <div className="text-sm md:text-lg font-bold text-green-600">
                {members.filter(m => m.subscriptionStatus === 'active').length}
              </div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-white rounded-lg">
              <div className="text-sm md:text-lg font-bold text-red-600">
                {members.filter(m => m.subscriptionStatus === 'expired').length}
              </div>
              <div className="text-xs text-gray-500">Expired</div>
            </div>
            <div className="text-center p-2 md:p-3 bg-white rounded-lg">
              <div className="text-sm md:text-lg font-bold text-yellow-600">
                {members.filter(m => m.subscriptionStatus === 'suspended').length}
              </div>
              <div className="text-xs text-gray-500">Suspended</div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 md:mx-6 mt-2 md:mt-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="text-xs md:text-sm text-red-700">
                <strong>Error:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-4 md:p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Users className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mx-auto mb-3 md:mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6 px-4">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Start by adding members to your gym.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start md:items-center flex-col md:flex-row space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                      <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 md:w-6 h-5 md:h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-sm md:text-base font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <div className="text-xs md:text-sm text-gray-500 space-y-1">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-1 md:mr-2" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 mr-1 md:mr-2" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-start md:items-end space-x-4 md:space-x-0 space-y-0 md:space-y-2 w-full md:w-auto">
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.subscriptionStatus)}`}>
                        {getStatusIcon(member.subscriptionStatus)}
                        <span className="ml-1 capitalize">{member.subscriptionStatus}</span>
                      </div>
                      <div className="text-xs text-gray-500 flex-1">
                        <div className="flex items-center mb-1">
                          <CreditCard className="w-3 h-3 mr-1" />
                          <span className="truncate">{member.planType}</span>
                        </div>
                        {member.expiryDate && (
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span className="text-xs">Expires: {new Date(member.expiryDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 border-t border-gray-200 bg-gray-50 space-y-2 md:space-y-0">
          <div className="text-xs md:text-sm text-gray-500">
            Showing {filteredMembers.length} of {members.length} members
          </div>
          <div className="text-xs text-gray-400">
            💡 Demo data - actual data from your database.
          </div>
        </div>
      </div>
    </div>
  );
}