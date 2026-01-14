export interface FinanceDasboard {
  totalAmount: number;
  cash: number;
  cashPercent: number;
  crypto: number;
  cryptoPercent: number;
  gold: number;
  goldPercent: number;
}

export interface Asset {
  idAsset: string;
  id: string;
  assetName: string;
  assetSymbol: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
  url: string;
}

export interface Transaction {
  idTransaction: string;
  transactionName: string;
  transactionType: "Thu" | "Chi";
  amount: number;
  transactionCategory: string;
  transactionDate: string;
  createAt: string;
}

interface BriefTransaction {
  idTransaction: string;
  transactionName: string;
  amount: number;
  transactionDate: string;
}

export interface InvestmentAssetDashboard {
  data: {
    listInvestmentAssetResponse: Asset[];
    sjcGoldResponse: SjcGoldItem[];
  };
}

export interface TransactionDashboard {
  data: Transaction[];
}

export interface TransactionThisWeekDashboard {
  totalTransactionInWeek: number;
  listBriefTransactionResponses: BriefTransaction[];
}

export interface SjcGoldItem {
  idAsset: string;
  id: string;
  name: string;
  type: string;
  buyPrice: number;
  sellPrice: number;
  location: string;
  lastUpdated: string;
}
