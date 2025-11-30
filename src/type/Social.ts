// src/type/Social.ts

// --- HELPER TYPES ---
export type ShareType = "none" | "cashflow" | "portfolio";

export interface DateFilter {
  from: string;
  to: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}

// --- ENTITIES ---
export interface UserInfo {
  idUser: string;
  name: string;
  urlAvatar: string | null;
  email?: string;
}

export interface FriendshipData {
  idFriendship: string;
  status: string;
  createAt: string;
  infFriendshipResponse: {
    sender: UserInfo;
    receiver: UserInfo | null;
  };
}

export interface TransactionOfPost {
  transactionName: string;
  transactionType: "Thu" | "Chi";
  amount: number;
  transactionDate: string;
}

export interface InvestmentAssetOfPost {
  idAsset?: string;
  assetName: string;
  assetSymbol: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
  url: string;
}

export interface EvaluateResponse {
  idEvaluate: string;
  star: number;
  comment: string;
  createAt: string;
  userOfEvaluateResponse?: UserInfo;
}

export interface Post {
  idPost: string;
  title: string;
  content: string;
  isFavorited: boolean;
  createAt: string;
  updateAt: string;
  isApproved: boolean;
  urlImage: string | null;
  evaluateResponse: {
    totalComments: number;
    averageStars: number;
    evaluateResponses: EvaluateResponse[];
  };
  snapshotResponse: {
    transactionOfPosts: TransactionOfPost[] | null;
    investmentAssetOfPosts: InvestmentAssetOfPost[] | null;
  }[];
  userOfPostResponse: {
    idUser: string;
    name: string;
    urlAvatar: string;
  };
}
