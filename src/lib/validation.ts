/**
 * Security validation utilities for OpenComments
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const minLength = 8;
  
  // Check minimum length
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');
  }
  
  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= minLength;
  
  const criteriaMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isLongEnough]
    .filter(Boolean).length;
  
  if (criteriaMet >= 4 && password.length >= 10) {
    strength = 'strong';
  } else if (criteriaMet >= 3) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 10000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  if (!file || !file.name) {
    return false;
  }
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  if (!file || !file.size) {
    return false;
  }
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSizeMB;
};

export const validateMimeType = (file: File, allowedMimeTypes: string[]): boolean => {
  if (!file || !file.type) {
    return false;
  }
  return allowedMimeTypes.includes(file.type);
};

export const generateSecureFilename = (originalName: string): string => {
  if (typeof originalName !== 'string') {
    return `file-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
  const extension = originalName.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomId}.${extension}`;
}; 