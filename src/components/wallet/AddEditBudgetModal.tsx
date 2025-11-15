"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Budget } from "@/type/useBudget";
import { BudgetFormData } from "@/type/BudgetForm";
import { formatInputNumber, parseFormattedNumber } from "@/utils/formatCurrency";

interface AddEditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  budget?: Budget | null;
  mode: "add" | "edit";
}

export default function AddEditBudgetModal({
  isOpen,
  onClose,
  onSubmit,
  budget,
  mode
}: AddEditBudgetModalProps) {
  const [formData, setFormData] = useState({
    budgetName: "",
    budgetGoal: "",
    urlImage: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && budget) {
      setFormData({
        budgetName: budget.budgetName,
        budgetGoal: formatInputNumber(budget.budgetGoal.toString()),
        urlImage: budget.urlImage || ""
      });
    } else {
      setFormData({
        budgetName: "",
        budgetGoal: "",
        urlImage: ""
      });
    }
  }, [mode, budget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.budgetName || !formData.budgetGoal) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        budgetName: formData.budgetName,
        budgetGoal: parseFormattedNumber(formData.budgetGoal),
        urlImage: formData.urlImage
      });
      onClose();
    } catch (error) {
      console.error("Error submitting budget:", error);
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
            {mode === "add" ? "Thêm ngân sách mới" : "Sửa ngân sách"}
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
          {/* Budget Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Tên ngân sách</label>
            <input
              type="text"
              value={formData.budgetName}
              onChange={(e) => setFormData({ ...formData, budgetName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              placeholder="VD: Đồ uống"
            />
          </div>

          {/* Budget Goal */}
          <div>
            <label className="block text-sm font-medium mb-2">Mục tiêu (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.budgetGoal}
              onChange={(e) => setFormData({ ...formData, budgetGoal: formatInputNumber(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              placeholder="VD: 50.000.000"
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
