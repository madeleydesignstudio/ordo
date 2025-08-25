// Email validation utilities

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates a list of email addresses and returns validation results
 */
export function validateEmailList(emails: string[]): {
  valid: string[];
  invalid: string[];
  duplicates: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const email of emails) {
    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      invalid.push(email);
      continue;
    }

    if (seen.has(trimmedEmail)) {
      duplicates.push(email);
      continue;
    }

    seen.add(trimmedEmail);
    valid.push(trimmedEmail);
  }

  return {
    valid,
    invalid,
    duplicates,
  };
}

/**
 * Normalizes an email address (trim and lowercase)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Extracts domain from email address
 */
export function getEmailDomain(email: string): string | null {
  if (!isValidEmail(email)) {
    return null;
  }

  const parts = email.split('@');
  return parts[1] || null;
}

/**
 * Checks if email is from a disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;

  // Common disposable email domains
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
    'yopmail.com',
    'maildrop.cc',
    'trashmail.com',
    'getnada.com',
  ];

  return disposableDomains.includes(domain.toLowerCase());
}

/**
 * Validates email format and checks for common issues
 */
export function validateEmailStrict(email: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.push('Email is required');
  }

  if (trimmedEmail.length > 254) {
    errors.push('Email is too long (max 254 characters)');
  }

  if (!isValidEmail(trimmedEmail)) {
    errors.push('Invalid email format');
  }

  if (isDisposableEmail(trimmedEmail)) {
    errors.push('Disposable email addresses are not allowed');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
