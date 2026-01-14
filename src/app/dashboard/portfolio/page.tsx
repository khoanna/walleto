"use client";

import CryptoTable from "@/components/invest/CryptoTable";
import Fund from "@/components/invest/Fund";
import useCrypto from "@/services/useCrypto";
import useFund from "@/services/useFund";
import { Filter, Loader2, RefreshCcw } from "lucide-react";
import React, { useEffect, useState } from "react";

// Interface cho giá vàng
interface GoldPriceItem {
  id: string;
  name: string;
  type: string;
  buyPrice: number;
  sellPrice: number;
  location: string;
  lastUpdated: string;
  brand?: string; // Thêm trường brand để phân loại hiển thị
}

const Portfolio = () => {
  const { cryptoLoading } = useCrypto();
  const { getGoldPrice } = useFund();

  // --- STATE ---
  const [viewMode, setViewMode] = useState<"crypto" | "gold">("crypto");
  const [goldList, setGoldList] = useState<GoldPriceItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("all"); // Lọc theo Hãng vàng
  const [goldLoading, setGoldLoading] = useState(false);

  // --- FETCH DATA VÀNG TỔNG HỢP ---
  useEffect(() => {
    if (viewMode === "gold" && goldList.length === 0) {
      fetchGoldData();
    }
  }, [viewMode]);

  const fetchGoldData = async () => {
    try {
      setGoldLoading(true);
      const res = await getGoldPrice();
      const data = res?.data;

      if (data) {
        // Gộp tất cả các nguồn vàng lại thành 1 danh sách
        // Thêm trường 'brand' để dễ hiển thị
        const allGold: GoldPriceItem[] = [
          ...(data.sjcGold || []).map((item: any) => ({
            ...item,
            brand: "SJC",
          })),
          ...(data.dojiGold || []).map((item: any) => ({
            ...item,
            brand: "DOJI",
          })),
          ...(data.pnjGold || []).map((item: any) => ({
            ...item,
            brand: "PNJ",
          })),
        ];
        setGoldList(allGold);
      }
    } catch (error) {
      console.error("Lỗi lấy giá vàng:", error);
    } finally {
      setGoldLoading(false);
    }
  };

  // Filter danh sách vàng theo Hãng (Brand) thay vì Type để dễ nhìn tổng quan hơn
  const displayedGoldList =
    selectedBrand === "all"
      ? goldList
      : goldList.filter((g) => g.brand === selectedBrand);

  // Helper để lấy màu sắc badge cho từng hãng
  const getBrandStyle = (brand?: string) => {
    switch (brand) {
      case "SJC":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "DOJI":
        return "bg-red-100 text-red-700 border-red-200";
      case "PNJ":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (cryptoLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-foreground">
        <Loader2 className="animate-spin text-text" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] flex flex-col">
        {/* Header Trang */}
        <header className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold">
                Danh mục đầu tư
              </h1>
              <p className="text-sm text-muted-foreground">
                Tổng quan crypto và quỹ của bạn
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* --- CỘT TRÁI: THỊ TRƯỜNG (CRYPTO / VÀNG TỔNG HỢP) --- */}
          <aside className="flex-shrink-1 w-full lg:w-[480px] xl:w-[600px] h-[44vh] sm:h-[50vh] lg:h-full">
            <div className="h-full w-full rounded-lg bg-card shadow-sm border border-border overflow-hidden flex flex-col">
              {/* Header của Panel: Combobox chọn view */}
              <div className="px-4 py-3 border-b border-border bg-card flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  {/* Combobox 1: Chọn Chế độ xem */}
                  <div className="relative">
                    <select
                      value={viewMode}
                      onChange={(e) =>
                        setViewMode(e.target.value as "crypto" | "gold")
                      }
                      className="appearance-none bg-background border border-border text-text text-sm font-semibold rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="crypto">Thị trường Crypto</option>
                      <option value="gold">Bảng giá Vàng</option>
                    </select>
                    <Filter
                      size={12}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                    />
                  </div>

                  {/* Combobox 2: Lọc Hãng Vàng (Chỉ hiện khi chọn Vàng) */}
                  {viewMode === "gold" && (
                    <div className="relative">
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="appearance-none bg-background border border-border text-text text-sm rounded-md pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer min-w-[100px]"
                      >
                        <option value="all">Tất cả hãng</option>
                        <option value="SJC">SJC</option>
                        <option value="DOJI">DOJI</option>
                        <option value="PNJ">PNJ</option>
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-[10px]">
                        ▼
                      </div>
                    </div>
                  )}
                </div>

                {/* Nút Refresh */}
                {viewMode === "gold" && (
                  <button
                    onClick={fetchGoldData}
                    className="p-1.5 hover:bg-background rounded-md transition-colors"
                    title="Cập nhật giá"
                  >
                    <RefreshCcw
                      size={14}
                      className={goldLoading ? "animate-spin" : ""}
                    />
                  </button>
                )}
              </div>

              {/* Nội dung Bảng */}
              <div className="flex-1 overflow-auto p-0">
                {viewMode === "crypto" ? (
                  // --- HIỂN THỊ CRYPTO ---
                  <div className="p-3">
                    <CryptoTable />
                  </div>
                ) : (
                  // --- HIỂN THỊ BẢNG VÀNG TỔNG HỢP ---
                  <div className="w-full">
                    {goldLoading && goldList.length === 0 ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2
                          className="animate-spin text-yellow-500"
                          size={24}
                        />
                      </div>
                    ) : displayedGoldList.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="bg-background/50 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                          <tr className="border-b border-border">
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase">
                              Tên / Loại
                            </th>
                            <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase">
                              Khu vực
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase text-green-600">
                              Mua vào
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground text-xs uppercase text-yellow-600">
                              Bán ra
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {displayedGoldList.map((gold) => (
                            <tr
                              key={gold.id}
                              className="hover:bg-accent/50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  {/* Badge Hãng */}
                                  <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${getBrandStyle(
                                      gold.brand
                                    )}`}
                                  >
                                    {gold.brand}
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className="font-medium truncate max-w-[140px]"
                                      title={gold.name}
                                    >
                                      {gold.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="hidden sm:table-cell px-4 py-3 text-muted-foreground text-xs">
                                {gold.location}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-green-600 dark:text-green-500 whitespace-nowrap">
                                {Number(gold.buyPrice).toLocaleString("vi-VN")}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-yellow-600 dark:text-yellow-500 whitespace-nowrap">
                                {Number(gold.sellPrice).toLocaleString("vi-VN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground text-sm">
                        Không tải được dữ liệu giá vàng
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* --- CỘT PHẢI: QUẢN LÝ QUỸ (Giữ nguyên) --- */}
          <main className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full w-full rounded-lg bg-card shadow-sm border border-border flex flex-col p-4 sm:p-5">
              <Fund />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
