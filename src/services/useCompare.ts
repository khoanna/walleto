import useAuthFetch from "./useAuthFetch";
import { useState } from "react";
export default function useCompare() {
  const [compareLoading, setCompareLoading] = useState(false);
  const { authFetch } = useAuthFetch();
  const compareInvestmentsByMonth = async (body: {
    firstMonth: number;
    firstYear: number;
    secondMonth: number;
    secondYear: number;
    idUser: string;
    idAsset: string;
  }) => {
    try {
      setCompareLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-detail/compare-investment-detail-by-month`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setCompareLoading(false);
    }
  };
  const compareInvetmenstsByYear = async (body: {
    year1: number;
    year2: number;
    idUser: string;
    idAsset: string;
  }) => {
    try {
      setCompareLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-detail/compare-investment-detail-by-year`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setCompareLoading(false);
    }
  };
  const compareTransactionsByMonth = async (body: {
    firstMonth: number;
    firstYear: number;
    secondMonth: number;
    secondYear: number;
    idUser: string;
  }) => {
    try {
      setCompareLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/compare-transaction-by-month`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setCompareLoading(false);
    }
  };
  const compareTransactionsByYear = async (body: {
    year1: number;
    year2: number;
    idUser: string;
  }) => {
    try {
      setCompareLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/compare-transaction-by-year`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setCompareLoading(false);
    }
  };

  const HisotryTransaction = async (idUser: string) => {
    try {
      setCompareLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/list-transaction-full?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setCompareLoading(false);
    }
  };
  return {
    HisotryTransaction,
    compareInvestmentsByMonth,
    compareInvetmenstsByYear,
    compareTransactionsByMonth,
    compareTransactionsByYear,
    compareLoading,
  };
}
