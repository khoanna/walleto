"use client";

import { useEffect, useState, useMemo } from "react";
import { useUserContext } from "@/context";
import useDashboard from "@/services/useDashboard";
import {
  Asset,
  FinanceDasboard,
  InvestmentAssetDashboard,
  TransactionDashboard,
  TransactionThisWeekDashboard,
} from "@/type/Dashboard";
import {
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRightLeft,
  MoreHorizontal,
  ArrowUpRight as ArrowUpRightIcon, 
} from "lucide-react";
import Link from "next/link";
import "./dashboard.css";
import { formatVND } from "@/utils/formatCurrency";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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

  // Chart states
  const [chartSeries, setChartSeries] = useState<any[]>([]);
  const [chartOptions, setChartOptions] = useState<ApexOptions>({});
  
  const [chartMode, setChartMode] = useState<"week" | "month" | "year">("month");
  
  // Constants for Donut Chart
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Recalculate Financial Stats & Allocation
  const { 
    calculatedTotal, 
    displayCashPercent, 
    displayCryptoPercent,
    incomeMonth,
    expenseMonth,
    incomeTrend,
    expenseTrend 
  } = useMemo(() => {
    const defaultVals = { 
        calculatedTotal: financeData?.totalAmount || 0,
        displayCashPercent: 0, 
        displayCryptoPercent: 0,
        incomeMonth: 0,
        expenseMonth: 0,
        incomeTrend: 0,
        expenseTrend: 0
    };

    if (!transactionData?.data || transactionData.data.length === 0) return defaultVals;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Calculate Monthly Income/Expense (Current Month)
    const thisMonthTransactions = transactionData.data.filter((t) => {
      const tDate = new Date(t.transactionDate);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    // INFLOW: Sum all income transactions (Thu) this month
    const incMonth = thisMonthTransactions
      .filter((t) => t.transactionType === "Thu")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // OUTFLOW: Sum all expense transactions (Chi) this month
    const expMonth = thisMonthTransactions
      .filter((t) => t.transactionType === "Chi")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // 2. Calculate Trends (vs Previous Month)
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthTransactions = transactionData.data.filter((t) => {
      const tDate = new Date(t.transactionDate);
      return tDate.getMonth() === prevMonth && tDate.getFullYear() === prevYear;
    });

    const prevInc = prevMonthTransactions
      .filter((t) => t.transactionType === "Thu")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const prevExp = prevMonthTransactions
      .filter((t) => t.transactionType === "Chi")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    // Calculate percentage change
    const calcIncomeTrend = (current: number, previous: number) => {
       if (previous === 0) return current > 0 ? 100 : 0;
       return ((current - previous) / previous) * 100;
    };

    // For expenses: DECREASE is GOOD (positive), INCREASE is BAD (negative for display purposes)
    const calcExpenseTrend = (current: number, previous: number) => {
       if (previous === 0) return current > 0 ? -100 : 0;
       return ((current - previous) / previous) * 100;
    };

    // 3. Calculate Net Worth & Allocation
    // Sử dụng trực tiếp dữ liệu từ backend
    const cashValue = Math.abs(financeData?.cash || 0);
    const cryptoValue = Math.abs(financeData?.crypto || 0);
    
    // Debug: In ra giá trị thực tế từ backend
    console.log('=== PORTFOLIO ALLOCATION DEBUG ===');
    console.log('Backend cash:', financeData?.cash);
    console.log('Backend crypto:', financeData?.crypto);
    console.log('Backend totalAmount:', financeData?.totalAmount);
    console.log('Calculated cashValue:', cashValue);
    console.log('Calculated cryptoValue:', cryptoValue);
    
    // Total net worth từ backend
    const total = financeData?.totalAmount || 0;

    // Portfolio Allocation Calculation
    // Công thức: % = (giá trị / tổng) * 100
    let cPercent = 0;
    let crPercent = 0;
    
    const totalAssets = cashValue + cryptoValue;
    
    if (totalAssets > 0) {
        cPercent = (cashValue / totalAssets) * 100;
        crPercent = (cryptoValue / totalAssets) * 100;
    }
    
    console.log('Cash %:', cPercent.toFixed(2));
    console.log('Crypto %:', crPercent.toFixed(2));
    console.log('===================================');

    return { 
        calculatedTotal: total, 
        displayCashPercent: cPercent, 
        displayCryptoPercent: crPercent,
        incomeMonth: incMonth,
        expenseMonth: expMonth,
        incomeTrend: calcIncomeTrend(incMonth, prevInc),
        expenseTrend: calcExpenseTrend(expMonth, prevExp)
    };
  }, [transactionData, financeData]);

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
        console.log(assets);
        
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

  // --- Calculate Chart Data based on Mode ---
  useEffect(() => {
     if (!transactionData?.data) return;

     const transactions = transactionData.data;
     const now = new Date();
     const currentYear = now.getFullYear();
     const currentMonth = now.getMonth();
     
     let categories: string[] = [];
     let incomeData: number[] = [];
     let expenseData: number[] = [];
     
     if (chartMode === "week") {
       categories = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
       // Calculate start of week (Monday)
       const day = now.getDay(); // 0 is Sunday
       const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
       const monday = new Date(now);
       monday.setDate(diff);
       monday.setHours(0,0,0,0);

       Array.from({ length: 7 }, (_, i) => {
         const targetDate = new Date(monday);
         targetDate.setDate(monday.getDate() + i);
         
         const dayTrans = transactions.filter(t => {
            const d = new Date(t.transactionDate);
            return d.getDate() === targetDate.getDate() && 
                   d.getMonth() === targetDate.getMonth() && 
                   d.getFullYear() === targetDate.getFullYear();
         });

         incomeData.push(dayTrans.filter(t => t.transactionType === "Thu").reduce((sum, t) => sum + Math.abs(t.amount), 0));
         expenseData.push(dayTrans.filter(t => t.transactionType === "Chi").reduce((sum, t) => sum + Math.abs(t.amount), 0));
       });

     } else if (chartMode === "month") {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        categories = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);

        Array.from({ length: daysInMonth }, (_, i) => i + 1).forEach((day) => {
          const dayTrans = transactions.filter((t) => {
            const d = new Date(t.transactionDate);
            return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          });

          incomeData.push(dayTrans.filter((t) => t.transactionType === "Thu").reduce((sum, t) => sum + Math.abs(t.amount), 0));
          expenseData.push(dayTrans.filter((t) => t.transactionType === "Chi").reduce((sum, t) => sum + Math.abs(t.amount), 0));
        });

     } else if (chartMode === "year") {
        categories = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
        Array.from({ length: 12 }, (_, i) => {
           const monthTrans = transactions.filter(t => {
              const d = new Date(t.transactionDate);
              return d.getMonth() === i && d.getFullYear() === currentYear;
           });
           
           incomeData.push(monthTrans.filter(t => t.transactionType === "Thu").reduce((sum, t) => sum + Math.abs(t.amount), 0));
           expenseData.push(monthTrans.filter(t => t.transactionType === "Chi").reduce((sum, t) => sum + Math.abs(t.amount), 0));
        });
     }

     setChartSeries([
       { name: "Tiền vào", data: incomeData },
       { name: "Tiền ra", data: expenseData },
     ]);

     setChartOptions({
        chart: {
            type: "area",
            height: 300,
            toolbar: { show: false },
            background: "transparent",
            fontFamily: "var(--font-body)",
        },
        colors: ["#22c55e", "#ef4444"],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: {
            categories: categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: "#6b7280" } }
        },
        yaxis: {
            labels: { 
              style: { colors: "#6b7280" },
              formatter: (val) => formatLargeCurrency(val),
            }
        },
        grid: {
            borderColor: "#2a3441",
            strokeDashArray: 4,
        },
        tooltip: {
            theme: "dark",
            y: {
              formatter: (val) => formatVND(val)
            }
        },
        theme: { mode: "dark" }
     });

  }, [transactionData, chartMode]);

  // Format large numbers (e.g. 4.92 tỷ)
  const formatLargeCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2).replace(".", ",") + " tỷ";
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace(".", ",") + " Tr";
    }
    return formatVND(value, false);
  };
 
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center dashboard-container">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Tổng quan tài chính của bạn</p>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Card 1: Total Assets */}
          <div className="stat-card stat-card--primary">
            <div className="stat-card__header">
              <span className="stat-card__label">Tổng tài sản</span>
              <Wallet className="stat-card__icon" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {formatLargeCurrency(calculatedTotal)}
              </div>
              <div className="stat-card__currency">VNĐ</div>
            </div>
          </div>

          {/* Card 2: Income */}
          <div className="stat-card">
            <div className="stat-card__header">
              <span className="stat-card__label">Thu nhập tháng này</span>
              <div className="stat-card__icon-circle stat-card__icon-circle--green">
                <ArrowUpRight size={16} />
              </div>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {formatLargeCurrency(incomeMonth)}
              </div>
            </div>
          </div>

          {/* Card 3: Expense */}
          <div className="stat-card">
            <div className="stat-card__header">
              <span className="stat-card__label">Chi tiêu tháng này</span>
              <div className="stat-card__icon-circle stat-card__icon-circle--red">
                <ArrowDownRight size={16} />
              </div>
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {formatLargeCurrency(expenseMonth)}
              </div>
            </div>
          </div>

          {/* Card 4: Transactions */}
          <div className="stat-card">
            <div className="stat-card__header">
              <span className="stat-card__label">Giao dịch tuần này</span>
              <ArrowRightLeft className="stat-card__icon stat-card__icon--muted" />
            </div>
            <div className="stat-card__content">
              <div className="stat-card__value">
                {weekData?.totalTransactionInWeek || 0}
              </div>
              <div className="stat-card__sublabel">giao dịch</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Cashflow Chart */}
          <div className="card card--wide">
            <div className="card__header">
              <div className="card__title-group">
                <h3 className="card__title">Dòng tiền</h3>
                <div className="chart-legend mt-2">
                  <div className="chart-legend__item">
                    <span className="chart-legend__dot chart-legend__dot--green"></span>
                    Tiền vào
                  </div>
                  <div className="chart-legend__item">
                    <span className="chart-legend__dot chart-legend__dot--red"></span>
                    Tiền ra
                  </div>
                </div>
              </div>
              <div className="card__tabs">
                <button
                  onClick={() => setChartMode("week")}
                  className={`tab ${chartMode === "week" ? "tab--active" : ""}`}
                >
                  Theo tuần
                </button>
                <button
                  onClick={() => setChartMode("month")}
                  className={`tab ${chartMode === "month" ? "tab--active" : ""}`}
                >
                  Theo tháng
                </button>
                <button
                  onClick={() => setChartMode("year")}
                  className={`tab ${chartMode === "year" ? "tab--active" : ""}`}
                >
                  Theo năm
                </button>
              </div>
            </div>
            <div className="card__content">
              <div className="chart-placeholder w-full h-[300px]">
                {typeof window !== 'undefined' && (
                  <ReactApexChart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type="area" 
                    height={300} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Asset Distribution */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Phân bổ tài sản</h3>
            </div>
            <div className="card__content card__content--centered">
              <div className="donut-chart">
                <svg viewBox="0 0 100 100" className="donut-svg">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#2a3441"
                    strokeWidth="12"
                  />
                  {/* Cash Segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#14b8a6"
                    strokeWidth="12"
                    strokeDasharray={`${
                      (displayCashPercent / 100) * circumference
                    } ${circumference}`}
                  />
                  {/* Crypto Segment - Offset based on Cash */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeDasharray={`${
                      (displayCryptoPercent / 100) * circumference
                    } ${circumference}`}
                    strokeDashoffset={`-${
                      (displayCashPercent / 100) * circumference
                    }`}
                  />
                </svg>
              </div>
              <div className="donut-legend">
                <div className="donut-legend__item">
                  <span
                    className="donut-legend__dot"
                    style={{ backgroundColor: "#14b8a6" }}
                  ></span>
                  <span className="donut-legend__label">Tiền mặt</span>
                  <span className="donut-legend__value">
                    {displayCashPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="donut-legend__item">
                  <span
                    className="donut-legend__dot"
                    style={{ backgroundColor: "#10b981" }}
                  ></span>
                  <span className="donut-legend__label">Crypto</span>
                  <span className="donut-legend__value">
                    {displayCryptoPercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="bottom-grid">
          {/* Portfolio Table */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Danh mục đầu tư</h3>
              <Link href="/dashboard/portfolio" className="card__link">
                Chi tiết <ArrowUpRightIcon size={14} />
              </Link>
            </div>
            <div className="card__content" style={{ padding: 0 }}>
              <div className="overflow-x-auto">
                <table className="crypto-table">
                  <thead>
                    <tr>
                      <th className="crypto-table__th pl-6">Tên</th>
                      <th className="crypto-table__th crypto-table__th--hide-tablet">
                        Marketcap
                      </th>
                      <th className="crypto-table__th crypto-table__th--hide-mobile">
                        Volume
                      </th>
                      <th className="crypto-table__th">Giá</th>
                      <th className="crypto-table__th pr-6">24h</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetData?.data?.listInvestmentAssetResponse?.slice(0, 5).map((asset: Asset) => (
                      <tr key={asset.idAsset} className="crypto-table__row">
                        <td className="crypto-table__td pl-6">
                          <div className="crypto-info">
                            <div className="crypto-info__icon">
                              <img
                                src={asset.url}
                                alt={asset.assetName}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/25";
                                }}
                              />
                            </div>
                            <div className="crypto-info__details">
                              <span className="crypto-info__name">
                                {asset.assetName}
                              </span>
                              <span className="crypto-info__symbol">
                                {asset.assetSymbol}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="crypto-table__td crypto-table__td--muted crypto-table__td--hide-tablet">
                          {formatLargeCurrency(asset.marketCap)}
                        </td>
                        <td className="crypto-table__td crypto-table__td--muted crypto-table__td--hide-mobile">
                          {formatLargeCurrency(asset.totalVolume)}
                        </td>
                        <td className="crypto-table__td font-mono">
                          {formatVND(asset.currentPrice)}
                        </td>
                        <td className="crypto-table__td pr-6">
                          <span
                            className={`badge ${
                              asset.priceChangePercentage24h >= 0
                                ? "badge--positive"
                                : "badge--negative"
                            }`}
                          >
                            {asset.priceChangePercentage24h >= 0 ? "+" : ""}
                            {asset.priceChangePercentage24h.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!assetData?.data?.listInvestmentAssetResponse || assetData.data.listInvestmentAssetResponse.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                          Chưa có tài sản nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="card">
            <div className="card__header">
              <h3 className="card__title">Giao dịch gần đây</h3>
              <button className="card__menu-btn">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="card__content">
              <div className="transactions-list">
                {weekData?.listBriefTransactionResponses?.slice(0, 3).map((t: { idTransaction: string; transactionName: string; transactionDate: string; amount: number }) => (
                  <div key={t.idTransaction} className="transaction">
                    <div className="transaction__icon">
                      <Wallet size={18} className="text-primary" />
                    </div>
                    <div className="transaction__details">
                      <span className="transaction__name">
                        {t.transactionName}
                      </span>
                      <span className="transaction__time">
                        {new Date(t.transactionDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <div
                      className={`transaction__amount ${
                        t.amount > 0 
                          ? "transaction__amount--positive"
                          : "transaction__amount--negative"
                      }`}
                    >
                      {formatVND(t.amount)}
                    </div>
                  </div>
                ))}
                 {(!weekData?.listBriefTransactionResponses || weekData.listBriefTransactionResponses.length === 0) && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        Chưa có giao dịch nào
                      </div>
                    )}
              </div>
              <Link href="/dashboard/wallet">
                <button className="btn btn--outline btn--full">
                  Xem tất cả
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
