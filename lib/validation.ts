/**
 * Validation utilities for Dubai Adventures
 * Provides reusable validation functions for input sanitization
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * Accepts: +1234567890, 1234567890 (min 9 digits)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{9,}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const validatePassword = (password: string): {
  valid: boolean;
  requirements: {
    length: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
} => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const valid = Object.values(requirements).every(req => req);
  return { valid, requirements };
};

/**
 * Get password strength feedback
 */
export const getPasswordFeedback = (password: string): string => {
  const { requirements } = validatePassword(password);
  const missing = [];

  if (!requirements.length) missing.push('8+ characters');
  if (!requirements.uppercase) missing.push('1 uppercase letter');
  if (!requirements.number) missing.push('1 number');
  if (!requirements.special) missing.push('1 special character');

  if (missing.length === 0) return 'Password is strong';
  return `Password must include: ${missing.join(', ')}`;
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
  options?: {
    maxSize?: number; // in bytes, default 5MB
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } => {
  const maxSize = options?.maxSize || 5 * 1024 * 1024; // 5MB default
  const allowedTypes = options?.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File must be smaller than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

/**
 * Sanitize user input to prevent injection
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, 500); // Limit length
};

/**
 * Validate name (alphanumeric + spaces + hyphens)
 */
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Validate booking date is not in the past
 */
export const validateBookingDate = (dateString: string): boolean => {
  const bookingDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
};

/**
 * Validate number is within range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return Number.isInteger(value) && value >= min && value <= max;
};
