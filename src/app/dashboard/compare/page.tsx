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
      <div className="p-4 border border-gray-800 rounded-xl animate-pulse bg-[#111318] h-80 flex flex-col gap-4">
        <div className="h-6 bg-gray-800 rounded w-1/3"></div>
        <div className="flex-1 bg-gray-800/50 rounded"></div>
        <div className="flex-1 bg-gray-800/50 rounded"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-gray-800 rounded-2xl bg-[#111318] flex flex-col items-center justify-center text-gray-400 gap-4 p-8 animate-in fade-in duration-500 shadow-xl">
        <div className="p-4 bg-gray-800/50 rounded-full">
          <FileX2 size={40} className="text-gray-500 opacity-80" />
        </div>
        <div className="text-center">
          <p className="font-bold text-base text-gray-300">{title}</p>
          <p className="text-sm mt-1">Không có dữ liệu</p>
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
    <div className="border border-gray-800 rounded-2xl shadow-xl flex flex-col h-full animate-in fade-in duration-300 bg-[#111318]">
      <div className="p-4 sm:p-5 border-b border-gray-800 bg-[#111318] rounded-t-2xl">
        <h3 className="font-bold text-white text-lg">{title}</h3>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-4">
        <div className="p-4 rounded-xl bg-background/50 border border-gray-800/50 hover:border-emerald-500/20 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              {incomeLabel}
            </span>
            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-500 break-all mb-3">
            {formatCurrency(incomeValue)}
          </div>
          <div>
            <button
              onClick={() => setExpandIncome(!expandIncome)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-500 transition-colors w-full font-medium"
            >
              {expandIncome ? "Thu gọn" : "Xem chi tiết"} <Info size={14} />
            </button>
            {expandIncome && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {incomeDetails.length > 0 ? (
                  incomeDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs border-b border-gray-800 pb-2 last:border-0 last:pb-0"
                    >
                      {renderDetailItem(item)}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic text-center py-2">
                    Không có dữ liệu
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-background/50 border border-gray-800/50 hover:border-red-500/20 transition-colors">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
              {expenseLabel}
            </span>
            <div className="p-1.5 bg-red-500/10 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-500 break-all mb-3">
            {formatCurrency(expenseValue)}
          </div>
          <div>
            <button
              onClick={() => setExpandExpense(!expandExpense)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors w-full font-medium"
            >
              {expandExpense ? "Thu gọn" : "Xem chi tiết"} <Info size={14} />
            </button>
            {expandExpense && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {expenseDetails.length > 0 ? (
                  expenseDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs border-b border-gray-800 pb-2 last:border-0 last:pb-0"
                    >
                      {renderDetailItem(item)}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic text-center py-2">
                    Không có dữ liệu
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 border-t border-gray-800 rounded-b-2xl bg-[#111318]/50">
        <p className="text-xs font-medium text-gray-400 mb-1">Chênh lệch</p>
        <p
          className={`text-xl font-bold ${
            spread >= 0 ? "text-white" : "text-red-500"
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
    compareInvetmenstsByYear, // Giữ nguyên chính tả từ hook
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
        // --- XỬ LÝ SO SÁNH ĐẦU TƯ ---
        if (!selectedAssetId) {
          console.warn("Chưa chọn tài sản đầu tư.");
          // Nếu danh sách tài sản không rỗng mà vẫn chưa chọn được ID, hãy thử set lại cái đầu tiên
          if (assets.length > 0) {
            setSelectedAssetId(assets[0].idAsset);
            // Sau khi set state, lần render sau sẽ gọi lại API nhờ useEffect
            return;
          }
          // Nếu danh sách rỗng thật sự thì reset data
          setInvestmentData(null);
          return;
        }

        console.log("Đang gọi API Investment với Asset ID:", selectedAssetId);

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
    assets,
    compareTransactionsByMonth,
    compareTransactionsByYear,
    compareInvestmentsByMonth,
    compareInvetmenstsByYear,
  ]);

  // --- TRIGGER TỰ ĐỘNG GỌI API KHI CHỌN ASSET KHÁC ---
  useEffect(() => {
    if (compareMode === "investment" && userId && selectedAssetId) {
      handleCompare();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssetId, compareMode]); // Thêm compareMode để khi switch tab cũng gọi

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

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    const initialFetch = async () => {
      if (!userId) return;

      // 1. Lấy lịch sử giao dịch
      HisotryTransaction(userId).then(
        (res: ApiResponse<TransactionDetail[]>) => {
          if (res.success) setHistoryList(res.data);
        }
      );

      // 2. Lấy danh sách tài sản (SỬA LOGIC GỘP API)
      getInvesmentAsset(userId).then(async (res: any) => {
        // Dữ liệu API trả về là Object { listInvestmentAssetResponse: [], sjcGoldResponse: [] }
        if (res.success && res.data) {
          const cryptoList = res.data.listInvestmentAssetResponse || [];
          // Map dữ liệu vàng cho khớp với interface InvestmentAsset
          const goldList = (res.data.sjcGoldResponse || []).map(
            (gold: any) => ({
              idAsset: gold.idAsset,
              assetName: gold.name,
              assetSymbol: "GOLD " + gold.type,
            })
          );

          // Gộp 2 mảng lại
          const combinedAssets = [...cryptoList, ...goldList];
          setAssets(combinedAssets);

          console.log("Assets loaded:", combinedAssets);

          // Nếu có tài sản, chọn mặc định cái đầu tiên và gọi API so sánh ngay
          if (combinedAssets.length > 0) {
            const defaultAssetId = combinedAssets[0].idAsset;
            if (!selectedAssetId) setSelectedAssetId(defaultAssetId);

            // Gọi song song 2 API để init data
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
                idAsset: selectedAssetId || defaultAssetId,
              }),
            ]);

            setTransactionData(processResponse(transRes));
            setInvestmentData(processResponse(investRes));
          } else {
            // Trường hợp không có tài sản nào, chỉ gọi Transaction
            const transRes = await compareTransactionsByMonth({
              firstMonth: p1Month,
              firstYear: p1Year,
              secondMonth: p2Month,
              secondYear: p2Year,
              idUser: userId,
            });
            setTransactionData(processResponse(transRes));
          }
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
      className="w-full space-y-8 pb-10 px-4 sm:px-6 lg:px-8 bg-background"
    >
      {/* LỊCH SỬ GIAO DỊCH */}
      <section className="bg-background rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6 pl-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
            Chi tiết dòng tiền
          </h2>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#111318] border border-gray-800 text-xs font-bold rounded-xl hover:bg-gray-800 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            {isExporting ? (
              <>
                <Loader2 size={14} className="animate-spin text-primary" />
                Đang xuất...
              </>
            ) : (
              <>
                <Download size={14} className="text-primary" />
                Xuất file PDF
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-fixed">
            <thead className="bg-[#111318]">
              <tr className="border-b border-gray-800">
                <th className="py-4 pl-4 text-left text-xs font-bold text-gray-400 uppercase w-[35%] rounded-tl-xl">
                  Tên giao dịch
                </th>
                <th className="py-4 text-left text-xs font-bold text-gray-400 uppercase w-[15%]">
                  Loại
                </th>
                <th className="py-4 text-right text-xs font-bold text-gray-400 uppercase w-[25%]">
                  Số tiền
                </th>
                <th className="py-4 pr-4 text-right text-xs font-bold text-gray-400 uppercase w-[25%] rounded-tr-xl">
                  Thời điểm
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-[#111318]/50">
              {historyList.map((item) => (
                <tr
                  key={item.idTransaction}
                  className="group hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 pl-4 text-sm font-medium text-white truncate pr-2">
                    {item.transactionName}
                  </td>
                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.transactionType === "Thu"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {item.transactionType}
                    </span>
                  </td>
                  <td
                    className={`py-4 text-sm font-bold text-right ${
                      item.transactionType === "Thu"
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  >
                    {item.transactionType === "Chi" && "-"}
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-400 text-right">
                    {new Date(item.transactionDate).toLocaleDateString("vi-VN")}
                  </td>
                </tr>
              ))}
              {historyList.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-gray-500 text-sm font-medium"
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
        <h2 className="text-2xl font-bold flex items-center gap-2 pl-2">
          <span className="w-1.5 h-7 bg-linear-to-b from-primary to-emerald-500 rounded-full inline-block"></span>
          So sánh hiệu quả
        </h2>

        {/* Controls */}
        <div
          data-html2canvas-ignore
          className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between p-4 rounded-2xl shadow-xl bg-[#111318] border border-gray-800"
        >
          <div className="flex flex-wrap gap-2 items-center">
            <div className="p-1 sm:p-2 rounded-xl flex items-center bg-[#111318] border border-gray-800">
              <button
                onClick={() => setCompareMode("transaction")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  compareMode === "transaction"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Theo thu chi
              </button>
              <button
                onClick={() => setCompareMode("investment")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  compareMode === "investment"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-gray-400 hover:text-white"
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
                  className="appearance-none cursor-pointer text-white bg-[#111318] border border-gray-800 hover:border-gray-700 py-2 pl-4 pr-10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 h-[40px] transition-all min-w-[200px]"
                >
                  {assets.map((asset) => (
                    <option key={asset.idAsset} value={asset.idAsset}>
                      {asset.assetName} ({asset.assetSymbol.toUpperCase()})
                    </option>
                  ))}
                  {assets.length === 0 && (
                    <option value="" disabled>
                      Không có tài sản
                    </option>
                  )}
                </select>
                <Coins className="absolute right-3 top-3 h-4 w-4 text-primary pointer-events-none" />
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
                className="bg-[#111318] border border-gray-800 hover:border-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 h-[40px] transition-all"
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
                    className={`w-full text-left px-4 py-2 text-sm ${
                      timeRange === "month"
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-gray-800 text-gray-300"
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
                    className={`w-full text-left px-4 py-2 text-sm ${
                      timeRange === "year"
                        ? "bg-primary/10 text-primary font-bold"
                        : "hover:bg-gray-800 text-gray-300"
                    }`}
                  >
                    Năm
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm h-[40px] bg-[#111318] border border-gray-800">
              <span className="text-gray-400 text-xs font-semibold whitespace-nowrap">
                Kỳ 1:
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={p1Month}
                onChange={(e) => setP1Month(Number(e.target.value))}
                className={`bg-transparent w-12 text-center focus:outline-none font-bold text-white ${
                  timeRange === "year" ? "hidden" : ""
                }`}
                placeholder="MM"
              />
              {timeRange === "month" && (
                <span className="text-gray-600">/</span>
              )}
              <input
                type="number"
                value={p1Year}
                onChange={(e) => setP1Year(Number(e.target.value))}
                className="bg-transparent w-16 text-center focus:outline-none font-bold text-white"
                placeholder="YYYY"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm h-[40px] bg-[#111318] border border-gray-800">
              <span className="text-gray-400 text-xs font-semibold whitespace-nowrap">
                Kỳ 2:
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={p2Month}
                onChange={(e) => setP2Month(Number(e.target.value))}
                className={`bg-transparent w-12 text-center focus:outline-none font-bold text-white ${
                  timeRange === "year" ? "hidden" : ""
                }`}
                placeholder="MM"
              />
              {timeRange === "month" && (
                <span className="text-gray-600">/</span>
              )}
              <input
                type="number"
                value={p2Year}
                onChange={(e) => setP2Year(Number(e.target.value))}
                className="bg-transparent w-16 text-center focus:outline-none font-bold text-white"
                placeholder="YYYY"
              />
            </div>

            <button
              onClick={handleCompare}
              disabled={compareLoading}
              className="ml-auto xl:ml-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all h-[40px] shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {compareLoading ? "Đang tải..." : "So sánh"}
              {!compareLoading && <Search size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[300px]">
          {compareLoading && currentData && (
            <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm rounded-2xl">
              <div className="px-4 py-2 rounded-full shadow-lg border border-gray-800 bg-[#111318] text-sm font-medium animate-bounce flex items-center gap-2 text-white">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
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
