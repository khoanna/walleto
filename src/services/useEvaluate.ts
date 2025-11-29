import useAuthFetch from "./useAuthFetch";
import { useState } from "react";
export default function useEvaluate() {
  const [evaluateLoading, setEvaluateLoading] = useState(false);
  const { authFetch } = useAuthFetch();
  const createEvaluate = async (body: {
    star: number;
    comment: string;
    idPost: string;
    idUser: string;
  }) => {
    try {
      setEvaluateLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/evaluate/create-evaluate`,
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
      setEvaluateLoading(false);
    }
  };

  const updateEvaluate = async (
    idEvaluate: string,
    body: { star?: number; comment?: string }
  ) => {
    try {
      setEvaluateLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/evaluate/update-evaluate?idEvaluate=${idEvaluate}`,
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
      setEvaluateLoading(false);
    }
  };

  const deleteEvaluate = async (idEvaluate: string) => {
    try {
      setEvaluateLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/evaluate/delete-evaluate?idEvaluate=${idEvaluate}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setEvaluateLoading(false);
    }
  };

  return {
    evaluateLoading,
    createEvaluate,
    updateEvaluate,
    deleteEvaluate,
  };
}
