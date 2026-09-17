export interface PlanDetails {
  id: 'annual' | 'semester';
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  formattedPrice: string;
  formattedEquivalent: string;
  features: string[];
  recommended?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PRICING = {
  annual: {
    id: 'annual',
    name: 'Pass Annuel',
    price: 4500,
    currency: 'DA',
    billingPeriod: '/ an',
    formattedPrice: '4 500 DA',
    formattedEquivalent: '375 DA / mois',
    features: [
      'Accès illimité à l\'ensemble des 6 années d\'études',
      'Module Concours de Résidanat inclus',
      'Examens blancs chronométrés et corrections détaillées',
      'Dépôt et consultation des cours et polycopiés',
      'Suivi statistique des performances et points faibles',
    ],
    recommended: true,
    badge: 'LE PLUS POPULAIRE',
  },
  semester: {
    id: 'semester',
    name: 'Pass Semestriel',
    price: 2800,
    currency: 'DA',
    billingPeriod: '/ semestre',
    formattedPrice: '2 800 DA',
    formattedEquivalent: '466 DA / mois',
    features: [
      'Accès illimité aux modules du semestre',
      'Entraînement QCMs et répétition espacée',
      'Examens blancs et corrections détaillées',
      'Consultation des cours et polycopiés',
    ],
    recommended: false,
  },
} as const;

export const DEFAULT_ANNUAL_PRICE = SUBSCRIPTION_PRICING.annual.formattedPrice;
export const DEFAULT_ANNUAL_PERIOD = SUBSCRIPTION_PRICING.annual.billingPeriod;
