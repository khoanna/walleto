export interface FinanceDasboard {
  totalAmount: number;
  cash: number;
  cashPercent: number;
  crypto: number;
  cryptoPercent: number;
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
  data: Asset[];
}

export interface TransactionDashboard {
  data: Transaction[];
}

export interface TransactionThisWeekDashboard {
  totalTransactionInWeek: number;
  listBriefTransactionResponses: BriefTransaction[];
}
