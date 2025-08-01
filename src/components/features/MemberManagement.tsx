import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, User, Mail, Calendar, MoreVertical, Edit, Trash2, Phone, MapPin, X } from 'lucide-react';

export function MemberManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  // Form state for adding new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    membership: 'Basic Monthly',
    status: 'Active'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Mock member data
  const members = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      membership: 'Premium Annual',
      status: 'Active',
      joinDate: '2024-01-15',
      avatar: null
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1 (555) 234-5678',
      membership: 'Basic Monthly',
      status: 'Active',
      joinDate: '2024-02-20',
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 345-6789',
      membership: 'Premium Monthly',
      status: 'Expired',
      joinDate: '2023-11-10',
      avatar: null
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily.brown@example.com',
      phone: '+1 (555) 456-7890',
      membership: 'Basic Annual',
      status: 'Active',
      joinDate: '2024-03-05',
      avatar: null
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david.lee@example.com',
      phone: '+1 (555) 567-8901',
      membership: 'Premium Annual',
      status: 'Suspended',
      joinDate: '2023-12-01',
      avatar: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newMember.name || !newMember.email || !newMember.phone) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('New member data:', {
      ...newMember,
      id: members.length + 1,
      joinDate: new Date().toISOString().split('T')[0],
      avatar: null
    });
    
    // Show success message
    alert('Member added successfully!');
    
    // Reset form and close modal
    setNewMember({
      name: '',
      email: '',
      phone: '',
      membership: 'Basic Monthly',
      status: 'Active'
    });
    setShowAddMember(false);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setNewMember({
      name: '',
      email: '',
      phone: '',
      membership: 'Basic Monthly',
      status: 'Active'
    });
    setShowAddMember(false);
  };

  // Handle edit member
  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      membership: member.membership,
      status: member.status
    });
    setShowAddMember(true);
  };

  // Handle delete member
  const handleDeleteMember = (memberId: number) => {
    setShowDeleteConfirm(memberId);
  };

  // Confirm delete member
  const confirmDelete = () => {
    if (showDeleteConfirm) {
      console.log('Deleting member with ID:', showDeleteConfirm);
      alert('Member deleted successfully!');
      setShowDeleteConfirm(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-3 md:space-y-6 px-3 md:px-6 max-w-full mx-auto pb-4">
      <div className="text-center px-2">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900">Member Management</h1>
        <p className="text-gray-600 mt-1 text-xs md:text-base">Manage gym members and memberships</p>
      </div>

      {/* Mobile-First Search and Filters */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-3 md:p-4">
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
            />
          </div>
          
          {/* Filter and Add Button Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1" ref={filterDropdownRef}>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center justify-center w-full space-x-2 px-3 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                <Filter className="w-4 h-4" />
                <span className="truncate">
                  {filterStatus === 'all' ? 'All Members' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </span>
              </button>
              
              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        filterStatus === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      All Members
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('active');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        filterStatus === 'active' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('expired');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        filterStatus === 'expired' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Expired
                    </button>
                    <button
                      onClick={() => {
                        setFilterStatus('suspended');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                        filterStatus === 'suspended' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      Suspended
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowAddMember(true)}
              className="flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 rounded-lg transition-colors font-medium text-sm min-w-fit"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Member Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-blue-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Total</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{members.length}</p>
            <p className="text-xs text-gray-500">Members</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-green-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Active</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{members.filter(m => m.status === 'Active').length}</p>
            <p className="text-xs text-green-600">Members</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-red-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Expired</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{members.filter(m => m.status === 'Expired').length}</p>
            <p className="text-xs text-red-600">Members</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-center">
            <div className="bg-yellow-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            </div>
            <p className="text-xs text-gray-600 mb-1">Suspended</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{members.filter(m => m.status === 'Suspended').length}</p>
            <p className="text-xs text-yellow-600">Members</p>
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Member Cards */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200 p-3 md:p-5 hover:shadow-md transition-shadow">
            {/* Mobile: Stack layout, Desktop: Side by side */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              {/* Main Content */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Name and Status */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-lg truncate pr-2">{member.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>
                  
                  {/* Contact Info - Compact on mobile */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <Mail className="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-600">
                      <Phone className="w-3 h-3 md:w-4 md:h-4 mr-2 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                  
                  {/* Membership Info - More compact on mobile */}
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm gap-1 sm:gap-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span>Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="font-medium text-blue-600">
                        {member.membership}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons - Bottom on mobile, side on desktop */}
              <div className="flex items-center justify-end space-x-1 mt-3 sm:mt-0 sm:ml-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <button 
                  onClick={() => handleEditMember(member)}
                  className="flex items-center justify-center w-10 h-10 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit Member"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteMember(member.id)}
                  className="flex items-center justify-center w-10 h-10 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => setShowAddMember(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Member</span>
          </button>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newMember.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={newMember.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Membership Type */}
              <div>
                <label htmlFor="membership" className="block text-sm font-medium text-gray-700 mb-2">
                  Membership Type
                </label>
                <select
                  id="membership"
                  name="membership"
                  value={newMember.membership}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Basic Monthly">Basic Monthly</option>
                  <option value="Basic Annual">Basic Annual</option>
                  <option value="Premium Monthly">Premium Monthly</option>
                  <option value="Premium Annual">Premium Annual</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={newMember.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Member
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete this member? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

