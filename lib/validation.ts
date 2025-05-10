// Validation functions for different question types

export function validateSingleSelect(value: any) {
  const isValid = !!value;
  return {
    isValid,
    error: isValid ? null : "Please select an option.",
  };
}

export function validateDropdown(value: any) {
  const isValid = !!value;
  return {
    isValid,
    error: isValid ? null : "Please select an option.",
  };
}

export function validateMultiSelect(value: any[]) {
  const isValid = value.length > 0;
  return {
    isValid,
    error: isValid ? null : "Please select at least one option.",
  };
}

export function validateNumberRange(value: any) {
  // Always valid as per original logic
  return {
    isValid: true,
    error: null,
  };
}

export function validateDate(value: any) {
  const isValid = !!value;
  return {
    isValid,
    error: isValid ? null : "Please select a date.",
  };
}

export function validateText(value: string) {
  const isValid = !!value.trim();
  return {
    isValid,
    error: isValid ? null : "This field is required.",
  };
}

export function validateLongText(value: string) {
  const trimmed = value.trim();
  const isValid = trimmed.length >= 10;
  return {
    isValid,
    error: isValid
      ? null
      : trimmed
      ? "Please enter at least 10 characters."
      : "This field is required.",
  };
}

export function validateEmail(value: string) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  return {
    isValid,
    error: isValid ? null : "Please enter a valid email address.",
  };
} 