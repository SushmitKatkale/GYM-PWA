import { apiClient, ApiResponse } from './apiClient';

// Types for trainer management
export interface TrainerInvitation {
  id: number;
  email: string;
  status: 'pending' | 'active' | 'inactive' | 'declined';
  invited_at: string;
  joined_at?: string;
  expires_at: string;
  canAccept: boolean;
  isExpired: boolean;
  trainer?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  inviter: {
    name: string;
  };
}

export interface TrainerData {
  gym: {
    id: number;
    name: string;
  };
  trainers: TrainerInvitation[];
  grouped: {
    active: TrainerInvitation[];
    pending: TrainerInvitation[];
    inactive: TrainerInvitation[];
    declined: TrainerInvitation[];
  };
  counts: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
    declined: number;
  };
}

export interface InviteTrainerRequest {
  email: string;
}

export interface UpdateTrainerStatusRequest {
  status: 'active' | 'inactive';
}

export interface InvitationDetails {
  invitation: {
    id: number;
    email: string;
    status: string;
    invited_at: string;
    expires_at: string;
    canAccept: boolean;
  };
  gym: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    capacity: number;
  };
  inviter: {
    name: string;
    email: string;
  };
}

export interface TrainerGym {
  assignmentId: number;
  joinedAt: string;
  gym: {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    capacity: number;
    owner: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
  };
}

class TrainerService {
  // Owner endpoints
  
  /**
   * Invite a trainer to join the gym
   */
  async inviteTrainer(email: string): Promise<ApiResponse<{ email: string; status: string; invited_at: string; expires_at: string }>> {
    console.log('🔄 Inviting trainer:', email);
    try {
      const response = await apiClient.post<{email: string; status: string; invited_at: string; expires_at: string }>('/owner/trainers/invite', {
        email
      });
      console.log('✅ Trainer invitation sent:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to invite trainer:', error);
      throw error;
    }
  }

  /**
   * Get all trainers for owner's gym
   */
  async getGymTrainers(status?: string): Promise<ApiResponse<TrainerData>> {
    console.log('🔄 Fetching gym trainers, status filter:', status);
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get<TrainerData>('/owner/trainers', { params });
      console.log('✅ Gym trainers fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch gym trainers:', error);
      throw error;
    }
  }

  /**
   * Update trainer status (activate/deactivate)
   */
  async updateTrainerStatus(trainerId: number, status: 'active' | 'inactive'): Promise<ApiResponse<{ id: number; status: string; trainer: any }>> {
    console.log('🔄 Updating trainer status:', trainerId, status);
    try {
      const response = await apiClient.put<{ id: number; status: string; trainer: any }>(`/owner/trainers/${trainerId}/status`, {
        status
      });
      console.log('✅ Trainer status updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update trainer status:', error);
      throw error;
    }
  }

  /**
   * Remove trainer from gym
   */
  async removeTrainer(trainerId: number): Promise<ApiResponse<{ id: number; trainer: any }>> {
    console.log('🔄 Removing trainer:', trainerId);
    try {
      const response = await apiClient.delete<{ id: number; trainer: any }>(`/owner/trainers/${trainerId}`);
      console.log('✅ Trainer removed:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to remove trainer:', error);
      throw error;
    }
  }

  /**
   * Resend trainer invitation
   */
  async resendInvitation(trainerId: number): Promise<ApiResponse<{ id: number; email: string; expires_at: string }>> {
    console.log('🔄 Resending trainer invitation:', trainerId);
    try {
      const response = await apiClient.post<{ id: number; email: string; expires_at: string }>(`/owner/trainers/${trainerId}/resend`);
      console.log('✅ Trainer invitation resent:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to resend trainer invitation:', error);
      throw error;
    }
  }

  // Trainer endpoints

  /**
   * Get invitation details by token (public endpoint)
   */
  async getInvitationDetails(token: string): Promise<ApiResponse<InvitationDetails>> {
    console.log('🔄 Fetching invitation details for token:', token);
    try {
      const response = await apiClient.get<InvitationDetails>(`/trainers/invitation/${token}`);
      console.log('✅ Invitation details fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch invitation details:', error);
      throw error;
    }
  }

  /**
   * Accept trainer invitation
   */
  async acceptInvitation(token: string): Promise<ApiResponse<{ gym: any; assignment: any }>> {
    console.log('🔄 Accepting trainer invitation:', token);
    try {
      const response = await apiClient.post<{ gym: any; assignment: any }>('/trainers/accept-invitation', {
        token
      });
      console.log('✅ Trainer invitation accepted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to accept trainer invitation:', error);
      throw error;
    }
  }

  /**
   * Decline trainer invitation
   */
  async declineInvitation(token: string, reason?: string): Promise<ApiResponse<{ gym: { name: string } }>> {
    console.log('🔄 Declining trainer invitation:', token, reason);
    try {
      const response = await apiClient.post<{ gym: { name: string } }>('/trainers/decline-invitation', {
        token,
        reason
      });
      console.log('✅ Trainer invitation declined:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to decline trainer invitation:', error);
      throw error;
    }
  }

  /**
   * Get trainer's assigned gyms
   */
  async getAssignedGyms(): Promise<ApiResponse<{ totalGyms: number; gyms: TrainerGym[] }>> {
    console.log('🔄 Fetching trainer assigned gyms');
    try {
      const response = await apiClient.get<{ totalGyms: number; gyms: TrainerGym[] }>('/trainers/my-gyms');
      console.log('✅ Trainer assigned gyms fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch trainer assigned gyms:', error);
      throw error;
    }
  }

  /**
   * Get trainer profile and stats
   */
  async getTrainerProfile(): Promise<ApiResponse<{ trainer: any; stats: any }>> {
    console.log('🔄 Fetching trainer profile');
    try {
      const response = await apiClient.get<{ trainer: any; stats: any }>('/trainers/profile');
      console.log('✅ Trainer profile fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch trainer profile:', error);
      throw error;
    }
  }

  /**
   * Leave a gym (trainer initiated)
   */
  async leaveGym(gymId: number): Promise<ApiResponse<{ gym: { id: number; name: string } }>> {
    console.log('🔄 Leaving gym:', gymId);
    try {
      const response = await apiClient.post<{ gym: { id: number; name: string } }>(`/trainers/leave-gym/${gymId}`);
      console.log('✅ Successfully left gym:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to leave gym:', error);
      throw error;
    }
  }
}

export const trainerService = new TrainerService();
export default trainerService;