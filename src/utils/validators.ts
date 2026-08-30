/**
 * Checks if email uses mandatory @gmail.com (or official demo @desa.id)
 */
export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith("@gmail.com") || clean.endsWith("@desa.id") || clean.includes("@");
}

/**
 * Checks valid phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, "");
  return clean.length >= 9 && clean.length <= 15;
}

export interface PasswordValidationResult {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
}

/**
 * Validates password complexity:
 * - Minimum 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one numeric digit (0-9)
 */
export function validatePassword(password: string): PasswordValidationResult {
  const str = password || "";
  const hasMinLength = str.length >= 8;
  const hasUpperCase = /[A-Z]/.test(str);
  const hasLowerCase = /[a-z]/.test(str);
  const hasNumber = /[0-9]/.test(str);

  return {
    isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumber,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
  };
}

/**
 * Checks if password satisfies all required security standards
 */
export function isValidPassword(password: string): boolean {
  return validatePassword(password).isValid;
}

/**
 * Checks valid 16-digit Indonesian NIK KTP format
 */
export function isValidNIK(nik: string): boolean {
  if (!nik) return false;
  const clean = nik.trim();
  return /^[0-9]{16}$/.test(clean);
}
