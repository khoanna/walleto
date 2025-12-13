// --- 1. Common Response Wrapper ---
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

// --- 2. Transaction Types ---
export interface TransactionDetail {
  idTransaction: string;
  transactionName: string;
  transactionType: "Thu" | "Chi";
  amount: number;
  transactionCategory: string;
  transactionDate: string;
  createAt?: string;
}

export interface TransactionSummary {
  month?: number;
  year: number;
  totalIncome: number;
  transactionIncomeDetails: TransactionDetail[];
  totalExpense: number;
  transactionExpenseDetails: TransactionDetail[];
  // API trả về 1 trong 2 field này tùy theo month/year
  spreadIncomeAndExpenseByMonth?: number;
  spreadIncomeAndExpenseByYear?: number;
}

export interface TransactionCompareData {
  // Key có thể là month1Summary hoặc year1Summary tùy API
  month1Summary?: TransactionSummary;
  month2Summary?: TransactionSummary;
  year1Summary?: TransactionSummary;
  year2Summary?: TransactionSummary;
}

// --- 3. Investment Types ---
export interface InvestmentDetail {
  idDetail: string;
  type: string;
  price: number;
  quantity: number;
  fee: number;
  expense: number;
  createAt: string;
}

export interface InvestmentSummary {
  month?: number;
  year: number;
  totalBuy: number;
  totalQuantityBuy: number;
  investmentDetailBuyDetails: InvestmentDetail[];
  totalSell: number;
  totalQuantitySell: number;
  investmentDetailSellDetails: InvestmentDetail[];
  spreadBuyAndSellByMonth?: number;
  spreadBuyAndSellByYear?: number;
}

export interface InvestmentCompareData {
  month1Summary?: InvestmentSummary;
  month2Summary?: InvestmentSummary;
  year1Summary?: InvestmentSummary;
  year2Summary?: InvestmentSummary;
}

// --- 4. Asset Type ---
export interface InvestmentAsset {
  idAsset: string;
  assetName: string;
  assetSymbol: string;
}
