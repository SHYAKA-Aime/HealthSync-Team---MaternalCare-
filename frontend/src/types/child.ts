export interface ChildProfile {
    child_id: number;
    mother_id: number;
    full_name: string;
    dob: string;
    gender: 'male' | 'female';
    birth_weight?: number;
    birth_height?: number;
  }
  
  export interface CreateChildData {
    mother_id: number;
    full_name: string;
    dob: string;
    gender: 'male' | 'female';
    birth_weight?: number;
    birth_height?: number;
  }
  