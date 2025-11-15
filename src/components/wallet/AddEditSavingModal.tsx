"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Saving } from "@/type/Saving";
import { SavingFormData } from "@/type/SavingForm";
import { formatInputNumber, parseFormattedNumber } from "@/utils/formatCurrency";

interface AddEditSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SavingFormData) => Promise<void>;
  saving?: Saving | null;
  mode: "add" | "edit";
}

export default function AddEditSavingModal({
  isOpen,
  onClose,
  onSubmit,
  saving,
  mode
}: AddEditSavingModalProps) {
  const [formData, setFormData] = useState({
    savingName: "",
    description: "",
    targetAmount: "",
    targetDate: "",
    urlImage: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && saving) {
      setFormData({
        savingName: saving.savingName,
        description: saving.description || "",
        targetAmount: formatInputNumber(saving.targetAmount.toString()),
        targetDate: saving.targetDate ? saving.targetDate.split('T')[0] : "",
        urlImage: saving.urlImage || ""
      });
    } else {
      setFormData({
        savingName: "",
        description: "",
        targetAmount: "",
        targetDate: "",
        urlImage: ""
      });
    }
  }, [mode, saving, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.savingName || !formData.targetAmount) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Validate target date is not in the past
    if (formData.targetDate) {
      const selectedDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare only dates
      
      if (selectedDate < today) {
        alert("Ngày mục tiêu không thể ở trong quá khứ");
        return;
      }
    }

    setLoading(true);
    try {
      await onSubmit({
        savingName: formData.savingName,
        description: formData.description,
        targetAmount: parseFormattedNumber(formData.targetAmount),
        targetDate: formData.targetDate, // "YYYY-MM-DD" format
        urlImage: formData.urlImage
      });
      onClose();
    } catch (error) {
      console.error("Error submitting saving:", error);
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
            {mode === "add" ? "Thêm mục tiêu tiết kiệm" : "Sửa mục tiêu"}
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
          {/* Saving Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Tên mục tiêu</label>
            <input
              type="text"
              value={formData.savingName}
              onChange={(e) => setFormData({ ...formData, savingName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              placeholder="VD: Mua xe"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Mô tả (tùy chọn)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
              placeholder="VD: Dành dụm để mua xe máy Honda SH Mode"
              rows={3}
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Số tiền mục tiêu (VNĐ)</label>
            <input
              type="text"
              inputMode="numeric"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: formatInputNumber(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              placeholder="VD: 50.000.000"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Ngày mục tiêu (tùy chọn)</label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
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
