export interface UserAccount {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyPhone: string;
  jobTitle: string;
  plan: {
    id: string;
    name: string;
    price: string;
    period: string;
    checks: string;
  };
  checksUsed: number;
  checksLimit: number;
  accountCreated: string;
  lastLogin: string;
  subscriptionStatus?: string;
}

export interface CheckResult {
  id: number;
  routingNumber: string;
  accountNumber: string;
  checkDate: string;
  fraudStatus: 'Flagged' | 'Not Reported' | 'Associated';
  flaggedCount?: number;
  bankName: string;
  flaggedBy?: string[];
  lastFlaggedDate?: string;
  timesChecked?: number;
  tags?: string[];
  associatedWith?: string;
  notes?: string;
  defaultBalance?: string;
  associatedFraudAccount?: {
    routingNumber: string;
    accountNumberLast4: string;
    bankName: string;
    reportedBy: string[];
  };
  customerDetails?: {
    personName: string;
    businessName: string;
    businessAddress: string;
  };
}

export interface USBank {
  name: string;
  routingNumbers: string[];
  aliases?: string[];
}

export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
}