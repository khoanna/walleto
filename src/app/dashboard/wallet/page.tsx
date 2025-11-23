"use client";

import React, {useEffect, useState, useMemo} from "react";
import dynamic from "next/dynamic";
import {Loader2, Edit2, Trash2, Plus, History, Wallet} from "lucide-react";
import type {ApexOptions} from "apexcharts";
import useTransaction from "@/services/useTransaction";
import useSaving from "@/services/useSaving";
import useBudget from "@/services/useBudget";
import {useUserContext} from "@/context";
import {ChartTransaction, Transaction} from "@/type/Transaction";
import {Saving} from "@/type/Saving";
import {Budget} from "@/type/useBudget";
import {TransactionFormData} from "@/type/TransactionForm";
import {BudgetFormData} from "@/type/BudgetForm";
import {SavingFormData} from "@/type/SavingForm";
import {SavingTransaction} from "@/type/SavingTransaction";
import AddEditTransactionModal from "@/components/wallet/AddEditTransactionModal";
import AddEditBudgetModal from "@/components/wallet/AddEditBudgetModal";
import AddEditSavingModal from "@/components/wallet/AddEditSavingModal";
import DeleteConfirmModal from "@/components/wallet/DeleteConfirmModal";
import AddSavingTransactionModal from "@/components/wallet/AddSavingTransactionModal";
import SavingTransactionHistoryModal from "@/components/wallet/SavingTransactionHistoryModal";
import useImgae from "@/services/useImage";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

const FinanceDashboard: React.FC = () => {
  const context = useUserContext();

  const {uploadImage} = useImgae();

  const {
    getListTransaction,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransaction();

  const {
    getListSaving,
    createSaving,
    deleteSaving,
    getListSavingTransactions,
    createSavingTransaction,
    deleteSavingTransaction,
  } = useSaving();

  const {getListBudgets, createBudget, deleteBudget} = useBudget();

  // State
  const [loading, setLoading] = useState(true);
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<ChartTransaction[]>([]);
  const [savingList, setSavingList] = useState<Saving[]>([]);
  const [budgetList, setBudgetList] = useState<Budget[]>([]);

  // Modal states
  const [transactionModal, setTransactionModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: null as Transaction | null,
  });
  const [budgetModal, setBudgetModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: null as Budget | null,
  });
  const [savingModal, setSavingModal] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit",
    data: null as Saving | null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "",
    id: "",
    name: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Saving transaction states
  const [savingTransactionModal, setSavingTransactionModal] = useState({
    isOpen: false,
    saving: null as Saving | null,
  });
  const [savingHistoryModal, setSavingHistoryModal] = useState({
    isOpen: false,
    saving: null as Saving | null,
    transactions: [] as SavingTransaction[],
  });
  const [savingTransactionsLoading, setSavingTransactionsLoading] =
    useState(false);

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [transactionsData, savingsData, budgetsData] = await Promise.all([
        getListTransaction(context?.user?.idUser),
        getListSaving(context?.user?.idUser),
        getListBudgets(context?.user?.idUser),
      ]);

      setTransactionList(transactionsData?.data?.expenseList || []);
      setChartData(transactionsData?.data?.chartList || []);
      setSavingList(savingsData?.data || []);
      setBudgetList(budgetsData?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (context?.user?.idUser) {
      fetchAllData();
    }
  }, [context?.user?.idUser]);

  // Transaction handlers
  const handleTransactionSubmit = async (data: TransactionFormData) => {
    if (!context?.user?.idUser) return;

    if (transactionModal.mode === "add") {
      await createTransaction({
        ...data,
        idUser: context.user.idUser,
      });
    } else if (transactionModal.data?.idTransaction) {
      await updateTransaction(
        {
          transactionName: data.transactionName,
          transactionType: data.transactionType,
          amount: data.amount,
          transactionCategory: data.transactionCategory,
          transactionDate: data.transactionDate,
          idUser: context.user.idUser,
        },
        transactionModal.data.idTransaction
      );
    }
    await fetchAllData();
  };

  // Budget handlers
  const handleBudgetSubmit = async (data: BudgetFormData) => {
    if (!context?.user?.idUser) return;

    await createBudget({
      budgetName: data.budgetName,
      budgetGoal: data.budgetGoal,
      urlImage: data.urlImage || "",
      idUser: context.user.idUser,
    });
    await fetchAllData();
  };

  // Saving handlers
  const handleSavingSubmit = async (data: SavingFormData) => {
    if (!context?.user?.idUser) return;

    await createSaving({
      savingName: data.savingName,
      targetAmount: data.targetAmount,
      targetDate: data.targetDate,
      description: data.description || "",
      urlImage: data.urlImage || "",
      idUser: context.user.idUser,
    });
    await fetchAllData();
  };

  // Delete handler
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      if (deleteModal.type === "transaction") {
        await deleteTransaction(deleteModal.id);
      } else if (deleteModal.type === "budget") {
        await deleteBudget(deleteModal.id);
      } else if (deleteModal.type === "saving") {
        await deleteSaving(deleteModal.id);
      }
      await fetchAllData();
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Có lỗi xảy ra khi xóa");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Saving transaction handlers
  const handleOpenSavingHistory = async (saving: Saving) => {
    setSavingTransactionsLoading(true);
    setSavingHistoryModal({isOpen: true, saving, transactions: []});

    try {
      const response = await getListSavingTransactions(saving.idSaving);
      setSavingHistoryModal((prev) => ({
        ...prev,
        transactions: response?.data || [],
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setSavingTransactionsLoading(false);
    }
  };

  const handleAddSavingTransaction = async (data: {amount: number}) => {
    if (!savingTransactionModal.saving) return;

    try {
      await createSavingTransaction({
        idSaving: savingTransactionModal.saving.idSaving,
        amount: data.amount,
      });

      // Refresh data
      await fetchAllData();

      // Close add modal and reopen history to show updated list
      setSavingTransactionModal({isOpen: false, saving: null});
      await handleOpenSavingHistory(savingTransactionModal.saving);
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  };

  const handleDeleteSavingTransaction = async (idSavingDetail: string) => {
    try {
      await deleteSavingTransaction(idSavingDetail);

      // Refresh both main data and transaction history
      await fetchAllData();

      if (savingHistoryModal.saving) {
        const response = await getListSavingTransactions(
          savingHistoryModal.saving.idSaving
        );
        setSavingHistoryModal((prev) => ({
          ...prev,
          transactions: response?.data || [],
        }));
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  };

  // Chart setup - styled like dashboard DonutChart
  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "donut",
        toolbar: {show: false},
        foreColor: "#94a3b8",
      },
      colors: [
        "#f59e0b",
        "#2ec4b6",
        "#9c27b0",
        "#ef4444",
        "#10b981",
        "#3b82f6",
      ],
      labels: chartData.map((item) => item.transactionCategory),
      stroke: {width: 0},
      dataLabels: {enabled: false},
      legend: {
        position: "bottom",
        fontSize: "11px",
        markers: {size: 8, offsetX: 0, offsetY: 0},
        itemMargin: {horizontal: 8, vertical: 3},
      },
      tooltip: {
        y: {formatter: (val: number) => `${val}%`},
      },
      grid: {padding: {top: 0, bottom: 0, left: 0, right: 0}},
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {height: 220},
            legend: {fontSize: "10px", itemMargin: {horizontal: 6, vertical: 2}},
          },
        },
        {
          breakpoint: 1024,
          options: {chart: {height: 240}, legend: {fontSize: "11px"}},
        },
      ],
    }),
    [chartData]
  );

  const chartSeries = chartData.map((item) => item.expensePercent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-text" size={48} />
      </div>
    );
  }

  return (
    <>
      <div className="h-screen overflow-y-auto nice-scroll p-2 sm:p-3 lg:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
          <div className="text-xl sm:text-2xl font-semibold m-auto md:m-0">Thống kê</div>
          <button
            onClick={() =>
              setTransactionModal({isOpen: true, mode: "add", data: null})
            }
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 
                     active:scale-95 transition-all font-medium text-xs sm:text-sm">
            <Plus className="w-4 h-4" /> Thêm giao dịch
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Transaction table */}
          <div className="lg:col-span-7 rounded-xl sm:rounded-2xl bg-background shadow-xl p-3 sm:p-4 lg:p-6 transition-all">
            <h2 className="text-xs sm:text-sm font-bold opacity-80 mb-3 sm:mb-4">
              Lịch sử tiêu tiền
            </h2>
            {transactionList.length > 0 ? (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-[var(--color-text)] border-b border-[var(--color-border)]/20">
                        <th className="text-left pb-2 sm:pb-3 px-2 sm:px-2 font-medium text-[10px] sm:text-xs lg:text-sm">
                          Tên giao dịch
                        </th>
                        <th className="text-center pb-2 sm:pb-3 px-1 sm:px-2 font-medium text-[10px] sm:text-xs lg:text-sm hidden sm:table-cell">
                          Loại
                        </th>
                        <th className="text-right pb-2 sm:pb-3 px-2 sm:px-2 font-medium text-[10px] sm:text-xs lg:text-sm">
                          Số tiền
                        </th>
                        <th className="text-center pb-2 sm:pb-3 px-1 sm:px-2 font-medium text-[10px] sm:text-xs lg:text-sm hidden md:table-cell">
                          Ngày
                        </th>
                        <th className="text-center pb-2 sm:pb-3 px-2 sm:px-2 font-medium text-[10px] sm:text-xs lg:text-sm">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionList.slice(0, 10).map((t) => (
                        <tr
                          key={t.idTransaction}
                          className="border-b border-[var(--color-border)]/5 hover:bg-foreground/50 transition-colors">
                          <td className="py-2 sm:py-3 px-2 sm:px-2">
                            <div className="flex flex-col gap-0.5 sm:gap-1">
                              <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                                {t.transactionName}
                              </span>
                              <div className="flex items-center gap-1.5 sm:gap-2 sm:hidden">
                                <span
                                  className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                                    t.transactionType === "Chi"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-green-500/10 text-green-500"
                                  }`}>
                                  {t.transactionType}
                                </span>
                                <span className="text-[10px] sm:text-xs text-[var(--color-text)] md:hidden">
                                  {new Date(
                                    t.transactionDate
                                  ).toLocaleDateString("vi-VN")}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center hidden sm:table-cell">
                            <span
                              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium inline-block ${
                                t.transactionType === "Chi"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-green-500/10 text-green-500"
                              }`}>
                              {t.transactionType}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-2 text-right">
                            <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">
                              {t.amount.toLocaleString()}đ
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-center text-xs sm:text-sm text-[var(--color-text)] hidden md:table-cell">
                            {new Date(t.transactionDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-2">
                            <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                              <button
                                onClick={() =>
                                  setTransactionModal({
                                    isOpen: true,
                                    mode: "edit",
                                    data: t,
                                  })
                                }
                                className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Sửa">
                                <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    isOpen: true,
                                    type: "transaction",
                                    id: t.idTransaction,
                                    name: t.transactionName,
                                  })
                                }
                                className="p-1 sm:p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Xóa">
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-[var(--color-text)]">
                <p className="text-sm">Chưa có giao dịch nào</p>
                <button
                  onClick={() =>
                    setTransactionModal({isOpen: true, mode: "add", data: null})
                  }
                  className="mt-3 sm:mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-xs sm:text-sm">
                  Thêm giao dịch đầu tiên
                </button>
              </div>
            )}
          </div>

          {/* Chart + Budget */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
            {/* Donut Chart - styled like dashboard */}
            <div className="rounded-xl sm:rounded-2xl shadow-xl bg-background p-3 sm:p-4 min-h-[280px] sm:min-h-[340px]">
              <div className="text-xs sm:text-sm font-bold opacity-80 mb-2">
                Tỉ lệ chi tiêu
              </div>
              {chartData.length > 0 ? (
                <ReactApexChart
                  options={chartOptions}
                  series={chartSeries}
                  type="donut"
                  height={260}
                />
              ) : (
                <div className="flex items-center justify-center h-[220px] sm:h-[260px]">
                  <p className="text-xs sm:text-sm text-[var(--color-text)]">
                    Chưa có dữ liệu
                  </p>
                </div>
              )}
            </div>

            {/* Budget List */}
            <div className="rounded-xl sm:rounded-2xl bg-background shadow-xl p-3 sm:p-4 lg:p-5 transition-all">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-xs sm:text-sm font-bold opacity-80">Ngân sách</h2>
                <button
                  onClick={() =>
                    setBudgetModal({isOpen: true, mode: "add", data: null})
                  }
                  className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Thêm ngân sách">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                </button>
              </div>

              {budgetList.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 max-h-[180px] sm:max-h-[200px] overflow-y-auto nice-scroll pr-1">
                  {budgetList.map((b) => {
                    const percent = Math.min(
                      100,
                      Math.round((b.currentBudget / b.budgetGoal) * 100)
                    );
                    return (
                      <div key={b.idBudget} className="group">
                        <div className="flex justify-between mb-1 sm:mb-1.5">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                            {b.urlImage ? (
                              <img 
                                src={b.urlImage} 
                                alt={b.budgetName}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                <Wallet className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" />
                              </div>
                            )}
                            <span className="font-medium text-xs sm:text-sm truncate">
                              {b.budgetName}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 sm:gap-1 transition-opacity flex-shrink-0">
                              <button
                                onClick={() =>
                                  setDeleteModal({
                                    isOpen: true,
                                    type: "budget",
                                    id: b.idBudget,
                                    name: b.budgetName,
                                  })
                                }
                                className="p-0.5 sm:p-1 hover:bg-red-500/10 rounded transition-colors">
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
                              </button>
                            </div>
                          </div>
                          <span className="font-semibold text-xs sm:text-sm whitespace-nowrap ml-2 flex-shrink-0">
                            {b.currentBudget.toLocaleString()}đ
                          </span>
                        </div>
                        <div className="w-full bg-gray-200/30 rounded-full h-2 sm:h-2.5">
                          <div
                            className={`h-2 sm:h-2.5 rounded-full transition-all ${
                              percent >= 90
                                ? "bg-red-500"
                                : percent >= 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{width: `${percent}%`}}
                          />
                        </div>
                        <p className="text-[10px] sm:text-xs text-[var(--color-text)] mt-1 sm:mt-1.5">
                          {percent}% của {b.budgetGoal.toLocaleString()}đ
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-[var(--color-text)]">
                  <p>Chưa có ngân sách nào</p>
                  <button
                    onClick={() =>
                      setBudgetModal({isOpen: true, mode: "add", data: null})
                    }
                    className="mt-2 sm:mt-3 text-blue-500 hover:underline text-xs sm:text-sm">
                    Thêm ngân sách
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
            <div className="text-base sm:text-lg font-semibold">Mục tiêu tiết kiệm</div>
            <button
              onClick={() =>
                setSavingModal({isOpen: true, mode: "add", data: null})
              }
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold bg-amber-500 text-white shadow-xl cursor-pointer
            hover:bg-amber-600 active:scale-[0.97] transition-all text-xs sm:text-sm">
              <Plus className="w-4 h-4" /> Thêm mục tiêu
            </button>
          </div>

          {savingList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {savingList.map((g) => {
                const percent = Math.min(
                  100,
                  Math.round((g.currentAmount / g.targetAmount) * 100)
                );
                return (
                  <div
                    key={g.idSaving}
                    className="border border-[var(--color-border)]/10 bg-background rounded-xl p-3 sm:p-4 hover:shadow-md transition group">
                    
                    {/* Header with icon and title */}
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {g.urlImage ? (
                          <img 
                            src={g.urlImage} 
                            alt={g.savingName}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                          </div>
                        )}
                        <h3 className="font-semibold text-xs sm:text-sm lg:text-base truncate">
                          {g.savingName}
                        </h3>
                      </div>

                      {/* Action buttons - Always visible on mobile, hover on desktop */}
                      <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleOpenSavingHistory(g)}
                          className="p-1 sm:p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Lịch sử">
                          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() =>
                            setSavingTransactionModal({isOpen: true, saving: g})
                          }
                          className="p-1 sm:p-1.5 hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Thêm tiền">
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              type: "saving",
                              id: g.idSaving,
                              name: g.savingName,
                            })
                          }
                          className="p-1 sm:p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Xóa">
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Target date */}
                    {g.targetDate && (
                      <span className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text)] whitespace-nowrap block mb-2">
                        {new Date(g.targetDate).toLocaleDateString("vi-VN")}
                      </span>
                    )}

                    {/* Target amount */}
                    <div className="text-sm sm:text-base lg:text-lg font-bold text-amber-500 mb-1">
                      {g.targetAmount.toLocaleString()}đ
                    </div>

                    {/* Current amount */}
                    <p className="text-[10px] sm:text-xs lg:text-sm text-[var(--color-text)] mb-2">
                      {g.currentAmount.toLocaleString()}đ đã tiết kiệm ({percent}%)
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200/30 rounded-full h-1.5 sm:h-2 mb-2">
                      <div
                        className="h-1.5 sm:h-2 rounded-full bg-amber-500 transition-all"
                        style={{width: `${percent}%`}}></div>
                    </div>

                    {/* Description */}
                    {g.description && (
                      <p className="text-[10px] sm:text-xs text-gray-500 italic break-words line-clamp-2 mb-2">
                        {g.description}
                      </p>
                    )}

                    {/* Status badge */}
                    <div
                      className={`mt-1 sm:mt-2 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs inline-block ${
                        g.status === "Hoàn Thành"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}>
                      {g.status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 border border-[var(--color-border)]/10 bg-background rounded-xl">
              <p className="text-[var(--color-text)] mb-3 sm:mb-4 text-sm">
                Chưa có mục tiêu tiết kiệm nào
              </p>
              <button
                onClick={() =>
                  setSavingModal({isOpen: true, mode: "add", data: null})
                }
                className="px-4 sm:px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-xs sm:text-sm">
                Tạo mục tiêu đầu tiên
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddEditTransactionModal
        isOpen={transactionModal.isOpen}
        onClose={() =>
          setTransactionModal({isOpen: false, mode: "add", data: null})
        }
        onSubmit={handleTransactionSubmit}
        transaction={transactionModal.data}
        mode={transactionModal.mode}
        budgetList={budgetList}
      />

      <AddEditBudgetModal
        isOpen={budgetModal.isOpen}
        onClose={() => setBudgetModal({isOpen: false, mode: "add", data: null})}
        onSubmit={handleBudgetSubmit}
        budget={budgetModal.data}
        mode={budgetModal.mode}
      />

      <AddEditSavingModal
        isOpen={savingModal.isOpen}
        onClose={() => setSavingModal({isOpen: false, mode: "add", data: null})}
        onSubmit={handleSavingSubmit}
        saving={savingModal.data}
        mode={savingModal.mode}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({isOpen: false, type: "", id: "", name: ""})
        }
        onConfirm={handleDelete}
        title={`Xóa ${
          deleteModal.type === "transaction"
            ? "giao dịch"
            : deleteModal.type === "budget"
            ? "ngân sách"
            : "mục tiêu"
        }`}
        message={`Bạn có chắc chắn muốn xóa "${deleteModal.name}"? Hành động này không thể hoàn tác.`}
        loading={deleteLoading}
      />

      {/* Saving Transaction Modals */}
      {savingTransactionModal.saving && (
        <AddSavingTransactionModal
          isOpen={savingTransactionModal.isOpen}
          onClose={() =>
            setSavingTransactionModal({isOpen: false, saving: null})
          }
          onSubmit={handleAddSavingTransaction}
          savingName={savingTransactionModal.saving.savingName}
          currentAmount={savingTransactionModal.saving.currentAmount}
          targetAmount={savingTransactionModal.saving.targetAmount}
        />
      )}

      {savingHistoryModal.saving && (
        <SavingTransactionHistoryModal
          isOpen={savingHistoryModal.isOpen}
          onClose={() =>
            setSavingHistoryModal({
              isOpen: false,
              saving: null,
              transactions: [],
            })
          }
          savingName={savingHistoryModal.saving.savingName}
          savingId={savingHistoryModal.saving.idSaving}
          transactions={savingHistoryModal.transactions}
          onDelete={handleDeleteSavingTransaction}
          onAddNew={() => {
            setSavingHistoryModal((prev) => ({...prev, isOpen: false}));
            setSavingTransactionModal({
              isOpen: true,
              saving: savingHistoryModal.saving,
            });
          }}
          loading={savingTransactionsLoading}
        />
      )}
    </>
  );
};

export default FinanceDashboard;
