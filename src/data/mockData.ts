import { CheckResult, UserAccount } from '@/types';

// Mock user account data
export const mockUserAccount: UserAccount = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@securebank.com',
  companyName: 'SecureBank Financial Services',
  companyPhone: '(555) 123-4567',
  jobTitle: 'Fraud Detection Analyst',
  plan: {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    checks: '10 monthly checks',
  },
  checksUsed: 3,
  checksLimit: 10,
  accountCreated: '2023-06-15',
  lastLogin: '2024-01-20 14:30:22',
  subscriptionStatus: 'active'
};

// Mock check history data
export const mockCheckHistory: CheckResult[] = [
  {
    id: 1,
    routingNumber: '021000021',
    accountNumber: '****5678',
    checkDate: '2024-05-15T14:30:22Z',
    fraudStatus: 'Flagged',
    flaggedCount: 3,
    bankName: 'JPMorgan Chase Bank',
    flaggedBy: ['Loot', 'Kabbage', 'OnDeck'],
    lastFlaggedDate: '2024-04-20T10:30:00Z',
    timesChecked: 15,
    tags: ['fraud', 'stacking', 'fake_deposits'],
    notes: 'This account has been reported for multiple fraudulent activities across several lenders.',
    defaultBalance: '25000'
  },
  {
    id: 2,
    routingNumber: '111000025',
    accountNumber: '****1234',
    checkDate: '2024-05-14T11:20:15Z',
    fraudStatus: 'Associated',
    bankName: 'Bank of America',
    timesChecked: 8,
    tags: ['associated_account'],
    associatedWith: '021000021-5678',
    associatedFraudAccount: {
      routingNumber: '021000021',
      accountNumberLast4: '5678',
      bankName: 'JPMorgan Chase Bank',
      reportedBy: ['Loot', 'Kabbage']
    }
  },
  {
    id: 3,
    routingNumber: '121000248',
    accountNumber: '****9876',
    checkDate: '2024-05-13T09:45:30Z',
    fraudStatus: 'Not Reported',
    bankName: 'Wells Fargo Bank',
    timesChecked: 5,
    tags: []
  }
];

// Mock product data
export const mockProducts = [
  {
    id: 'free',
    priceId: 'price_free',
    name: 'Free',
    description: '10 monthly checks',
    mode: 'subscription',
  },
  {
    id: 'growth',
    priceId: 'price_growth',
    name: 'Growth',
    description: '500 monthly checks',
    mode: 'subscription',
  },
  {
    id: 'pro',
    priceId: 'price_pro',
    name: 'Pro',
    description: 'Unlimited monthly checks',
    mode: 'subscription',
  }
];

// Helper function to get account database
export const getAccountDatabase = (): Record<string, any> => {
  try {
    const saved = localStorage.getItem('bankcheck_account_database');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.data || parsed || {};
    }
    return {};
  } catch (error) {
    console.error('Error parsing account database:', error);
    return {};
  }
};

// Helper function to save account database
export const saveAccountDatabase = (database: Record<string, any>): void => {
  try {
    localStorage.setItem('bankcheck_account_database', JSON.stringify({
      timestamp: Date.now(),
      version: '1.0',
      data: database
    }));
  } catch (error) {
    console.error('Error saving account database:', error);
  }
};

// Mock function to get bank name from routing number
export const getBankNameFromRouting = (routingNumber: string): string => {
  // Generate realistic bank names based on routing number patterns
  const bankNames = [
    'Wells Fargo Bank',
    'JPMorgan Chase Bank', 
    'Bank of America',
    'U.S. Bank',
    'PNC Bank',
    'Capital One Bank',
    'TD Bank',
    'Fifth Third Bank'
  ];
  
  const routingInt = parseInt(routingNumber);
  const bankIndex = routingInt % bankNames.length;
  return bankNames[bankIndex];
};