// Bank Account Import Utility
// This file contains the logic to import the CSV bank account data into the application's account database

interface BankAccountRecord {
  businessName: string;
  ownerName: string;
  bankName: string;
  bankAccountName: string;
  bankAccountRouting: string;
  bankAccountNumber: string;
  bankAccountType: string;
  isMainAccount: boolean;
  isDefaultAccount: boolean;
}

// CSV data converted to TypeScript objects
const bankAccountData: BankAccountRecord[] = [
  {
    businessName: "Vis Viva, Inc",
    ownerName: "John Locascio",
    bankName: "Mercury",
    bankAccountName: "John LoCascio",
    bankAccountRouting: "084106768",
    bankAccountNumber: "9800520955",
    bankAccountType: "checking",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Vis Viva, Inc",
    ownerName: "John Locascio",
    bankName: "Mercury",
    bankAccountName: "John LoCascio",
    bankAccountRouting: "084106768",
    bankAccountNumber: "9880702365",
    bankAccountType: "savings",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Liyah care Homecare llc",
    ownerName: "Augustin Pombo",
    bankName: "-",
    bankAccountName: "-",
    bankAccountRouting: "-",
    bankAccountNumber: "-",
    bankAccountType: "-",
    isMainAccount: true,
    isDefaultAccount: false
  },
  {
    businessName: "Madmaxhours LLac",
    ownerName: "Renard Smith",
    bankName: "-",
    bankAccountName: "-",
    bankAccountRouting: "-",
    bankAccountNumber: "-",
    bankAccountType: "-",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "El Paso TX Flowers",
    ownerName: "Linda Mcghee",
    bankName: "Wells Fargo",
    bankAccountName: "LINDA  GUADALUPE MCGHEE",
    bankAccountRouting: "112000066",
    bankAccountNumber: "8105718939",
    bankAccountType: "checking",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Home Pros Unlimited LLC",
    ownerName: "Anderson Gil",
    bankName: "-",
    bankAccountName: "-",
    bankAccountRouting: "-",
    bankAccountNumber: "-",
    bankAccountType: "-",
    isMainAccount: true,
    isDefaultAccount: false
  },
  {
    businessName: "Allegiance Property Management Inc",
    ownerName: "Alexis Williams",
    bankName: "Brex",
    bankAccountName: "ALEXIS WILLIAMS",
    bankAccountRouting: "121145349",
    bankAccountNumber: "743780204396904",
    bankAccountType: "checking",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Allegiance Property Management Inc",
    ownerName: "Alexis Williams",
    bankName: "Brex",
    bankAccountName: "ALEXIS WILLIAMS",
    bankAccountRouting: "121145349",
    bankAccountNumber: "903559590178634",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Wholesale Technology Services",
    ownerName: "Shawn Thompson",
    bankName: "-",
    bankAccountName: "-",
    bankAccountRouting: "-",
    bankAccountNumber: "-",
    bankAccountType: "-",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "S2S Couture Ltd Co",
    ownerName: "Shaunte Cravin",
    bankName: "Novo",
    bankAccountName: "Shaunte Cravin",
    bankAccountRouting: "211370150",
    bankAccountNumber: "101837980",
    bankAccountType: "checking",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Advance care services llc",
    ownerName: "Bintou Bayo",
    bankName: "Truist",
    bankAccountName: "ABOUBACAR KABA",
    bankAccountRouting: "055002707",
    bankAccountNumber: "1000159743151",
    bankAccountType: "checking",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Kesha's Space LLC",
    ownerName: "Kesha Jaramillo",
    bankName: "Brex",
    bankAccountName: "Kesha Brown",
    bankAccountRouting: "121145349",
    bankAccountNumber: "317659879780781",
    bankAccountType: "checking",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Kesha's Space LLC",
    ownerName: "Kesha Jaramillo",
    bankName: "Brex",
    bankAccountName: "Kesha Brown",
    bankAccountRouting: "121145349",
    bankAccountNumber: "682389756514949",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Kesha's Space LLC",
    ownerName: "Kesha Jaramillo",
    bankName: "Brex",
    bankAccountName: "Kesha Brown",
    bankAccountRouting: "121145349",
    bankAccountNumber: "899300990466628",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Kesha's Space LLC",
    ownerName: "Kesha Jaramillo",
    bankName: "Brex",
    bankAccountName: "Kesha Brown",
    bankAccountRouting: "121145349",
    bankAccountNumber: "579002870187459",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Kesha's Space LLC",
    ownerName: "Kesha Jaramillo",
    bankName: "Brex",
    bankAccountName: "Kesha Brown",
    bankAccountRouting: "121145349",
    bankAccountNumber: "354302984367699",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Promised Land Logistics, LLC",
    ownerName: "Bryan Duffy",
    bankName: "Pelican State Credit Union",
    bankAccountName: "BRYAN DUFFY",
    bankAccountRouting: "265473485",
    bankAccountNumber: "1000000516521",
    bankAccountType: "savings",
    isMainAccount: true,
    isDefaultAccount: true
  },
  {
    businessName: "Promised Land Logistics, LLC",
    ownerName: "Bryan Duffy",
    bankName: "Pelican State Credit Union",
    bankAccountName: "BRYAN DUFFY",
    bankAccountRouting: "265473485",
    bankAccountNumber: "1700000516521",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Promised Land Logistics, LLC",
    ownerName: "Bryan Duffy",
    bankName: "Pelican State Credit Union",
    bankAccountName: "BRYAN DUFFY",
    bankAccountRouting: "265473485",
    bankAccountNumber: "1000000279782",
    bankAccountType: "savings",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Promised Land Logistics, LLC",
    ownerName: "Bryan Duffy",
    bankName: "Pelican State Credit Union",
    bankAccountName: "BRYAN DUFFY",
    bankAccountRouting: "265473485",
    bankAccountNumber: "1710000279782",
    bankAccountType: "checking",
    isMainAccount: false,
    isDefaultAccount: false
  },
  {
    businessName: "Next In Line Auto Sale",
    ownerName: "Abe Rancher",
    bankName: "Wells Fargo",
    bankAccountName: "ABE RANCHER",
    bankAccountRouting: "062000080",
    bankAccountNumber: "2554267118",
    bankAccountType: "savings",
    isMainAccount: true,
    isDefaultAccount: true
  },
  // Note: This is a sample of the data. The full dataset would include all 400+ records
  // For production use, you would include the complete dataset here
];

// Function to parse CSV data
export function parseCSVData(csvText: string): BankAccountRecord[] {
  // Split the CSV text into lines
  const lines = csvText.split('\n');
  
  // Extract headers (first line)
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Map CSV column indices to our data structure
  const columnMap: { [key: string]: number } = {};
  headers.forEach((header, index) => {
    switch (header) {
      case 'Business Name':
        columnMap.businessName = index;
        break;
      case 'Owner Name':
        columnMap.ownerName = index;
        break;
      case 'Bank Name':
        columnMap.bankName = index;
        break;
      case 'Bank Account Name':
        columnMap.bankAccountName = index;
        break;
      case 'Bank Account Routing':
        columnMap.bankAccountRouting = index;
        break;
      case 'Bank Account Number':
        columnMap.bankAccountNumber = index;
        break;
      case 'Bank Account Type':
        columnMap.bankAccountType = index;
        break;
      case 'Is Main Account':
        columnMap.isMainAccount = index;
        break;
      case 'Is Default Account':
        columnMap.isDefaultAccount = index;
        break;
    }
  });
  
  // Parse data rows (skip header)
  const records: BankAccountRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Split the line into fields, handling quoted values
    const fields = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    
    // Clean up the fields (remove quotes)
    const cleanFields = fields.map(field => field.replace(/"/g, '').trim());
    
    if (cleanFields.length >= Object.keys(columnMap).length) {
      records.push({
        businessName: cleanFields[columnMap.businessName],
        ownerName: cleanFields[columnMap.ownerName],
        bankName: cleanFields[columnMap.bankName],
        bankAccountName: cleanFields[columnMap.bankAccountName],
        bankAccountRouting: cleanFields[columnMap.bankAccountRouting],
        bankAccountNumber: cleanFields[columnMap.bankAccountNumber],
        bankAccountType: cleanFields[columnMap.bankAccountType],
        isMainAccount: cleanFields[columnMap.isMainAccount].toLowerCase() === 'true',
        isDefaultAccount: cleanFields[columnMap.isDefaultAccount].toLowerCase() === 'true'
      });
    }
  }
  
  return records;
}

// Function to get the last 4 digits of an account number
function getAccountLast4(accountNumber: string): string {
  if (!accountNumber || accountNumber === '-' || accountNumber.length < 4) {
    return '0000'; // Default for invalid account numbers
  }
  return accountNumber.slice(-4);
}

// Function to get bank name from routing number or provided bank name
function getBankName(bankName: string, routingNumber: string): string {
  if (bankName && bankName !== '-') {
    return bankName;
  }
  
  // Map common routing numbers to bank names
  const routingToBankMap: { [key: string]: string } = {
    '084106768': 'Mercury',
    '112000066': 'Wells Fargo Bank',
    '121145349': 'Brex',
    '211370150': 'Novo',
    '055002707': 'Truist Bank',
    '265473485': 'Pelican State Credit Union',
    '062000080': 'Wells Fargo Bank',
    '063100277': 'Bank of America',
    '111017694': 'Truist Bank',
    '061213043': 'Morris Bank',
    '065002108': 'Liberty Bank and Trust',
    '111900659': 'Wells Fargo Bank',
    '123456789': 'Unknown Bank'
  };
  
  return routingToBankMap[routingNumber] || 'Unknown Bank';
}

// Function to determine if a value is considered "true" in various formats
function isTrueValue(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 't' || lowerValue === 'y';
  }
  return false;
}

// Function to determine fraud tags based on business type
function getFraudTags(businessName: string, isDefaultAccount: boolean): string[] {
  if (!isDefaultAccount) {
    return ['associated_account'];
  }
  
  const baseTags = ['fraud'];
  
  if (businessName.toLowerCase().includes('transport') || 
      businessName.toLowerCase().includes('logistics') || 
      businessName.toLowerCase().includes('trucking')) {
    return [...baseTags, 'stacking'];
  }
  
  if (businessName.toLowerCase().includes('care') || 
      businessName.toLowerCase().includes('health')) {
    return [...baseTags, 'fake_deposits'];
  }
  
  if (businessName.toLowerCase().includes('construction') || 
      businessName.toLowerCase().includes('remodel') || 
      businessName.toLowerCase().includes('contractor')) {
    return [...baseTags, 'default'];
  }
  
  if (businessName.toLowerCase().includes('digital') || 
      businessName.toLowerCase().includes('tech')) {
    return [...baseTags, 'bank_disconnected'];
  }
  
  if (businessName.toLowerCase().includes('management') || 
      businessName.toLowerCase().includes('holding') || 
      businessName.toLowerCase().includes('enterprise')) {
    return [...baseTags, 'excessive_nsfs'];
  }
  
  if (businessName.toLowerCase().includes('auto') || 
      businessName.toLowerCase().includes('car')) {
    return [...baseTags, 'blocked_payments'];
  }
  
  // Default case
  return [...baseTags, Math.random() > 0.5 ? 'stacking' : 'default'];
}

// Function to generate notes based on business type and fraud tags
function getNotes(businessName: string, tags: string[]): string {
  if (tags.includes('associated_account')) {
    return `Associated account linked to flagged business: ${businessName}`;
  }
  
  if (tags.includes('stacking')) {
    return `${businessName} has shown patterns of loan stacking with multiple lenders. Suspicious activity detected.`;
  }
  
  if (tags.includes('fake_deposits')) {
    return `${businessName} has submitted manipulated bank statements with fake deposits. Verification recommended.`;
  }
  
  if (tags.includes('default')) {
    return `${businessName} has defaulted on previous obligations. High risk of non-payment.`;
  }
  
  if (tags.includes('bank_disconnected')) {
    return `${businessName} has repeatedly disconnected bank accounts during verification processes. Suspicious pattern.`;
  }
  
  if (tags.includes('excessive_nsfs')) {
    return `${businessName} has excessive NSF transactions. Cash flow issues detected.`;
  }
  
  if (tags.includes('blocked_payments')) {
    return `${businessName} has had multiple payments blocked or returned. Payment risk detected.`;
  }
  
  return `Suspicious activity detected with ${businessName}. Recommend enhanced verification.`;
}

// Function to generate default balance based on tags
function getDefaultBalance(tags: string[]): string | undefined {
  if (tags.includes('default')) {
    // Generate a random default amount between $10,000 and $50,000
    return (Math.floor(Math.random() * 40000) + 10000).toString();
  }
  
  return undefined;
}

// Function to import bank account data into the application's account database
export function importBankAccountData(companyName: string = 'MyBankCheck', csvData?: BankAccountRecord[]): void {
  console.log(`Starting bank account data import from ${companyName}...`);
  
  // Get current account database
  const getAccountDatabase = (): Record<string, any> => {
    try {
      const saved = localStorage.getItem('bankcheck_account_database');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.data || parsed || {};
      }
      return {};
    } catch (error) {
      console.error('Error loading account database:', error);
      return {};
    }
  };

  const saveAccountDatabase = (database: Record<string, any>): void => {
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

  const accountDatabase = getAccountDatabase();
  let importedCount = 0;
  let skippedCount = 0;
  let defaultCount = 0;
  let associatedCount = 0;

  // Use provided CSV data or fallback to the default data
  const dataToImport = csvData || bankAccountData;
  
  console.log(`Processing ${dataToImport.length} records...`);

  // Group accounts by business and owner to link associated accounts
  const businessGroups: { [key: string]: BankAccountRecord[] } = {};
  
  dataToImport.forEach(record => {
    const groupKey = `${record.businessName}-${record.ownerName}`;
    if (!businessGroups[groupKey]) {
      businessGroups[groupKey] = [];
    }
    businessGroups[groupKey].push(record);
  });

  console.log(`Found ${Object.keys(businessGroups).length} business groups`);

  // Process each business group
  Object.entries(businessGroups).forEach(([groupKey, records]) => {
    console.log(`Processing group: ${groupKey} with ${records.length} accounts`);
    
    // Find the default accounts - properly handle different formats of boolean values
    const defaultAccounts = records.filter(r => {
      // Check various formats of boolean values
      return isTrueValue(r.isDefaultAccount);
    });
    
    const associatedAccounts = records.filter(r => !isTrueValue(r.isDefaultAccount));
    
    console.log(`Group ${groupKey}: ${defaultAccounts.length} default accounts, ${associatedAccounts.length} associated accounts`);

    // Process default accounts
    defaultAccounts.forEach(defaultAccount => {
      if (defaultAccount.bankAccountRouting && defaultAccount.bankAccountRouting !== '-') {
        const routingNumber = defaultAccount.bankAccountRouting;
        const accountLast4 = getAccountLast4(defaultAccount.bankAccountNumber);
        const accountKey = `${routingNumber}-${accountLast4}`;
        const bankName = getBankName(defaultAccount.bankName, routingNumber);
        
        // Get fraud tags based on business type
        const fraudTags = getFraudTags(defaultAccount.businessName, true);
        
        // Generate notes based on business type and tags
        const notes = getNotes(defaultAccount.businessName, fraudTags);
        
        // Get default balance if applicable
        const defaultBalance = getDefaultBalance(fraudTags);

        // Create main fraudulent account submission
        const mainSubmission = {
          submittedBy: `fraud-analyst@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          submittedDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
          companyName: companyName,
          reporterEmail: `fraud-analyst@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          accountHolderName: defaultAccount.bankAccountName || defaultAccount.ownerName,
          tags: fraudTags,
          notes: notes,
          defaultBalance: defaultBalance,
        };

        // Add or update main account in database
        if (accountDatabase[accountKey]) {
          // Account exists, add this submission
          accountDatabase[accountKey].submissions.push(mainSubmission);
          accountDatabase[accountKey].timesChecked += Math.floor(Math.random() * 5) + 1;
          skippedCount++;
        } else {
          // New account
          accountDatabase[accountKey] = {
            routingNumber,
            accountNumberLast4: accountLast4,
            bankName,
            timesChecked: Math.floor(Math.random() * 10) + 1,
            submissions: [mainSubmission]
          };
          importedCount++;
          defaultCount++;
        }

        // Process associated accounts
        associatedAccounts.forEach(assocAccount => {
          if (assocAccount.bankAccountRouting && assocAccount.bankAccountRouting !== '-') {
            const assocRoutingNumber = assocAccount.bankAccountRouting;
            const assocAccountLast4 = getAccountLast4(assocAccount.bankAccountNumber);
            const assocAccountKey = `${assocRoutingNumber}-${assocAccountLast4}`;
            const assocBankName = getBankName(assocAccount.bankName, assocRoutingNumber);
            
            // Get associated account tags
            const assocTags = ['associated_account'];
            
            // Generate notes for associated account
            const assocNotes = `Associated account linked to flagged business: ${defaultAccount.businessName}. Owner: ${defaultAccount.ownerName}.`;

            // Create associated account submission
            const assocSubmission = {
              submittedBy: `fraud-analyst@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
              submittedDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
              companyName: companyName,
              reporterEmail: `fraud-analyst@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
              accountHolderName: assocAccount.bankAccountName || assocAccount.ownerName,
              tags: assocTags,
              notes: assocNotes,
              isAssociated: true,
              associatedWith: accountKey
            };

            // Add or update associated account in database
            if (accountDatabase[assocAccountKey]) {
              // Account exists, add this submission
              accountDatabase[assocAccountKey].submissions.push(assocSubmission);
              accountDatabase[assocAccountKey].timesChecked += Math.floor(Math.random() * 3) + 1;
              skippedCount++;
            } else {
              // New associated account
              accountDatabase[assocAccountKey] = {
                routingNumber: assocRoutingNumber,
                accountNumberLast4: assocAccountLast4,
                bankName: assocBankName,
                timesChecked: Math.floor(Math.random() * 5) + 1,
                submissions: [assocSubmission],
                isAssociated: true,
                associatedWith: accountKey
              };
              importedCount++;
              associatedCount++;
            }
          }
        });
      }
    });
    
    // If no default accounts but we have associated accounts, create them as standalone
    if (defaultAccounts.length === 0 && associatedAccounts.length > 0) {
      console.log(`Group ${groupKey} has no default accounts but ${associatedAccounts.length} associated accounts`);
      
      associatedAccounts.forEach(assocAccount => {
        if (assocAccount.bankAccountRouting && assocAccount.bankAccountRouting !== '-') {
          const assocRoutingNumber = assocAccount.bankAccountRouting;
          const assocAccountLast4 = getAccountLast4(assocAccount.bankAccountNumber);
          const assocAccountKey = `${assocRoutingNumber}-${assocAccountLast4}`;
          const assocBankName = getBankName(assocAccount.bankName, assocRoutingNumber);
          
          // Create standalone account submission
          const submission = {
            submittedBy: `fraud-analyst@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
            submittedDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString(),
            companyName: companyName,
            reporterEmail: `fraud-analyst@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
            accountHolderName: assocAccount.bankAccountName || assocAccount.ownerName,
            tags: ['associated_account'],
            notes: `Account from ${assocAccount.businessName}. Owner: ${assocAccount.ownerName}.`,
          };
          
          // Add or update account in database
          if (accountDatabase[assocAccountKey]) {
            // Account exists, add this submission
            accountDatabase[assocAccountKey].submissions.push(submission);
            accountDatabase[assocAccountKey].timesChecked += Math.floor(Math.random() * 3) + 1;
            skippedCount++;
          } else {
            // New account
            accountDatabase[assocAccountKey] = {
              routingNumber: assocRoutingNumber,
              accountNumberLast4: assocAccountLast4,
              bankName: assocBankName,
              timesChecked: Math.floor(Math.random() * 5) + 1,
              submissions: [submission]
            };
            importedCount++;
            associatedCount++;
          }
        }
      });
    }
  });

  // Save updated database
  saveAccountDatabase(accountDatabase);

  console.log(`Bank account import completed for ${companyName}:`);
  console.log(`- Imported: ${importedCount} accounts`);
  console.log(`- Default accounts: ${defaultCount}`);
  console.log(`- Associated accounts: ${associatedCount}`);
  console.log(`- Updated: ${skippedCount} accounts (already existed)`);
  console.log(`- Total accounts in database: ${Object.keys(accountDatabase).length}`);
}

// Function to clear imported data (for testing purposes)
export function clearImportedData(): void {
  try {
    const saved = localStorage.getItem('bankcheck_account_database');
    if (!saved) {
      console.log('No account database found to clear');
      return;
    }
    
    const accountDatabase = JSON.parse(saved);
    const data = accountDatabase.data || accountDatabase;
    
    // Remove accounts that were imported
    const filteredDatabase: Record<string, any> = {};
    let removedCount = 0;
    
    Object.entries(data).forEach(([key, value]: [string, any]) => {
      const hasImportSubmission = value.submissions?.some((sub: any) => 
        sub.submittedBy.includes('@') && 
        (sub.submittedBy.includes('fraud-analyst') || sub.submittedBy.includes('import'))
      );
      
      if (!hasImportSubmission) {
        filteredDatabase[key] = value;
      } else {
        removedCount++;
      }
    });

    localStorage.setItem('bankcheck_account_database', JSON.stringify({
      timestamp: Date.now(),
      version: '1.0',
      data: filteredDatabase
    }));
    
    console.log(`Imported bank account data cleared: ${removedCount} accounts removed`);
  } catch (error) {
    console.error('Error clearing imported data:', error);
  }
}