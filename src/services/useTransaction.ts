import { useState } from "react";
import useAuthFetch from "./useAuthFetch";

export default function useTransaction() {
  const [transactionLoading, setTransactionLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  const getListTransaction = async (userId: string | undefined) => {
    try {
      setTransactionLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/list-transaction?idUser=${userId}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setTransactionLoading(false);
    }
  };

  const createTransaction = async (body: {
    transactionName: string;
    transactionType: string;
    amount: number;
    transactionCategory: string;
    transactionDate: string;
    idUser: string;
  }) => {
    try {
      setTransactionLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/create-transaction`,
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
      setTransactionLoading(false);
    }
  };

  const updateTransaction = async (
    body: {
      transactionName: string;
      transactionType: string;
      amount: number;
      transactionCategory: string;
      transactionDate: string;
      idUser: string;
    },
    idTransaction: string
  ) => {
    try {
      setTransactionLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/update-transaction?idTransaction=${idTransaction}`,
        {
          method: "PATCH",
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
      setTransactionLoading(false);
    }
  };

  const deleteTransaction = async (idTransaction: string) => {
    try {
      setTransactionLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/delete-transaction?idTransaction=${idTransaction}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setTransactionLoading(false);
    }
  };
  return {
    transactionLoading,
    getListTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
