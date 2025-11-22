export interface UserProfile {
    user_id: number;
    full_name: string;
    email: string;
    phone?: string;
    role: 'mother' | 'health_worker' | 'admin';
  }
  
  