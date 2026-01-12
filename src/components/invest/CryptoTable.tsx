"use client";

import useCrypto from "@/services/useCrypto";
import { Crypto } from "@/type/Crypto";
import React, { useEffect, useState } from "react";

const CryptoTable = () => {
  const { getCryptoList } = useCrypto();
  const [cryptoData, setCryptoData] = useState<Crypto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCryptoList();
      setCryptoData(data?.data);
    };
    fetchData();
  }, []);

  const filteredCryptoData = cryptoData?.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    // Formatter đơn giản hóa
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  return (
    <div className="w-full h-full flex flex-col bg-card backdrop-blur-sm">
      {/* Header Section - Sticky */}
      <div className="flex-shrink-0 p-3 sm:p-4 sticky top-0 z-20 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Market</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              {filteredCryptoData?.length || 0} coins
            </span>
          </div>

          {/* Search Bar - Modern Style */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm kiếm coin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted text-text rounded-lg border border-transparent 
                                     focus:outline-none focus:bg-background focus:border-border focus:ring-1 focus:ring-border
                                     placeholder:text-muted-foreground transition-all text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-text transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto nice-scroll">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur text-xs uppercase text-muted-foreground font-medium">
            <tr>
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-2 py-3">Name</th>
              <th className="px-4 py-3 text-right">Price</th>
              {/* Chỉ hiện 24h trên mọi màn hình, các cột khác ẩn khi là sidebar (lg) */}
              <th className="px-4 py-3 text-right">24h</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {filteredCryptoData?.map((crypto, index) => (
              <tr
                key={crypto.id}
                className="hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                  {index + 1}
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-text group-hover:text-primary transition-colors">
                        {crypto.symbol.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {crypto.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-medium text-text">
                  {formatPrice(crypto.current_price)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    crypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                      crypto.price_change_percentage_24h >= 0
                        ? "bg-green-500/10"
                        : "bg-red-500/10"
                    }`}
                  >
                    {crypto.price_change_percentage_24h >= 0 ? "↑" : "↓"}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCryptoData?.length === 0 && (
          <div className="p-8 text-center text-text/40 text-sm">
            Không tìm thấy kết quả nào
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTable;
