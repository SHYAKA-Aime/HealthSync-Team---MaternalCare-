export interface MotherProfile {
    mother_id: number;
    user_id: number;
    age?: number;
    blood_group?: string;
    pregnancy_stage?: string;
    expected_delivery?: string;
    location?: string;
    medical_conditions?: string;
    emergency_contact?: string;
  }
  
  export interface CreateMotherData {
    user_id: number;
    age?: number;
    blood_group?: string;
    pregnancy_stage: string;
    expected_delivery: string;
    location?: string;
    medical_conditions?: string;
    emergency_contact?: string;
  }