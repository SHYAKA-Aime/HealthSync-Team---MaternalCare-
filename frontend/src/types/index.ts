export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: 'mother' | 'health_worker' | 'admin';
  created_at: string;
}

export interface Mother {
  mother_id: number;
  user_id: number;
  age?: number;
  blood_group?: string;
  pregnancy_stage?: string;
  expected_delivery?: string;
  location?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Child {
  child_id: number;
  mother_id: number;
  full_name: string;
  dob: string;
  gender: 'male' | 'female';
  birth_weight?: number;
  birth_height?: number;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  visit_id: number;
  mother_id: number;
  hw_id?: number;
  visit_date: string;
  visit_type: 'antenatal' | 'postnatal' | 'general';
  weight?: number;
  blood_pressure?: string;
  notes?: string;
  mother_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Vaccination {
  vaccine_id: number;
  child_id: number;
  hw_id?: number;
  vaccine_name: string;
  date_given: string;
  next_due_date?: string;
  administered_by?: string;
  batch_number?: string;
  notes?: string;
  child_name?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthWorker {
  hw_id: number;
  user_id: number;
  clinic_id?: number;
  position?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  clinic_id: number;
  name: string;
  location: string;
  contact?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}