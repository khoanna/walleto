"use client";

import { useEffect, useState } from "react";
import { useUserContext } from "@/context";
import Account from "@/components/dashboard/Account";
import { BalanceActivity } from "@/components/dashboard/Activity";
import DonutChart from "@/components/dashboard/DonutChart";
import { PortfolioTable } from "@/components/dashboard/Porfolio";
import TwoLineChart from "@/components/dashboard/TwoLineChart";
import useDashboard from "@/services/useDashboard";
import {
  FinanceDasboard,
  InvestmentAssetDashboard,
  TransactionDashboard,
  TransactionThisWeekDashboard,
} from "@/type/Dashboard";
import { Loader2 } from "lucide-react";

export default function DashBoard() {
  const userContext = useUserContext();
  const {
    getFinanceInfo,
    getInvesmentAsset,
    getTransactionChart,
    getTransactionThisWeek,
  } = useDashboard();

  const [financeData, setFinanceData] = useState<FinanceDasboard | null>(null);
  const [assetData, setAssetData] = useState<InvestmentAssetDashboard | null>(
    null
  );
  const [transactionData, setTransactionData] =
    useState<TransactionDashboard | null>(null);
  const [weekData, setWeekData] = useState<TransactionThisWeekDashboard | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userContext?.user?.idUser) return;

      try {
        setLoading(true);
        const [finance, assets, transactions, week] = await Promise.all([
          getFinanceInfo(userContext.user.idUser),
          getInvesmentAsset(userContext.user.idUser),
          getTransactionChart(userContext.user.idUser),
          getTransactionThisWeek(userContext.user.idUser),
        ]);

        setFinanceData(finance);
        setAssetData(assets);
        setTransactionData(transactions);
        setWeekData(week);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userContext?.user?.idUser]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-foreground">
        <Loader2 className="animate-spin size-8 text-text" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-foreground p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* 1. Tài khoản hiện tại (Account) */}
        {/* Mobile: Thứ 1 | Desktop: Góc phải hàng 1 */}
        <div className="order-1 lg:order-3 lg:col-span-2 h-auto sm:min-h-[260px] lg:min-h-[340px]">
          <Account financeData={financeData} weekData={weekData} />
        </div>

        {/* 2. Biểu đồ tròn (DonutChart) */}
        {/* Mobile: Thứ 2 | Desktop: Giữa hàng 1 */}
        <div className="order-2 lg:order-2 lg:col-span-2 h-auto sm:min-h-[260px] lg:min-h-[340px]">
          <DonutChart financeData={financeData} />
        </div>

        {/* 3. Biểu đồ đường (TwoLineChart) */}
        {/* Mobile: Thứ 3 | Desktop: Trái hàng 1 */}
        <div className="order-3 lg:order-1 lg:col-span-3 h-auto sm:min-h-[260px] lg:min-h-[340px]">
          <TwoLineChart transactions={transactionData?.data || []} />
        </div>

        {/* 4. Portfolio Table */}
        {/* Mobile: Thứ 4 | Desktop: Trái hàng 2 */}
        <div className="order-4 lg:order-4 lg:col-span-5 min-h-0 sm:min-h-[300px] lg:min-h-[420px]">
          <PortfolioTable assets={assetData?.data || []} />
        </div>

        {/* 5. Giao dịch tuần này (BalanceActivity) */}
        {/* Mobile: Thứ 5 (Cuối cùng) | Desktop: Phải hàng 2 */}
        <div className="order-5 lg:order-5 lg:col-span-2 min-h-0 sm:min-h-[220px] lg:min-h-[420px]">
          <BalanceActivity
            transactions={weekData?.listBriefTransactionResponses || []}
          />
        </div>
      </div>
    </div>
  );
}
