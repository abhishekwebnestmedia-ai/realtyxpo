/**
 * Comprehensive form validation utility
 * Provides type-safe validation with security measures
 */

import DOMPurify from 'dompurify';
import config from './config';

// Validation rules
const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9][\d]{0,15}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  numeric: /^[0-9]+$/,
  decimal: /^[0-9]+(\.[0-9]+)?$/,
  name: /^[a-zA-Z\s]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  mediumPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/
};

// Common validation functions
const validators = {
  required: (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName} cannot be empty`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName} must have at least one item`;
    }
    return null;
  },

  email: (value, fieldName = 'Email') => {
    if (!value) return null;
    if (!VALIDATION_RULES.email.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    if (value.length > 254) {
      return `${fieldName} is too long`;
    }
    return null;
  },

  phone: (value, fieldName = 'Phone number') => {
    if (!value) return null;
    const cleaned = value.replace(/[\s-()]/g, '');
    if (!VALIDATION_RULES.phone.test(cleaned)) {
      return `${fieldName} must be a valid phone number`;
    }
    return null;
  },

  url: (value, fieldName = 'URL') => {
    if (!value) return null;
    if (!VALIDATION_RULES.url.test(value)) {
      return `${fieldName} must be a valid URL`;
    }
    return null;
  },

  minLength: (min) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max) => (value, fieldName = 'Field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  },

  min: (minimum) => (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    if (isNaN(num) || num < minimum) {
      return `${fieldName} must be at least ${minimum}`;
    }
    return null;
  },

  max: (maximum) => (value, fieldName = 'Field') => {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    if (isNaN(num) || num > maximum) {
      return `${fieldName} must be no more than ${maximum}`;
    }
    return null;
  },

  numeric: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (!VALIDATION_RULES.numeric.test(value)) {
      return `${fieldName} must contain only numbers`;
    }
    return null;
  },

  decimal: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (!VALIDATION_RULES.decimal.test(value)) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  alphanumeric: (value, fieldName = 'Field') => {
    if (!value) return null;
    if (!VALIDATION_RULES.alphanumeric.test(value)) {
      return `${fieldName} must contain only letters and numbers`;
    }
    return null;
  },

  name: (value, fieldName = 'Name') => {
    if (!value) return null;
    if (!VALIDATION_RULES.name.test(value)) {
      return `${fieldName} must contain only letters and spaces`;
    }
    return null;
  },

  username: (value, fieldName = 'Username') => {
    if (!value) return null;
    if (!VALIDATION_RULES.username.test(value)) {
      return `${fieldName} must be 3-20 characters long and contain only letters, numbers, and underscores`;
    }
    return null;
  },

  password: (strength = 'medium') => (value, fieldName = 'Password') => {
    if (!value) return null;
    
    const rule = strength === 'strong' ? VALIDATION_RULES.strongPassword : VALIDATION_RULES.mediumPassword;
    
    if (!rule.test(value)) {
      if (strength === 'strong') {
        return `${fieldName} must be at least 8 characters long and contain uppercase, lowercase, number, and special character`;
      } else {
        return `${fieldName} must be at least 6 characters long and contain uppercase, lowercase, and number`;
      }
    }
    return null;
  },

  confirmPassword: (originalValue) => (value, fieldName = 'Confirm Password') => {
    if (!value) return null;
    if (value !== originalValue) {
      return `${fieldName} must match password`;
    }
    return null;
  },

  fileSize: (value, fieldName = 'File') => {
    if (!value) return null;
    if (value.size > config.MAX_FILE_SIZE) {
      const maxSizeMB = Math.round(config.MAX_FILE_SIZE / 1024 / 1024);
      return `${fieldName} must be smaller than ${maxSizeMB}MB`;
    }
    return null;
  },

  fileType: (value, fieldName = 'File') => {
    if (!value) return null;
    if (!config.isFileTypeAllowed(value.name)) {
      return `${fieldName} must be one of: ${config.ALLOWED_FILE_TYPES.join(', ')}`;
    }
    return null;
  },

  custom: (validatorFn) => (value, fieldName = 'Field') => {
    return validatorFn(value, fieldName);
  }
};

// Form validation class
class FormValidator {
  constructor(schema = {}) {
    this.schema = schema;
    this.errors = {};
  }

  // Validate single field
  validateField(fieldName, value, rules = []) {
    const fieldSchema = this.schema[fieldName] || {};
    const allRules = [...(fieldSchema.rules || []), ...rules];
    const displayName = fieldSchema.label || fieldName;

    for (const rule of allRules) {
      const error = rule(value, displayName);
      if (error) {
        this.errors[fieldName] = error;
        return error;
      }
    }

    delete this.errors[fieldName];
    return null;
  }

  // Validate entire form
  validateForm(data) {
    this.errors = {};
    let isValid = true;

    Object.keys(this.schema).forEach(fieldName => {
      const value = data[fieldName];
      const error = this.validateField(fieldName, value);
      if (error) {
        isValid = false;
      }
    });

    return { isValid, errors: this.errors };
  }

  // Get all current errors
  getErrors() {
    return this.errors;
  }

  // Check if form has errors
  hasErrors() {
    return Object.keys(this.errors).length > 0;
  }

  // Clear all errors
  clearErrors() {
    this.errors = {};
  }

  // Clear specific field error
  clearFieldError(fieldName) {
    delete this.errors[fieldName];
  }
}

// Sanitization utilities
const sanitize = {
  // Remove XSS vulnerabilities
  xss: (value) => {
    if (typeof value !== 'string') return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  },

  // Clean HTML but allow safe tags
  html: (value, allowedTags = ['b', 'i', 'em', 'strong', 'u']) => {
    if (typeof value !== 'string') return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: allowedTags });
  },

  // Remove all non-alphanumeric characters
  alphanumeric: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/[^a-zA-Z0-9]/g, '');
  },

  // Clean phone number
  phone: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/[^\d+-\s()]/g, '');
  },

  // Clean email
  email: (value) => {
    if (typeof value !== 'string') return value;
    return value.toLowerCase().trim();
  },

  // Trim whitespace
  trim: (value) => {
    if (typeof value !== 'string') return value;
    return value.trim();
  },

  // Convert to title case
  titleCase: (value) => {
    if (typeof value !== 'string') return value;
    return value.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
};

// Common validation schemas
const commonSchemas = {
  login: {
    email: {
      label: 'Email',
      rules: [validators.required, validators.email]
    },
    password: {
      label: 'Password',
      rules: [validators.required]
    }
  },

  registration: {
    name: {
      label: 'Full Name',
      rules: [validators.required, validators.name, validators.minLength(2), validators.maxLength(50)]
    },
    email: {
      label: 'Email',
      rules: [validators.required, validators.email]
    },
    password: {
      label: 'Password',
      rules: [validators.required, validators.password('medium')]
    },
    confirmPassword: {
      label: 'Confirm Password',
      rules: [validators.required] // confirmPassword validator added dynamically
    }
  },

  profile: {
    name: {
      label: 'Full Name',
      rules: [validators.required, validators.name, validators.minLength(2), validators.maxLength(50)]
    },
    email: {
      label: 'Email',
      rules: [validators.required, validators.email]
    },
    phone: {
      label: 'Phone Number',
      rules: [validators.phone]
    },
    bio: {
      label: 'Bio',
      rules: [validators.maxLength(500)]
    }
  },

  lead: {
    name: {
      label: 'Lead Name',
      rules: [validators.required, validators.name, validators.maxLength(100)]
    },
    email: {
      label: 'Email',
      rules: [validators.email]
    },
    phone: {
      label: 'Phone Number',
      rules: [validators.required, validators.phone]
    },
    budget: {
      label: 'Budget',
      rules: [validators.decimal, validators.min(0)]
    }
  },

  inventory: {
    sellerName: {
      label: 'Seller Name',
      rules: [validators.required, validators.name, validators.maxLength(100)]
    },
    project: {
      label: 'Project',
      rules: [validators.required, validators.maxLength(100)]
    },
    unitNo: {
      label: 'Unit Number',
      rules: [validators.required, validators.alphanumeric, validators.maxLength(20)]
    },
    demand: {
      label: 'Demand',
      rules: [validators.required, validators.decimal, validators.min(0)]
    },
    email: {
      label: 'Email',
      rules: [validators.email]
    },
    contactNumbers: {
      label: 'Contact Number',
      rules: [validators.required, validators.phone]
    }
  }
};

// Export everything
export {
  validators,
  FormValidator,
  sanitize,
  commonSchemas,
  VALIDATION_RULES
};

// Default export for convenience
export default FormValidator;