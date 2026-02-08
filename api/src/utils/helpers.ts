// Générer un numéro de commande unique
export const generateOrderNumber = (): string => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `KIB-${date}-${random}`;
};

// Créer un slug à partir d'une chaîne
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/-+/g, '-') // Supprime les tirets multiples
    .replace(/^-+|-+$/g, ''); // Supprime les tirets au début et à la fin
};

// Calculer les frais de livraison (simplifié pour le MVP)
export const calculateDeliveryFee = (subtotal: number, city: string): number => {
  // Tarif de base: 1000 FCFA
  // Gratuit au-dessus de 20000 FCFA
  if (subtotal >= 20000) {
    return 0;
  }
  return 1000;
};

// Formater le prix en FCFA
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(price);
};

// Pagination helper
export const getPaginationParams = (query: { page?: string; limit?: string }) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10)));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// Calculer le total des pages
export const getTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit);
};
