"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Transaction } from "@/type/Transaction";
import { Budget } from "@/type/useBudget";
import { TransactionFormData } from "@/type/TransactionForm";
import { formatInputNumber, parseFormattedNumber } from "@/utils/formatCurrency";

interface AddEditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  transaction?: Transaction | null;
  mode: "add" | "edit";
  budgetList: Budget[];
}

export default function AddEditTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  mode,
  budgetList
}: AddEditTransactionModalProps) {
  const [formData, setFormData] = useState({
    transactionName: "",
    transactionCategory: "",
    transactionType: "Chi" as "Chi" | "Thu",
    amount: "",
    transactionDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Lấy danh mục từ budgetList
  const categories = budgetList.map(b => b.budgetName);
  
  // Fallback categories nếu không có budget
  const defaultCategories = ["Đồ ăn", "Đi chơi", "Mua sắm", "Y tế", "Giáo dục", "Khác"];
  const availableCategories = categories.length > 0 ? categories : defaultCategories;

  useEffect(() => {
    if (mode === "edit" && transaction) {
      setFormData({
        transactionName: transaction.transactionName,
        transactionCategory: transaction.transactionCategory,
        transactionType: transaction.transactionType,
        amount: formatInputNumber(transaction.amount.toString()),
        transactionDate: transaction.transactionDate.split('T')[0]
      });
    } else {
      setFormData({
        transactionName: "",
        transactionCategory: availableCategories[0] || "",
        transactionType: "Chi",
        amount: "",
        transactionDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [mode, transaction, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.transactionName || !formData.amount) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Kiểm tra nếu là Chi tiêu thì phải có danh mục
    if (formData.transactionType === "Chi" && !formData.transactionCategory) {
      alert("Vui lòng chọn danh mục cho chi tiêu");
      return;
    }

    setLoading(true);
    try {
      // Chuyển đổi date sang ISO string và loại bỏ 'Z' cuối cùng
      const isoString = new Date(formData.transactionDate).toISOString();
      const dateWithoutZ = isoString.replace(/Z$/, '');
      
      await onSubmit({
        transactionName: formData.transactionName,
        // Nếu là Thu nhập thì gửi danh mục trống, nếu Chi tiêu thì gửi danh mục đã chọn
        transactionCategory: formData.transactionType === "Thu" ? "" : formData.transactionCategory,
        transactionType: formData.transactionType,
        amount: parseFormattedNumber(formData.amount),
        transactionDate: dateWithoutZ
      });
      onClose();
    } catch (error) {
      console.error("Error submitting transaction:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md border border-[var(--color-border)]/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]/10">
          <h2 className="text-xl font-semibold">
            {mode === "add" ? "Thêm giao dịch mới" : "Sửa giao dịch"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Tên giao dịch</label>
            <input
              type="text"
              value={formData.transactionName}
              onChange={(e) => setFormData({ ...formData, transactionName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              placeholder="VD: Mua ly nước cam"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Loại giao dịch</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transactionType: "Chi", transactionCategory: availableCategories[0] || "" })}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  formData.transactionType === "Chi"
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-foreground border border-[var(--color-border)]/20 hover:border-red-500/50"
                }`}
              >
                Chi tiêu
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transactionType: "Thu", transactionCategory: "" })}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                  formData.transactionType === "Thu"
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-foreground border border-[var(--color-border)]/20 hover:border-green-500/50"
                }`}
              >
                Thu nhập
              </button>
            </div>
          </div>

          {/* Category - Custom Dropdown - Chỉ hiển thị khi là Chi tiêu */}
          {formData.transactionType === "Chi" && (
            <div>
              <label className="block text-sm font-medium mb-2">Danh mục</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all
                           flex items-center justify-between hover:border-blue-500/50"
                >
                  <span className={formData.transactionCategory ? "" : "text-gray-500"}>
                    {formData.transactionCategory || "Chọn danh mục"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {dropdownOpen && (
                  <>
                    {/* Backdrop để đóng dropdown */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setDropdownOpen(false)}
                    />
                    
                    {/* Dropdown menu */}
                    <div className="absolute z-20 w-full mt-2 bg-background border border-[var(--color-border)]/20 
                                  rounded-lg shadow-xl max-h-60 overflow-y-auto nice-scroll">
                      {availableCategories.length > 0 ? (
                        availableCategories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, transactionCategory: cat });
                              setDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-blue-500/10 transition-colors
                                      ${formData.transactionCategory === cat ? "bg-blue-500/20 font-medium" : ""}`}
                          >
                            {cat}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          Chưa có danh mục. Hãy tạo ngân sách trước!
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              {categories.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">
                  💡 Tip: Tạo ngân sách để có danh mục cho giao dịch
                </p>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Số tiền (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: formatInputNumber(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              placeholder="VD: 20.000"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Ngày giao dịch</label>
            <input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-foreground border border-[var(--color-border)]/20 
                       hover:brightness-110 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-blue-500 text-white 
                       hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : mode === "add" ? "Thêm" : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
