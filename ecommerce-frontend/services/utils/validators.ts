// Validation email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation mot de passe fort
export const isStrongPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validation téléphone français
export const isValidFrenchPhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Validation code postal français
export const isValidFrenchPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

// Validation URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validation prix
export const isValidPrice = (price: number): boolean => {
  return !isNaN(price) && price >= 0 && price <= 999999.99;
};

// Validation quantité
export const isValidQuantity = (quantity: number): boolean => {
  return Number.isInteger(quantity) && quantity > 0 && quantity <= 999;
};

// Validation note (1-5)
export const isValidRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

// Validation nom de boutique
export const isValidShopName = (name: string): {
  isValid: boolean;
  error?: string;
} => {
  if (name.length < 3) {
    return { isValid: false, error: 'Le nom doit contenir au moins 3 caractères' };
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Le nom ne peut pas dépasser 50 caractères' };
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return { 
      isValid: false, 
      error: 'Le nom ne peut contenir que des lettres, chiffres, espaces, tirets et underscores' 
    };
  }
  return { isValid: true };
};

// Validation slug
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};