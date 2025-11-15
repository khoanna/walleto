import useAuthFetch from "./useAuthFetch";
import { useState } from "react";
export default function usePayment() {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { authFetch } = useAuthFetch();
  const createPayment = async (body: {
    idUser: string;
    idPackage: string;
    amount: number;
  }) => {
    try {
      setPaymentLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/create-payment`,
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
      setPaymentLoading(false);
    }
  };
  return { paymentLoading, createPayment };
}
