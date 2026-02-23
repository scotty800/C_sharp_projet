// Catégories de produits
export const PRODUCT_CATEGORIES = [
  'Mode',
  'Électronique',
  'Maison',
  'Sport',
  'Beauté',
  'Jeux',
  'Livres',
  'Automobile',
  'Alimentation',
  'Autre'
] as const;

// Statuts de commande
export const ORDER_STATUS = {
  PENDING: 'En attente',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée'
} as const;

// Statuts de paiement
export const PAYMENT_STATUS = {
  PENDING: 'En attente',
  PAID: 'Payé',
  FAILED: 'Échoué',
  REFUNDED: 'Remboursé'
} as const;

// Méthodes de paiement
export const PAYMENT_METHODS = {
  CARD: 'Carte bancaire',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Virement bancaire'
} as const;

// Rôles utilisateur
export const USER_ROLES = {
  USER: 'Utilisateur',
  SELLER: 'Vendeur',
  ADMIN: 'Administrateur'
} as const;

// Couleurs de thème pour les boutiques
export const SHOP_THEME_COLORS = [
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Violet', value: '#a855f7' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Gris', value: '#6b7280' }
] as const;

// Limites de pagination
export const PAGINATION_LIMITS = [10, 20, 50, 100] as const;

// Options de tri
export const SORT_OPTIONS = {
  PRICE_ASC: 'Prix croissant',
  PRICE_DESC: 'Prix décroissant',
  NAME_ASC: 'Nom A-Z',
  NAME_DESC: 'Nom Z-A',
  NEWEST: 'Plus récent',
  OLDEST: 'Plus ancien',
  POPULAR: 'Plus populaire'
} as const;

// Types de notification
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
} as const;

// Messages d'erreur courants
export const ERROR_MESSAGES = {
  REQUIRED: 'Ce champ est requis',
  INVALID_EMAIL: 'Email invalide',
  INVALID_PASSWORD: 'Mot de passe invalide',
  PASSWORDS_NOT_MATCH: 'Les mots de passe ne correspondent pas',
  INVALID_PHONE: 'Numéro de téléphone invalide',
  INVALID_POSTAL_CODE: 'Code postal invalide',
  PRICE_TOO_HIGH: 'Prix trop élevé',
  QUANTITY_INVALID: 'Quantité invalide',
  NETWORK_ERROR: 'Erreur réseau',
  SERVER_ERROR: 'Erreur serveur',
  UNAUTHORIZED: 'Non autorisé',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Non trouvé'
} as const;