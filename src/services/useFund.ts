import { useState } from "react";
import useAuthFetch from "./useAuthFetch";

const useFund = () => {
  const [fundLoading, setFundLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  const createFund = async (body: {
    fundName: string;
    description: string;
    idUser: string;
  }) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-fund/create-investment-fund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();

      if (!response.ok || data.statusCode >= 400) {
        throw new Error(data.message || "Có lỗi xảy ra khi tạo quỹ");
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };

  const getListFunds = async (idUser: string) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-fund/list-investment-fund?idUser=${idUser}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };

  const getDetailFund = async (idFund: string) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-asset/list-investment-asset?idFund=${idFund}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };

  const updateFund = async (
    idFund: string,
    body: { fundName?: string; description?: string }
  ) => {
    try {
      setFundLoading(true);

      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-fund/udpate-investment-fund?idFund=${idFund}`,
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
      setFundLoading(false);
    }
  };

  const deleteFund = async (idFund: string) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-fund/delete-investment-fund?idFund=${idFund}`,
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
      setFundLoading(false);
    }
  };

  const addCrypto = async (body: {
    id: string;
    assetName: string;
    assetSymbol: string;
    idFund: string;
  }) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-asset/create-investment-asset-crypto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      console.log(data);

      // Check if API returned error
      if (!response.ok || data.statusCode >= 400) {
        throw new Error(data.message || "Có lỗi xảy ra khi thêm crypto");
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };

  const deleteCrypto = async (idAsset: string) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-asset/delete-investment-asset?idAsset=${idAsset}`,
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
      setFundLoading(false);
    }
  };

  const addTransaction = async (body: {
    type: string;
    price: number;
    quantity: number;
    fee: number;
    expense: number;
    idAsset: string;
  }) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-detail/create-investment-detail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      console.log(data);

      if (!response.ok || data.statusCode >= 400) {
        throw new Error(data.message || "Có lỗi xảy ra khi thêm giao dịch");
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };

  const getDetailAsset = async (idAsset: string) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-detail/list-investment-detail?idAsset=${idAsset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };
  interface AddGoldBody {
    id: string;
    assetName: string;
    mappingKey: string;
    idFund: string;
  }
  const addGold = async (body: AddGoldBody) => {
    try {
      setFundLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/investment-asset/create-investment-asset-gold`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();

      if (!response.ok || data.statusCode >= 400) {
        throw new Error(data.message || "Có lỗi xảy ra khi thêm vàng");
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setFundLoading(false);
    }
  };

  // --- NEW: LẤY GIÁ VÀNG (Chuẩn bị cho bước sau) ---
  const getGoldPrice = async () => {
    try {
      // API này có vẻ public hoặc cần auth tùy cấu hình, tạm dùng authFetch cho đồng bộ
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gold/all-price-gold`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Lỗi lấy giá vàng", error);
      return null;
    }
  };
  return {
    fundLoading,
    createFund,
    getListFunds,
    updateFund,
    getDetailFund,
    addCrypto,
    deleteCrypto,
    addTransaction,
    getDetailAsset,
    deleteFund,
    addGold,
    getGoldPrice,
  };
};

export default useFund;
