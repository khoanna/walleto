"use client";

import useFund from "@/services/useFund";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Loader2, Coins } from "lucide-react";
import AddCrypto from "@/components/invest/AddCrypto";
import AddTransaction from "@/components/invest/AddTransaction";
import CryptoDetail from "@/components/invest/CryptoDetail";
import AddGold, { AddGoldData } from "@/components/invest/AddGold";
// [NEW] Import component chi tiết Vàng riêng
import GoldDetail from "@/components/invest/GoldDetail";

// --- INTERFACES ---

interface CryptoAsset {
  idAsset: string;
  id: string;
  assetName: string;
  assetSymbol: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
  url: string;
  assetType?: string;
}

interface GoldAsset {
  idAsset: string;
  id: string;
  name: string;
  type: string;
  buyPrice: number;
  sellPrice: number;
  location: string;
  lastUpdated: string;
}

interface FundDetail {
  totalFinanceCurrent: number;
  totalTransactionAmount: number;
  totalProfitAndLoss: number;
  averageFinanceAssets:
    | {
        assetName: string;
        averageFinance: number;
        percentageInPortfolio: number;
      }[]
    | null;
  listInvestmentAssetResponse: CryptoAsset[] | null;
  sjcGoldResponse: GoldAsset[] | null;
}

// --- HELPER FUNCTIONS ---

function formatCompactMoney(amount: number) {
  if (!amount && amount !== 0) return "0 đ";
  const absAmount = Math.abs(amount);
  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };
  let formatted = "";
  if (absAmount >= 1_000_000_000_000_000) {
    formatted = formatNumber(absAmount / 1_000_000_000_000_000) + " triệu tỷ";
  } else if (absAmount >= 1_000_000_000) {
    formatted = formatNumber(absAmount / 1_000_000_000) + " tỷ";
  } else if (absAmount >= 1_000_000) {
    formatted = formatNumber(absAmount / 1_000_000) + " triệu";
  } else {
    formatted = absAmount.toLocaleString("vi-VN") + " đ";
  }
  return amount < 0 ? `-${formatted}` : formatted;
}

const DetailFund = () => {
  const id = useParams().id;
  const router = useRouter();

  const { getDetailFund, addCrypto, addGold, deleteCrypto, addTransaction } =
    useFund();

  const [fundDetail, setFundDetail] = useState<FundDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // --- STATE QUẢN LÝ TAB ---
  const [activeTab, setActiveTab] = useState<"crypto" | "gold">("crypto");

  // --- STATES QUẢN LÝ MODAL ---
  const [isAddCryptoModalOpen, setIsAddCryptoModalOpen] = useState(false);
  const [isAddGoldModalOpen, setIsAddGoldModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] =
    useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<{
    id: string;
    name: string;
    symbol: string;
    price: number;
    image: string;
  } | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDetailFund = async () => {
      try {
        setLoading(true);
        const data = await getDetailFund(String(id));
        setFundDetail(data?.data);
      } catch (error) {
        console.error("Error fetching detail fund:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetailFund();
  }, [id]);

  const refreshData = async () => {
    const refreshData = await getDetailFund(String(id));
    setFundDetail(refreshData?.data);
  };

  // --- HANDLERS ---

  const handleAddCrypto = async (data: {
    id: string;
    assetName: string;
    assetSymbol: string;
    idFund: string;
  }) => {
    try {
      await addCrypto(data);
      setIsAddCryptoModalOpen(false);
      refreshData();
      setActiveTab("crypto");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleAddGold = async (data: AddGoldData) => {
    try {
      if (addGold) {
        await addGold(data);
        setIsAddGoldModalOpen(false);
        refreshData();
        setActiveTab("gold");
      }
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleDeleteAsset = async (idAsset: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài sản này khỏi quỹ?")) {
      await deleteCrypto(idAsset);
      refreshData();
    }
  };

  const handleAddTransaction = async (data: any) => {
    try {
      await addTransaction(data);
      setIsAddTransactionModalOpen(false);
      setSelectedAsset(null);
      refreshData();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleOpenAddTransaction = (asset: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    image: string;
  }) => {
    setSelectedAsset(asset);
    setIsAddTransactionModalOpen(true);
  };

  const handleOpenDetail = (asset: {
    id: string;
    name: string;
    symbol: string;
    price: number;
    image: string;
  }) => {
    setSelectedAsset(asset);
    setIsDetailModalOpen(true);
  };

  const getChangeColor = (value: number) => {
    if (value > 0) return "text-green-500";
    if (value < 0) return "text-red-500";
    return "text-text";
  };

  const colors = [
    "#06b6d4",
    "#8b5cf6",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#ec4899",
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-text" size={48} />
      </div>
    );
  if (!fundDetail)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-text">Không tìm thấy quỹ</p>
      </div>
    );

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 bg-background text-text">
      {/* --- HEADER --- */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => router.back()}
            className="p-2 cursor-pointer hover:bg-background rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-text"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">
            My portfolio
          </h1>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsAddCryptoModalOpen(true)}
            className="px-4 py-2 bg-foreground text-text font-semibold rounded-full border border-text/20 hover:brightness-110 transition-all shadow-lg flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Thêm Crypto
          </button>
          <button
            onClick={() => setIsAddGoldModalOpen(true)}
            className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 transition-all shadow-lg flex items-center gap-2 text-sm flex-1 sm:flex-none justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
              />
            </svg>
            Thêm Vàng
          </button>
        </div>
      </div>

      {/* --- STATS & CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="lg:col-span-1 bg-card rounded-2xl p-4 sm:p-6 shadow-xl border border-border">
          <h2 className="text-base sm:text-lg font-semibold text-text mb-4">
            Phân bổ tài sản
          </h2>
          {fundDetail.averageFinanceAssets &&
          fundDetail.averageFinanceAssets.length > 0 ? (
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {fundDetail.averageFinanceAssets.map((asset, index) => {
                    const previousPercentage = fundDetail
                      .averageFinanceAssets!.slice(0, index)
                      .reduce((sum, a) => sum + a.percentageInPortfolio, 0);
                    const radius = 40;
                    const circumference = 2 * Math.PI * radius;
                    const offset =
                      circumference -
                      (asset.percentageInPortfolio / 100) * circumference;
                    const rotation = (previousPercentage / 100) * 360;
                    return (
                      <circle
                        key={asset.assetName}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="transparent"
                        stroke={colors[index % colors.length]}
                        strokeWidth="20"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          transformOrigin: "50% 50%",
                        }}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-text/60 text-center text-xs sm:text-sm">
                Chưa có tài sản nào
              </p>
            </div>
          )}
          <div className="space-y-2">
            {fundDetail.averageFinanceAssets?.map((asset, index) => (
              <div
                key={asset.assetName}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-xs sm:text-sm text-text truncate max-w-[150px]">
                    {asset.assetName}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-text">
                  {asset.percentageInPortfolio}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-xl border border-border">
            <p className="text-xs sm:text-sm text-text/60 mb-2">
              Tổng giá trị hiện tại
            </p>
            <p className="text-xl sm:text-2xl font-bold text-text">
              {formatCompactMoney(fundDetail.totalFinanceCurrent)}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-xl border border-border">
            <p className="text-xs sm:text-sm text-text/60 mb-2">Vốn đầu tư</p>
            <p className="text-xl sm:text-2xl font-bold text-text">
              {formatCompactMoney(fundDetail.totalTransactionAmount)}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-xl border border-border">
            <p className="text-xs sm:text-sm text-text/60 mb-2">
              {fundDetail.totalProfitAndLoss >= 0 ? "Lợi nhuận" : "Thua lỗ"}
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${getChangeColor(
                fundDetail.totalProfitAndLoss
              )}`}
            >
              {fundDetail.totalProfitAndLoss >= 0 ? "+" : ""}
              {formatCompactMoney(fundDetail.totalProfitAndLoss)}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-xl border border-border">
            <p className="text-xs sm:text-sm text-text/60 mb-2">
              Tỷ suất lợi nhuận (ROI)
            </p>
            <p
              className={`text-xl sm:text-2xl font-bold ${getChangeColor(
                fundDetail.totalProfitAndLoss
              )}`}
            >
              {fundDetail.totalTransactionAmount > 0
                ? (
                    (fundDetail.totalProfitAndLoss /
                      fundDetail.totalTransactionAmount) *
                    100
                  ).toFixed(2)
                : "0.00"}
              %
            </p>
          </div>
        </div>
      </div>

      {/* --- ASSETS TABLE WITH TABS --- */}
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* TAB HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border p-4 gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-text">
            Danh mục tài sản
          </h2>

          <div className="flex bg-background/50 p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab("crypto")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "crypto"
                  ? "bg-foreground shadow-sm text-text"
                  : "text-text/60 hover:text-text"
              }`}
            >
              Crypto ({fundDetail.listInvestmentAssetResponse?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("gold")}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "gold"
                  ? "bg-yellow-500 shadow-sm text-white"
                  : "text-text/60 hover:text-text"
              }`}
            >
              Vàng ({fundDetail.sjcGoldResponse?.length || 0})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card border-b border-border">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-text uppercase">
                  Tài sản
                </th>
                {activeTab === "crypto" ? (
                  <>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase">
                      Giá
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase">
                      24h
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase">
                      Vốn hóa
                    </th>
                    <th className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase">
                      Volume (24h)
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase text-green-500">
                      Giá Mua vào
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase text-yellow-500">
                      Giá Bán ra
                    </th>
                    <th className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-text uppercase">
                      Khu vực
                    </th>
                  </>
                )}
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-text uppercase">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-text/5">
              {/* CASE 1: CRYPTO TAB */}
              {activeTab === "crypto" &&
                fundDetail.listInvestmentAssetResponse?.map((asset) => (
                  <tr
                    key={asset.idAsset}
                    className="hover:bg-text/5 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                        onClick={() =>
                          handleOpenDetail({
                            id: asset.idAsset,
                            name: asset.assetName,
                            symbol: asset.assetSymbol,
                            price: asset.currentPrice,
                            image: asset.url,
                          })
                        }
                      >
                        <img
                          src={asset.url}
                          alt={asset.assetName}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                        />
                        <div>
                          <div className="font-semibold text-text group-hover:text-blue-500 transition-colors text-xs sm:text-sm">
                            {asset.assetName}
                          </div>
                          <div className="text-xs text-text/60 uppercase">
                            {asset.assetSymbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-text text-xs sm:text-sm">
                      {Number(asset.currentPrice).toLocaleString("vi-VN")}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-3 sm:py-4 text-right font-medium text-xs sm:text-sm ${getChangeColor(
                        asset.priceChangePercentage24h
                      )}`}
                    >
                      {asset.priceChangePercentage24h >= 0 ? "+" : ""}
                      {asset.priceChangePercentage24h.toFixed(2)}%
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-right text-text text-xs sm:text-sm">
                      {formatCompactMoney(asset.marketCap)}
                    </td>
                    <td className="hidden xl:table-cell px-3 sm:px-6 py-3 sm:py-4 text-right text-text text-xs sm:text-sm">
                      {formatCompactMoney(asset.totalVolume)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleOpenAddTransaction({
                              id: asset.idAsset,
                              name: asset.assetName,
                              symbol: asset.assetSymbol,
                              price: asset.currentPrice,
                              image: asset.url,
                            })
                          }
                          className="p-1.5 sm:p-2 hover:bg-green-500/10 rounded-lg text-green-500"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.idAsset)}
                          className="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* CASE 2: GOLD TAB */}
              {activeTab === "gold" &&
                fundDetail.sjcGoldResponse?.map((gold) => (
                  <tr
                    key={gold.idAsset}
                    className="hover:bg-yellow-500/5 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
                        onClick={() =>
                          handleOpenDetail({
                            id: gold.idAsset,
                            name: gold.name,
                            symbol: gold.type,
                            price: gold.buyPrice,
                            image: "",
                          })
                        }
                      >
                        {/* Icon Coins Vàng */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                          <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-text text-xs sm:text-sm group-hover:text-yellow-600 transition-colors">
                            {gold.name}
                          </div>
                          <div className="text-xs text-text/60 bg-yellow-500/10 px-1 rounded w-fit mt-0.5">
                            {gold.type}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-text text-xs sm:text-sm">
                      {Number(gold.buyPrice).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right font-semibold text-yellow-500 text-xs sm:text-sm">
                      {Number(gold.sellPrice).toLocaleString("vi-VN")}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-3 sm:py-4 text-right text-text text-xs sm:text-sm text-text/60">
                      {gold.location}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          onClick={() =>
                            handleOpenAddTransaction({
                              id: gold.idAsset,
                              name: gold.name,
                              symbol: gold.type,
                              price: gold.buyPrice,
                              image: "",
                            })
                          }
                          className="p-1.5 sm:p-2 hover:bg-green-500/10 rounded-lg text-green-500"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(gold.idAsset)}
                          className="p-1.5 sm:p-2 hover:bg-red-500/10 rounded-lg text-red-500"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {/* EMPTY STATES */}
              {activeTab === "crypto" &&
                !fundDetail.listInvestmentAssetResponse?.length && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-text/50">
                      Chưa có tài sản Crypto nào
                    </td>
                  </tr>
                )}
              {activeTab === "gold" && !fundDetail.sjcGoldResponse?.length && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text/50">
                    Chưa có tài sản Vàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AddCrypto
        isOpen={isAddCryptoModalOpen}
        onClose={() => setIsAddCryptoModalOpen(false)}
        onSubmit={handleAddCrypto}
        loading={loading}
        fundId={String(id)}
      />

      <AddGold
        isOpen={isAddGoldModalOpen}
        onClose={() => setIsAddGoldModalOpen(false)}
        onSubmit={handleAddGold}
        loading={loading}
        fundId={String(id)}
      />

      {selectedAsset && (
        <AddTransaction
          isOpen={isAddTransactionModalOpen}
          onClose={() => {
            setIsAddTransactionModalOpen(false);
            setSelectedAsset(null);
          }}
          onSubmit={handleAddTransaction}
          loading={loading}
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          assetSymbol={selectedAsset.symbol}
          currentPrice={selectedAsset.price}
          assetImage={selectedAsset.image}
        />
      )}

      {/* LOGIC RENDER MODAL CHI TIẾT */}
      {selectedAsset &&
        isDetailModalOpen &&
        (activeTab === "gold" ? (
          // Dùng Component riêng cho Vàng (không cần image)
          <GoldDetail
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedAsset(null);
            }}
            idAsset={selectedAsset.id}
            assetName={selectedAsset.name}
            assetSymbol={selectedAsset.symbol}
          />
        ) : (
          // Dùng Component cũ cho Crypto (có image)
          <CryptoDetail
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedAsset(null);
            }}
            idAsset={selectedAsset.id}
            assetName={selectedAsset.name}
            assetSymbol={selectedAsset.symbol}
            assetImage={selectedAsset.image}
          />
        ))}
    </div>
  );
};

export default DetailFund;
