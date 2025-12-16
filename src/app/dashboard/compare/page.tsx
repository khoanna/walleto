"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useUserContext } from "@/context";
import useCompare from "@/services/useCompare";
import useDashboard from "@/services/useDashboard";

import { toPng } from "html-to-image";
import jsPDF from "jspdf";

import {
  TrendingUp,
  TrendingDown,
  Info,
  Filter,
  Search,
  FileX2,
  Download,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";

import {
  TransactionDetail,
  InvestmentDetail,
  TransactionSummary,
  InvestmentSummary,
  InvestmentAsset,
  TransactionCompareData,
  InvestmentCompareData,
  ApiResponse,
} from "@/type/CompareTypes";

// --- HELPER FUNCTIONS ---
const formatCurrency = (amount: number) => {
  const safeAmount = amount && !Number.isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(safeAmount);
};

// Component con: Card So sánh
interface ComparisonCardProps {
  data: TransactionSummary | InvestmentSummary | undefined | null;
  type: "transaction" | "investment";
  title: string;
  loading: boolean;
}

const ComparisonCard = ({
  data,
  type,
  title,
  loading,
}: ComparisonCardProps) => {
  const [expandIncome, setExpandIncome] = useState(false);
  const [expandExpense, setExpandExpense] = useState(false);

  // Loading State
  if (loading) {
    return (
      <div className="p-4 border border-slate-100 dark:border-navy-border rounded-2xl animate-pulse bg-white dark:bg-navy-800 h-80 flex flex-col gap-4 shadow-sm">
        <div className="h-6 bg-slate-200 dark:bg-navy-700 rounded w-1/3"></div>
        <div className="flex-1 bg-slate-200 dark:bg-navy-700 rounded"></div>
        <div className="flex-1 bg-slate-200 dark:bg-navy-700 rounded"></div>
      </div>
    );
  }

  // Empty State
  if (!data) {
    return (
      <div className="border border-dashed border-foreground rounded-xl bg-foreground h-80 flex flex-col items-center justify-center text-text gap-3 animate-in fade-in duration-500">
        <div className="p-3 bg-slate-100 rounded-full">
          <FileX2 size={32} className="opacity-50" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm text-slate-700 dark:text-white">
            {title}
          </p>
          <p className="text-xs mt-1">Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  let incomeLabel = "";
  let expenseLabel = "";
  let incomeValue = 0;
  let expenseValue = 0;
  let incomeDetails: (TransactionDetail | InvestmentDetail)[] = [];
  let expenseDetails: (TransactionDetail | InvestmentDetail)[] = [];
  let spread = 0;

  if (type === "transaction") {
    const transData = data as TransactionSummary;
    incomeLabel = "Tổng thu";
    expenseLabel = "Tổng chi";
    incomeValue = transData.totalIncome;
    expenseValue = transData.totalExpense;
    incomeDetails = transData.transactionIncomeDetails;
    expenseDetails = transData.transactionExpenseDetails;
    spread =
      transData.spreadIncomeAndExpenseByMonth ??
      transData.spreadIncomeAndExpenseByYear ??
      0;
  } else {
    const investData = data as InvestmentSummary;
    incomeLabel = "Tổng mua";
    expenseLabel = "Tổng bán";
    incomeValue = investData.totalBuy;
    expenseValue = investData.totalSell;
    incomeDetails = investData.investmentDetailBuyDetails;
    expenseDetails = investData.investmentDetailSellDetails;
    spread =
      investData.spreadBuyAndSellByMonth ??
      investData.spreadBuyAndSellByYear ??
      0;
  }

  if (Number.isNaN(incomeValue)) incomeValue = 0;
  if (Number.isNaN(expenseValue)) expenseValue = 0;
  if (Number.isNaN(spread)) spread = 0;

  const renderDetailItem = (item: TransactionDetail | InvestmentDetail) => {
    if ("transactionName" in item) {
      return (
        <>
          <span className="truncate max-w-[65%] text-slate-600 dark:text-slate-400">
            {item.transactionName}
          </span>
          <span
            className={`font-medium ${
              item.transactionType === "Thu"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(item.amount)}
          </span>
        </>
      );
    } else {
      return (
        <>
          <span className="truncate max-w-[65%] text-slate-600 dark:text-slate-400">
            {item.type} (SL: {item.quantity})
          </span>
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {formatCurrency(item.price)}
          </span>
        </>
      );
    }
  };

  return (
    <div className="border border-foreground rounded-xl shadow-sm flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-4 border-b border-foreground bg-background rounded-t-xl">
        <h3 className="font-bold text-text">{title}</h3>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        <div className="p-3 rounded-lg ">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {incomeLabel}
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 break-all">
            {formatCurrency(incomeValue)}
          </div>
          <div className="mt-3">
            <button
              onClick={() => setExpandIncome(!expandIncome)}
              className="flex items-center gap-1 text-xs text-text hover:text-emerald-600 transition-colors w-full"
            >
              {expandIncome ? "Thu gọn" : "Xem chi tiết"} <Info size={14} />
            </button>
            {expandIncome && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 nice-scroll">
                {incomeDetails.length > 0 ? (
                  incomeDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs border-b border-foreground pb-1 last:border-0"
                    >
                      {renderDetailItem(item)}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Không có dữ liệu
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-3 rounded-lg ">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
              {expenseLabel}
            </span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400 break-all">
            {formatCurrency(expenseValue)}
          </div>
          <div className="mt-3">
            <button
              onClick={() => setExpandExpense(!expandExpense)}
              className="flex items-center gap-1 text-xs text-text hover:text-red-600 transition-colors w-full"
            >
              {expandExpense ? "Thu gọn" : "Xem chi tiết"} <Info size={14} />
            </button>
            {expandExpense && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 nice-scroll">
                {expenseDetails.length > 0 ? (
                  expenseDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs border-b border-foreground pb-1 last:border-0"
                    >
                      {renderDetailItem(item)}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Không có dữ liệu
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-foreground rounded-b-xl">
        <p className="text-xs mb-1">Chênh lệch</p>
        <p
          className={`text-lg font-bold ${
            spread >= 0
              ? "text-slate-800 dark:text-white"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {formatCurrency(spread)}
        </p>
      </div>
    </div>
  );
};

export default function Compare() {
  const userContext = useUserContext();
  const user = userContext?.user;
  const userId = user?.idUser;

  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { getInvesmentAsset } = useDashboard();
  const {
    HisotryTransaction,
    compareTransactionsByMonth,
    compareTransactionsByYear,
    compareInvestmentsByMonth,
    compareInvetmenstsByYear,
    compareLoading,
  } = useCompare();

  const [historyList, setHistoryList] = useState<TransactionDetail[]>([]);
  const [transactionData, setTransactionData] =
    useState<TransactionCompareData | null>(null);
  const [investmentData, setInvestmentData] =
    useState<InvestmentCompareData | null>(null);

  const [compareMode, setCompareMode] = useState<"transaction" | "investment">(
    "transaction"
  );
  const [timeRange, setTimeRange] = useState<"month" | "year">("month");
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  const timeRangeRef = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const [p1Month, setP1Month] = useState(now.getMonth() + 1);
  const [p1Year, setP1Year] = useState(now.getFullYear());
  const [p2Month, setP2Month] = useState(
    now.getMonth() === 0 ? 12 : now.getMonth()
  );
  const [p2Year, setP2Year] = useState(
    now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  );

  const [assets, setAssets] = useState<InvestmentAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.idAsset === selectedAssetId),
    [assets, selectedAssetId]
  );

  const processResponse = <T,>(
    res: ApiResponse<T> | undefined | void
  ): T | null => {
    if (res && res.success) return res.data;
    if (res && res.statusCode === 404) return null;
    return null;
  };

  const handleCompare = useCallback(async () => {
    if (!userId) return;

    try {
      let res;
      if (compareMode === "transaction") {
        if (timeRange === "month") {
          res = await compareTransactionsByMonth({
            firstMonth: p1Month,
            firstYear: p1Year,
            secondMonth: p2Month,
            secondYear: p2Year,
            idUser: userId,
          });
        } else {
          res = await compareTransactionsByYear({
            year1: p1Year,
            year2: p2Year,
            idUser: userId,
          });
        }
        setTransactionData(processResponse(res));
      } else {
        if (!selectedAssetId) return;
        if (timeRange === "month") {
          res = await compareInvestmentsByMonth({
            firstMonth: p1Month,
            firstYear: p1Year,
            secondMonth: p2Month,
            secondYear: p2Year,
            idUser: userId,
            idAsset: selectedAssetId,
          });
        } else {
          res = await compareInvetmenstsByYear({
            year1: p1Year,
            year2: p2Year,
            idUser: userId,
            idAsset: selectedAssetId,
          });
        }
        setInvestmentData(processResponse(res));
      }
    } catch (error) {
      console.error("Error fetching comparison:", error);
      if (compareMode === "transaction") setTransactionData(null);
      else setInvestmentData(null);
    }
  }, [
    userId,
    compareMode,
    timeRange,
    p1Month,
    p1Year,
    p2Month,
    p2Year,
    selectedAssetId,
    compareTransactionsByMonth,
    compareTransactionsByYear,
    compareInvestmentsByMonth,
    compareInvetmenstsByYear,
  ]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(contentRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(
        `Bao_cao_tai_chinh_${now
          .toLocaleDateString("vi-VN")
          .replace(/\//g, "-")}.pdf`
      );
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      alert("Có lỗi khi xuất file PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const initialFetch = async () => {
      if (!userId) return;

      HisotryTransaction(userId).then(
        (res: ApiResponse<TransactionDetail[]>) => {
          if (res.success) setHistoryList(res.data);
        }
      );

      getInvesmentAsset(userId).then(async (res: unknown) => {
        const typedRes = res as ApiResponse<InvestmentAsset[]>;
        if (typedRes.success && typedRes.data.length > 0) {
          const assetList = typedRes.data;
          setAssets(assetList);

          const defaultAssetId = assetList[0].idAsset;
          if (!selectedAssetId) setSelectedAssetId(defaultAssetId);

          const [transRes, investRes] = await Promise.all([
            compareTransactionsByMonth({
              firstMonth: p1Month,
              firstYear: p1Year,
              secondMonth: p2Month,
              secondYear: p2Year,
              idUser: userId,
            }),
            compareInvestmentsByMonth({
              firstMonth: p1Month,
              firstYear: p1Year,
              secondMonth: p2Month,
              secondYear: p2Year,
              idUser: userId,
              idAsset: defaultAssetId,
            }),
          ]);

          setTransactionData(processResponse(transRes));
          setInvestmentData(processResponse(investRes));
        } else {
          const transRes = await compareTransactionsByMonth({
            firstMonth: p1Month,
            firstYear: p1Year,
            secondMonth: p2Month,
            secondYear: p2Year,
            idUser: userId,
          });
          setTransactionData(processResponse(transRes));
        }
      });
    };

    initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close timeRange dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!timeRangeRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!timeRangeRef.current.contains(e.target)) {
        setTimeRangeOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTimeRangeOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const currentData = useMemo(() => {
    return compareMode === "transaction" ? transactionData : investmentData;
  }, [compareMode, transactionData, investmentData]);

  const card1Data = useMemo(() => {
    if (!currentData) return null;
    if (timeRange === "month") {
      if ("month1Summary" in currentData) return currentData.month1Summary;
    } else {
      if ("year1Summary" in currentData) return currentData.year1Summary;
    }
    return null;
  }, [currentData, timeRange]);

  const card2Data = useMemo(() => {
    if (!currentData) return null;
    if (timeRange === "month") {
      if ("month2Summary" in currentData) return currentData.month2Summary;
    } else {
      if ("year2Summary" in currentData) return currentData.year2Summary;
    }
    return null;
  }, [currentData, timeRange]);

  return (
    <div
      ref={contentRef}
      className="w-full space-y-8 pb-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-white transition-colors duration-300 min-h-screen"
    >
      {/* LỊCH SỬ GIAO DỊCH */}

      <section className=" rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Chi tiết dòng tiền
          </h2>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-navy-700 text-slate-700 dark:text-white text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-navy-700/80 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download size={14} />
                Xuất file PDF
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto nice-scroll pb-2">
          <table className="w-full min-w-[800px] table-fixed">
            <thead>
              <tr className="border-b border-foreground">
                <th className="pb-3 text-left text-xs font-semibold uppercase w-[35%]">
                  Tên giao dịch
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase w-[15%] text-slate-500 dark:text-slate-400">
                  Loại
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase w-[25%] text-slate-500 dark:text-slate-400">
                  Số tiền
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase w-[25%] text-slate-500 dark:text-slate-400">
                  Thời điểm
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-foreground">
              {historyList.map((item) => (
                <tr
                  key={item.idTransaction}
                  className="group hover:bg-foreground/10 transition-colors"
                >
                  <td className="py-4 text-sm font-medium text-text truncate pr-2">
                    {item.transactionName}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.transactionType === "Thu"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400"
                          : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"
                      }`}
                    >
                      {item.transactionType}
                    </span>
                  </td>
                  <td
                    className={`py-4 text-sm font-bold text-right ${
                      item.transactionType === "Thu"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.transactionType === "Chi" && "-"}
                    {formatCurrency(item.amount)}
                  </td>

                  <td className="py-4 text-sm text-text text-right">
                    {new Date(item.transactionDate).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-400 text-sm"
                  >
                    Chưa có giao dịch nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* SO SÁNH */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          So sánh
        </h2>

        {/* Controls */}
        <div
          data-html2canvas-ignore
          className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between p-4 rounded-2xl shadow-sm bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-border"
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Chuyển đổi Mode: Sử dụng navy-700 cho nền chứa */}
            <div className="p-1 rounded-xl flex items-center bg-slate-100 dark:bg-navy-700">
              <button
                onClick={() => setCompareMode("transaction")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  compareMode === "transaction"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-text hover:text-slate-700"
                }`}
              >
                Theo thu chi
              </button>
              <button
                onClick={() => setCompareMode("investment")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  compareMode === "investment"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-text hover:text-slate-700"
                }`}
              >
                Theo đầu tư
              </button>
            </div>

            {/* Custom Asset Selector: Sử dụng navy-700 cho nút bấm */}
            {compareMode === "investment" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                  className="appearance-none cursor-pointer text-text py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 h-[40px] flex items-center justify-between w-full border border-slate-200 dark:border-navy-600 bg-white dark:bg-navy-800"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {selectedAsset ? (
                      <>
                        <img
                          src={selectedAsset.url}
                          alt={selectedAsset.assetSymbol}
                          className="w-5 h-5 rounded-full object-cover bg-white"
                        />
                        <span className="truncate font-medium">
                          {selectedAsset.assetName}
                        </span>
                        <span className="text-xs text-slate-400 uppercase">
                          {selectedAsset.assetSymbol}
                        </span>
                      </>
                    ) : (
                      <span>Chọn tài sản</span>
                    )}
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Danh sách thả xuống: Nền navy-800, hover navy-700 */}
                {isAssetDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsAssetDropdownOpen(false)}
                    ></div>
                    <div className="absolute top-full mt-2 left-0 w-full min-w-[220px] bg-white dark:bg-navy-800 border border-slate-100 dark:border-navy-border rounded-xl shadow-xl z-20 max-h-[300px] overflow-y-auto nice-scroll py-1 animate-in fade-in zoom-in-95 duration-200">
                      {assets.map((asset) => (
                        <button
                          key={asset.idAsset}
                          onClick={() => {
                            setSelectedAssetId(asset.idAsset);
                            setIsAssetDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-navy-700 transition-colors ${
                            selectedAssetId === asset.idAsset
                              ? "bg-slate-50 dark:bg-navy-700"
                              : ""
                          }`}
                        >
                          <img
                            src={asset.url}
                            alt={asset.assetSymbol}
                            className="w-6 h-6 rounded-full object-cover bg-white shadow-sm"
                          />
                          <div className="flex flex-col leading-none">
                            <span className="text-sm font-medium text-slate-700 dark:text-white">
                              {asset.assetName}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase mt-1">
                              {asset.assetSymbol}
                            </span>
                          </div>
                          {selectedAssetId === asset.idAsset && (
                            <Check
                              size={14}
                              className="ml-auto text-emerald-500"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
            <div className="relative" ref={timeRangeRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={timeRangeOpen}
                onClick={() => setTimeRangeOpen((s) => !s)}
                className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-[40px]"
              >
                <span className="truncate">
                  {timeRange === "month" ? "Tháng" : "Năm"}
                </span>
                <Filter size={14} />
                <svg
                  className={`w-3 h-3 transition-transform ${
                    timeRangeOpen ? "rotate-180" : "rotate-0"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {timeRangeOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-background border border-foreground rounded-lg shadow-lg z-50 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTimeRange("month");
                      setTimeRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      timeRange === "month"
                        ? "bg-foreground/5 font-semibold"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    Tháng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeRange("year");
                      setTimeRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      timeRange === "year"
                        ? "bg-foreground/5 font-semibold"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    Năm
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm  h-[40px]">
              <span className="text-text text-xs font-semibold whitespace-nowrap">
                Kỳ 1:
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={p1Month}
                onChange={(e) => setP1Month(Number(e.target.value))}
                className={`bg-transparent w-10 text-center focus:outline-none font-bold text-slate-700 dark:text-white ${
                  timeRange === "year" ? "hidden" : ""
                }`}
                placeholder="MM"
              />
              {timeRange === "month" && (
                <span className="text-slate-400">/</span>
              )}
              <input
                type="number"
                value={p1Year}
                onChange={(e) => setP1Year(Number(e.target.value))}
                className="bg-transparent w-14 text-center focus:outline-none font-bold text-slate-700 dark:text-white"
                placeholder="YYYY"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm  h-[40px]">
              <span className="text-text text-xs font-semibold whitespace-nowrap">
                Kỳ 2:
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={p2Month}
                onChange={(e) => setP2Month(Number(e.target.value))}
                className={`bg-transparent w-10 text-center focus:outline-none font-bold text-slate-700 dark:text-white ${
                  timeRange === "year" ? "hidden" : ""
                }`}
                placeholder="MM"
              />
              {timeRange === "month" && (
                <span className="text-slate-400">/</span>
              )}
              <input
                type="number"
                value={p2Year}
                onChange={(e) => setP2Year(Number(e.target.value))}
                className="bg-transparent w-14 text-center focus:outline-none font-bold text-slate-700 dark:text-white"
                placeholder="YYYY"
              />
            </div>

            <button
              onClick={handleCompare}
              disabled={compareLoading}
              className="ml-auto xl:ml-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-700 dark:hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all h-[40px] disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
            >
              {compareLoading ? "Đang tải..." : "So sánh"}
              {!compareLoading && <Search size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[300px]">
          {compareLoading && currentData && (
            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] bg-white/50 dark:bg-navy-900/50 rounded-2xl">
              <div className="px-4 py-2 rounded-full shadow-lg border border-slate-100 dark:border-white/10 bg-white dark:bg-navy-800 text-slate-900 dark:text-white text-sm font-medium animate-bounce flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-900 dark:bg-blue-500 rounded-full animate-ping"></div>
                Đang cập nhật...
              </div>
            </div>
          )}

          <ComparisonCard
            title={
              timeRange === "month"
                ? `Tháng ${p1Month}, năm ${p1Year}`
                : `Năm ${p1Year}`
            }
            data={card1Data}
            type={compareMode}
            loading={compareLoading && !currentData}
          />

          <ComparisonCard
            title={
              timeRange === "month"
                ? `Tháng ${p2Month}, năm ${p2Year}`
                : `Năm ${p2Year}`
            }
            data={card2Data}
            type={compareMode}
            loading={compareLoading && !currentData}
          />
        </div>
      </section>
    </div>
  );
}
