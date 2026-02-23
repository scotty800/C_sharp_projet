// Sauvegarder des données dans localStorage
export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', error);
  }
};

// Récupérer des données de localStorage
export const getStorageItem = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error('Erreur lors de la récupération depuis localStorage:', error);
    return defaultValue;
  }
};

// Supprimer des données de localStorage
export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Erreur lors de la suppression de localStorage:', error);
  }
};

// Vider tout localStorage
export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Erreur lors du vidage de localStorage:', error);
  }
};

// Sauvegarder dans sessionStorage
export const setSessionItem = <T>(key: string, value: T): void => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde dans sessionStorage:', error);
  }
};

// Récupérer de sessionStorage
export const getSessionItem = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const serializedValue = sessionStorage.getItem(key);
    if (serializedValue === null) {
      return defaultValue;
    }
    return JSON.parse(serializedValue) as T;
  } catch (error) {
    console.error('Erreur lors de la récupération depuis sessionStorage:', error);
    return defaultValue;
  }
};