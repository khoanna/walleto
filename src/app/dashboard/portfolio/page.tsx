"use client";

import CryptoTable from "@/components/invest/CryptoTable";
import Fund from "@/components/invest/Fund";
import useCrypto from "@/services/useCrypto";
import { Loader2 } from "lucide-react";
import React from "react";

const Portfolio = () => {
  const { cryptoLoading } = useCrypto();

  if (cryptoLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-foreground">
        <Loader2 className="animate-spin text-text" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-foreground">
      <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)] lg:h-[calc(100vh-3rem)] flex flex-col">
        {/* Header */}
        <header className="mb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold">
                Danh mục đầu tư
              </h1>
              <p className="text-sm text-gray-500">
                Tổng quan crypto và quỹ của bạn
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
          {/* Crypto Table Section 
                - Mobile: Giữ nguyên chiều cao 45-48vh.
                - Desktop (lg): Chuyển thành thanh dọc, chiều cao full (h-full), độ rộng cố định (vd: 25-30%) hoặc w-80/96.
                - Thêm border/shadow để tách biệt khu vực này cho dễ nhìn.
            */}
          <aside className="flex-shrink-1 w-full lg:w-[480px] xl:w-[600px] h-[44vh] sm:h-[50vh] lg:h-full">
            <div className="h-full w-full rounded-lg bg-background/60 shadow-sm border border-gray-800/20 overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-gray-800/10 bg-background">
                <h2 className="text-sm font-medium">Thị trường Crypto</h2>
                <p className="text-xs text-gray-500">Bảng giá và thay đổi</p>
              </div>
              <div className="flex-1 overflow-auto p-3">
                <CryptoTable />
              </div>
            </div>
          </aside>

          {/* Fund Section 
                - Mobile: Chiếm phần còn lại (flex-1).
                - Desktop: Cũng chiếm phần còn lại của chiều ngang (flex-1).
            */}
          <main className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full w-full overflow-y-auto">
              <div className="p-4 rounded-lg bg-background/60 shadow-sm border border-gray-800/10">
                <Fund />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
