'use client';

import { useEffect, useState } from "react";
import { useUserContext } from "@/context";
import Account from "@/components/dashboard/Account";
import { BalanceActivity } from "@/components/dashboard/Activity";
import DonutChart from "@/components/dashboard/DonutChart";
import { PortfolioTable } from "@/components/dashboard/Porfolio";
import TwoLineChart from "@/components/dashboard/TwoLineChart";
import useDashboard from "@/services/useDashboard";
import { FinanceDasboard, InvestmentAssetDashboard, TransactionDashboard, TransactionThisWeekDashboard } from "@/type/Dashboard";
import { Loader2 } from "lucide-react";

export default function DashBoard() {
  const userContext = useUserContext();
  const { getFinanceInfo, getInvesmentAsset, getTransactionChart, getTransactionThisWeek } = useDashboard();
  
  const [financeData, setFinanceData] = useState<FinanceDasboard | null>(null);
  const [assetData, setAssetData] = useState<InvestmentAssetDashboard | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionDashboard | null>(null);
  const [weekData, setWeekData] = useState<TransactionThisWeekDashboard | null>(null);
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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userContext?.user?.idUser]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 bg-foreground flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin size-8 text-text" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-4 sm:pt-6 bg-foreground flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <TwoLineChart transactions={transactionData?.data || []} />
        </div>
        <div className="lg:col-span-2">
          <DonutChart financeData={financeData} />
        </div>
        <div className="lg:col-span-2">
          <Account financeData={financeData} weekData={weekData} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
         <div className="lg:col-span-5">
          <PortfolioTable assets={assetData?.data || []} />
        </div>
        <div className="lg:col-span-2">
          <BalanceActivity transactions={weekData?.listBriefTransactionResponses || []} />
        </div>
      </div>

    </div>
  )
}

