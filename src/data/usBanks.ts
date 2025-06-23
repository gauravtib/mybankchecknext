import { USBank } from '@/types';

export const usBanks: USBank[] = [
  {
    name: "JPMorgan Chase Bank",
    routingNumbers: ["021000021", "267084131", "322271627", "325070760"],
    aliases: ["Chase", "Chase Bank", "JPMorgan Chase"]
  },
  {
    name: "Bank of America",
    routingNumbers: ["026009593", "053000196", "111000025", "121000358"],
    aliases: ["BofA", "BoA"]
  },
  {
    name: "Wells Fargo Bank",
    routingNumbers: ["121000248", "091000019", "053207766", "102000076"],
    aliases: ["Wells Fargo", "WF"]
  },
  {
    name: "Citibank",
    routingNumbers: ["021000089", "254070116", "322271724", "113193532"],
    aliases: ["Citi"]
  },
  {
    name: "U.S. Bank",
    routingNumbers: ["091000022", "042000013", "123103729", "091215927"],
    aliases: ["US Bank", "USB"]
  },
  {
    name: "PNC Bank",
    routingNumbers: ["043000096", "054001725", "083000108", "267084199"],
    aliases: ["PNC"]
  },
  {
    name: "Capital One Bank",
    routingNumbers: ["031176110", "065000090", "051405515", "056073502"],
    aliases: ["Capital One", "CapOne"]
  },
  {
    name: "TD Bank",
    routingNumbers: ["031201360", "054001204", "067014822", "211274450"],
    aliases: ["TD"]
  },
  {
    name: "Fifth Third Bank",
    routingNumbers: ["042000314", "063103915", "072400052", "083002342"],
    aliases: ["Fifth Third", "53 Bank"]
  },
  {
    name: "Truist Bank",
    routingNumbers: ["053000219", "061000104", "063104668", "253177049"],
    aliases: ["Truist", "BB&T", "SunTrust"]
  },
  {
    name: "HSBC Bank USA",
    routingNumbers: ["021001088", "022000020", "021001234"],
    aliases: ["HSBC"]
  },
  {
    name: "Citizens Bank",
    routingNumbers: ["011500120", "021313103", "036001808", "211170101"],
    aliases: ["Citizens"]
  },
  {
    name: "KeyBank",
    routingNumbers: ["041001039", "125000574", "307070115"],
    aliases: ["Key Bank"]
  },
  {
    name: "Regions Bank",
    routingNumbers: ["062000019", "084003997", "062203751"],
    aliases: ["Regions"]
  },
  {
    name: "M&T Bank",
    routingNumbers: ["022000046", "031100089", "052000113"],
    aliases: ["M&T", "Manufacturers and Traders Trust"]
  },
  {
    name: "Huntington Bank",
    routingNumbers: ["044000024", "072000326", "074900275"],
    aliases: ["Huntington"]
  },
  {
    name: "Ally Bank",
    routingNumbers: ["124003116"],
    aliases: ["Ally"]
  },
  {
    name: "American Express Bank",
    routingNumbers: ["124085244"],
    aliases: ["AmEx Bank", "Amex"]
  },
  {
    name: "Discover Bank",
    routingNumbers: ["011500120"],
    aliases: ["Discover"]
  },
  {
    name: "Navy Federal Credit Union",
    routingNumbers: ["256074974"],
    aliases: ["Navy Federal", "NFCU"]
  },
  {
    name: "USAA Federal Savings Bank",
    routingNumbers: ["314074269"],
    aliases: ["USAA", "USAA Bank"]
  },
  {
    name: "Charles Schwab Bank",
    routingNumbers: ["121202211"],
    aliases: ["Schwab", "Charles Schwab"]
  },
  {
    name: "Goldman Sachs Bank USA",
    routingNumbers: ["124085244"],
    aliases: ["Goldman Sachs", "Marcus"]
  },
  {
    name: "First National Bank",
    routingNumbers: ["043000096", "091000019"],
    aliases: ["FNB", "First National"]
  },
  {
    name: "Santander Bank",
    routingNumbers: ["011075150", "231372691"],
    aliases: ["Santander"]
  },
  {
    name: "BMO Harris Bank",
    routingNumbers: ["071000288", "075000022"],
    aliases: ["BMO", "Harris Bank"]
  },
  {
    name: "Comerica Bank",
    routingNumbers: ["072000096", "113000023"],
    aliases: ["Comerica"]
  },
  {
    name: "Zions Bank",
    routingNumbers: ["124000054"],
    aliases: ["Zions"]
  },
  {
    name: "First Citizens Bank",
    routingNumbers: ["053000219", "253177049"],
    aliases: ["First Citizens"]
  },
  {
    name: "Synovus Bank",
    routingNumbers: ["061100606"],
    aliases: ["Synovus"]
  }
];

export function searchBanks(query: string): USBank[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return usBanks.filter(bank => {
    // Search in bank name
    if (bank.name.toLowerCase().includes(searchTerm)) return true;
    
    // Search in aliases
    if (bank.aliases?.some(alias => alias.toLowerCase().includes(searchTerm))) return true;
    
    return false;
  }).slice(0, 10); // Limit to 10 results
}

export function getBankByName(name: string): USBank | undefined {
  return usBanks.find(bank => 
    bank.name === name || 
    bank.aliases?.includes(name)
  );
}

export function getBankByRoutingNumber(routingNumber: string): USBank | undefined {
  return usBanks.find(bank => 
    bank.routingNumbers.includes(routingNumber)
  );
}