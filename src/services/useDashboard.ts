import {useState} from "react";
import useAuthFetch from "./useAuthFetch";
import { FinanceDasboard, InvestmentAssetDashboard, TransactionDashboard, TransactionThisWeekDashboard } from "@/type/Dashboard";

export default function useDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const {authFetch} = useAuthFetch();

  const getFinanceInfo = async (idUser: string) => {
    setIsLoading(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/inf-finance-user?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log('Finance Info:', data.data);
      
      return data.data as unknown as FinanceDasboard;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getInvesmentAsset = async (idUser: string) => {
    setIsLoading(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-asset/list-investment-asset-by-user?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      return data as unknown as InvestmentAssetDashboard;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionChart = async (idUser: string) => {
    setIsLoading(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/list-transaction-full?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log(data);
      
      return data as unknown as TransactionDashboard;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const getTransactionThisWeek = async (idUser: string) => {
    setIsLoading(true);
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/list-brief-transaction?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      return data.data as unknown as TransactionThisWeekDashboard;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }


  return {
    getFinanceInfo,
    getInvesmentAsset,
    getTransactionChart,
    getTransactionThisWeek,
    isLoading,
  };
}
