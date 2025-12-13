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
  Coins,
  Search,
  FileX2,
  Download,
  Loader2,
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

  if (loading) {
    return (
      <div className="p-4 border rounded-xl animate-pulse bg-slate-100 h-80 flex flex-col gap-4">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="flex-1 bg-slate-200 rounded"></div>
        <div className="flex-1 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-dashed border-slate-300 rounded-xl bg-slate-50 h-80 flex flex-col items-center justify-center text-slate-500 gap-3 animate-in fade-in duration-500">
        <div className="p-3 bg-slate-100 rounded-full">
          <FileX2 size={32} className="opacity-50" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs mt-1">Không có dữ liệu giao dịch</p>
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
          <span className="truncate max-w-[65%] text-slate-600">
            {item.transactionName}
          </span>
          <span
            className={`font-medium ${
              item.transactionType === "Thu"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(item.amount)}
          </span>
        </>
      );
    } else {
      return (
        <>
          <span className="truncate max-w-[65%] text-slate-600">
            {item.type} (SL: {item.quantity})
          </span>
          <span className="font-medium text-slate-800">
            {formatCurrency(item.price)}
          </span>
        </>
      );
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl shadow-sm flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
        <h3 className="font-bold text-slate-700">{title}</h3>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        <div className="p-3 rounded-lg border border-emerald-100 ">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              {incomeLabel}
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 break-all">
            {formatCurrency(incomeValue)}
          </div>
          <div className="mt-3">
            <button
              onClick={() => setExpandIncome(!expandIncome)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors w-full"
            >
              {expandIncome ? "Thu gọn" : "Xem chi tiết"} <Info size={14} />
            </button>
            {expandIncome && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {incomeDetails.length > 0 ? (
                  incomeDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs border-b border-slate-100 pb-1 last:border-0"
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

        <div className="p-3 rounded-lg border border-red-100 ">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              {expenseLabel}
            </span>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-700 break-all">
            {formatCurrency(expenseValue)}
          </div>
          <div className="mt-3">
            <button
              onClick={() => setExpandExpense(!expandExpense)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors w-full"
            >
              {expandExpense ? "Thu gọn" : "Xem chi tiết"} <Info size={14} />
            </button>
            {expandExpense && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {expenseDetails.length > 0 ? (
                  expenseDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs border-b border-slate-100 pb-1 last:border-0"
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

      <div className="p-4 border-t border-slate-100 rounded-b-xl">
        <p className="text-xs mb-1">Chênh lệch</p>
        <p
          className={`text-lg font-bold ${
            spread >= 0 ? "text-slate-800" : "text-red-500"
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

  // SỬA: Dùng Generic Type <T> thay vì any
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
        // TypeScript sẽ tự hiểu res là ApiResponse<TransactionCompareData>
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
        // TypeScript sẽ tự hiểu res là ApiResponse<InvestmentCompareData>
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

      // SỬA: Thay 'any' bằng 'unknown' để an toàn hơn khi ép kiểu
      getInvesmentAsset(userId).then(async (res: unknown) => {
        // Ép kiểu res (từ unknown) về ApiResponse chuẩn
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
      className="w-full space-y-8 pb-10 px-4 sm:px-6 lg:px-8 bg-background"
    >
      {/* LỊCH SỬ GIAO DỊCH */}
      <section className=" rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold ">Chi tiết dòng tiền</h2>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-left text-xs font-semibold uppercase w-[35%]">
                  Tên giao dịch
                </th>
                <th className="pb-3 text-left text-xs font-semibold uppercase w-[15%]">
                  Loại
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase w-[25%]">
                  Số tiền
                </th>
                <th className="pb-3 text-right text-xs font-semibold uppercase w-[25%]">
                  Thời điểm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {historyList.map((item) => (
                <tr
                  key={item.idTransaction}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 text-sm font-medium text-slate-700 truncate pr-2">
                    {item.transactionName}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.transactionType === "Thu"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.transactionType}
                    </span>
                  </td>
                  <td
                    className={`py-4 text-sm font-bold text-right ${
                      item.transactionType === "Thu"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.transactionType === "Chi" && "-"}
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-4 text-sm text-slate-500 text-right">
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
        <h2 className="text-2xl font-bold ">So sánh</h2>

        {/* Controls */}
        <div
          data-html2canvas-ignore
          className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between p-4 rounded-xl  shadow-sm"
        >
          <div className="flex flex-wrap gap-2 items-center">
            <div className=" p-1 rounded-lg flex items-center">
              <button
                onClick={() => setCompareMode("transaction")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  compareMode === "transaction"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Theo thu chi
              </button>
              <button
                onClick={() => setCompareMode("investment")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  compareMode === "investment"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Theo đầu tư
              </button>
            </div>

            {compareMode === "investment" && (
              <div className="relative">
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="appearance-none text-slate-700 py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 h-[40px]"
                >
                  {assets.map((asset) => (
                    <option key={asset.idAsset} value={asset.idAsset}>
                      {asset.assetName} ({asset.assetSymbol.toUpperCase()})
                    </option>
                  ))}
                </select>
                <Coins className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full xl:w-auto">
            <button
              onClick={() =>
                setTimeRange(timeRange === "month" ? "year" : "month")
              }
              className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 h-[40px]"
            >
              {timeRange === "month" ? "Tháng" : "Năm"} <Filter size={14} />
            </button>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm  h-[40px]">
              <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">
                Kỳ 1:
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={p1Month}
                onChange={(e) => setP1Month(Number(e.target.value))}
                className={`bg-transparent w-16 text-center focus:outline-none font-bold ${
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
                className="bg-transparent w-24 text-center focus:outline-none font-bold"
                placeholder="YYYY"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm  h-[40px]">
              <span className="text-slate-500 text-xs font-semibold whitespace-nowrap">
                Kỳ 2:
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={p2Month}
                onChange={(e) => setP2Month(Number(e.target.value))}
                className={`bg-transparent w-16 text-center focus:outline-none font-bold ${
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
                className="bg-transparent w-24 text-center focus:outline-none font-bold"
                placeholder="YYYY"
              />
            </div>

            <button
              onClick={handleCompare}
              disabled={compareLoading}
              className="ml-auto xl:ml-2 bg-slate-900 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all h-[40px] disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {compareLoading ? "Đang tải..." : "So sánh"}
              {!compareLoading && <Search size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[300px]">
          {compareLoading && currentData && (
            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm rounded-2xl">
              <div className="px-4 py-2 rounded-full shadow-lg border text-sm font-medium animate-bounce flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-900 rounded-full animate-ping"></div>
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
