export type UserRole = "admin" | "warga";

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

export interface RegisterInputData {
  email: string;
  password: string;
  nama: string;
  phone: string;
  role: UserRole;
  adminSecret?: string;
}
