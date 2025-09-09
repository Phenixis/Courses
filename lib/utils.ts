import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates password strength according to security requirements:
 * - At least one uppercase letter
 * - At least one lowercase letter  
 * - At least one special character
 * - Minimum 8 characters
 */
export function validatePasswordStrength(password: string): { 
    isValid: boolean; 
    errors: string[];
    requirements: Array<{
        text: string;
        met: boolean;
    }>;
} {
    const errors: string[] = [];
    
    const lengthRequirement = password.length >= 8;
    const uppercaseRequirement = /[A-Z]/.test(password);
    const lowercaseRequirement = /[a-z]/.test(password);
    const specialCharRequirement = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const requirements = [
        {
            text: 'At least 8 characters long',
            met: lengthRequirement
        },
        {
            text: 'At least one uppercase letter',
            met: uppercaseRequirement
        },
        {
            text: 'At least one lowercase letter',
            met: lowercaseRequirement
        },
        {
            text: 'At least one special character',
            met: specialCharRequirement
        }
    ];
    
    // Keep the existing error format for backward compatibility
    if (!lengthRequirement) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!uppercaseRequirement) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!lowercaseRequirement) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!specialCharRequirement) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        isValid: errors.length === 0,
        errors,
        requirements
    };
}
