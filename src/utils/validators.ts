/**
 * Checks if email uses mandatory @gmail.com (or official demo @desa.id)
 */
export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith("@gmail.com") || clean.endsWith("@desa.id");
}

/**
 * Checks valid phone number format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const clean = phone.replace(/[^0-9]/g, "");
  return clean.length >= 9 && clean.length <= 15;
}

/**
 * Checks minimum password length requirement
 */
export function isValidPassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6;
}

/**
 * Checks valid 16-digit Indonesian NIK KTP format
 */
export function isValidNIK(nik: string): boolean {
  if (!nik) return false;
  const clean = nik.trim();
  return /^[0-9]{16}$/.test(clean);
}
