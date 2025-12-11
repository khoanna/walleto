import { ArrowUpRight } from "lucide-react";
import React from "react";
import {
  FinanceDasboard,
  TransactionThisWeekDashboard,
} from "@/type/Dashboard";

interface AccountProps {
  financeData: FinanceDasboard | null;
  weekData: TransactionThisWeekDashboard | null;
}

// Hàm format tiền rút gọn
function formatCompactMoney(amount: number) {
  if (!amount) return "0 đ";

  const absAmount = Math.abs(amount);

  // Helper format số thập phân: giữ tối đa 2 số sau dấu phẩy, dùng dấu phẩy kiểu VN
  const formatNumber = (num: number) => {
    return num.toLocaleString("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  let formatted = "";

  // 1.000.000.000.000.000: 1 Triệu Tỷ (15 số 0)
  if (absAmount >= 1_000_000_000_000_000) {
    formatted = formatNumber(absAmount / 1_000_000_000_000_000) + " triệu tỷ";
  }
  // 1.000.000.000: 1 Tỷ (9 số 0)
  else if (absAmount >= 1_000_000_000) {
    formatted = formatNumber(absAmount / 1_000_000_000) + " tỷ vnđ";
  }
  // 1.000.000: 1 Triệu (6 số 0)

  // Nhỏ hơn 1 triệu
  else {
    formatted = absAmount.toLocaleString("vi-VN") + " vnđ";
  }

  return amount < 0 ? `-${formatted}` : formatted;
}

const Account = ({ financeData, weekData }: AccountProps) => {
  const totalAmount = financeData?.totalAmount || 0;
  const totalTransactions = weekData?.totalTransactionInWeek || 0;

  return (
    <div className="h-full flex flex-col gap-3 sm:gap-4">
      {/* Card 1: Số dư hiện tại */}
      <div className="shadow-xl flex-1 bg-background/90 rounded-2xl border border-white/10 p-4 sm:p-5 flex flex-col justify-center min-h-[110px] sm:min-h-0">
        <p className="text-xs sm:text-[13px] text-slate-400 font-medium">
          Tài khoản hiện tại
        </p>
        <p
          className="mt-1 text-3xl sm:text-[34px] leading-tight font-extrabold tracking-tight text-text truncate"
          // Title vẫn giữ full số để hover vào xem chi tiết
          title={totalAmount.toLocaleString("vi-VN") + " vnđ"}
        >
          {formatCompactMoney(totalAmount)}
        </p>
        <p className="mt-1 text-xs sm:text-[13px] font-medium text-emerald-500">
          Tổng tài sản
        </p>
      </div>

      {/* Card 2: Tổng giao dịch tuần */}
      <div className="shadow-xl flex-1 bg-background/90 rounded-2xl border border-white/10 p-4 sm:p-5 flex items-center justify-between min-h-[90px] sm:min-h-0">
        <div className="flex flex-col gap-1 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center size-8 sm:size-9 rounded-full bg-[#0B162C] text-white shadow-inner flex-shrink-0">
              <ArrowUpRight className="size-4" />
            </span>
            <div>
              <p className="text-xs sm:text-[13px] text-slate-500 font-medium">
                Giao dịch
              </p>
              <p className="text-[10px] sm:text-xs text-slate-400">Tuần này</p>
            </div>
          </div>
        </div>
        <div className="text-2xl sm:text-2xl font-bold text-text pl-2">
          {totalTransactions}
        </div>
      </div>
    </div>
  );
};

export default Account;
