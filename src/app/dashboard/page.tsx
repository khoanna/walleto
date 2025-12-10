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
      <div className="h-full flex flex-col gap-3 sm:gap-4">
        {/* Top Row - Charts & Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
          {/* Line Chart - Takes more space on large screens */}
          <div className="md:col-span-2 lg:col-span-3 h-auto sm:min-h-[260px] lg:min-h-[340px]">
            <TwoLineChart transactions={transactionData?.data || []} />
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-2 h-auto sm:min-h-[260px] lg:min-h-[340px]">
            <DonutChart financeData={financeData} />
          </div>

          {/* Account Cards */}
          <div className="lg:col-span-2 h-auto sm:min-h-[260px] lg:min-h-[340px]">
            <Account financeData={financeData} weekData={weekData} />
          </div>
        </div>

        {/* Bottom Row - Portfolio & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4 flex-1">
          {/* Portfolio Table */}
          <div className="lg:col-span-5 min-h-0 sm:min-h-[300px] lg:min-h-[420px]">
            <PortfolioTable assets={assetData?.data || []} />
          </div>

          {/* Activity List */}
          <div className="lg:col-span-2 min-h-0 sm:min-h-[220px] lg:min-h-[420px]">
            <BalanceActivity
              transactions={weekData?.listBriefTransactionResponses || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
