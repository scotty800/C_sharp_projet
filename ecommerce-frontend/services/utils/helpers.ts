// Générer un slug à partir d'un texte
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
};

// Trier par date (du plus récent au plus ancien)
export const sortByDate = <T extends { createdAt: string | Date }>(
  items: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// Grouper par propriété
export const groupBy = <T>(items: T[], key: keyof T): Record<string, T[]> => {
  return items.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

// Calculer la moyenne
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

// Obtenir les éléments uniques
export const getUniqueItems = <T>(items: T[]): T[] => {
  return [...new Set(items)];
};

// Mélanger un tableau (algorithme de Fisher-Yates)
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Paginer un tableau côté client
export const paginateArray = <T>(
  array: T[],
  page: number = 1,
  pageSize: number = 10
): {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
} => {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const totalPages = Math.ceil(array.length / pageSize);

  return {
    data: array.slice(start, end),
    totalPages,
    currentPage: page,
    totalCount: array.length,
  };
};

// Filtrer par recherche
export const filterBySearch = <T>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) return items;
  
  const term = searchTerm.toLowerCase().trim();
  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return String(value).toLowerCase().includes(term);
    });
  });
};

// Debounce function
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};