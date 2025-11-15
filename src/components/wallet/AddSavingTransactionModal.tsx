"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { SavingTransactionFormData } from "@/type/SavingTransaction";
import { formatInputNumber, parseFormattedNumber, formatVND } from "@/utils/formatCurrency";

interface AddSavingTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SavingTransactionFormData) => Promise<void>;
  savingName: string;
  currentAmount: number;
  targetAmount: number;
}

export default function AddSavingTransactionModal({
  isOpen,
  onClose,
  onSubmit,
  savingName,
  currentAmount,
  targetAmount
}: AddSavingTransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const remainingAmount = targetAmount - currentAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseFormattedNumber(amount);
    
    if (!amount || amountValue <= 0) {
      alert("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ amount: amountValue });
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
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
          <h2 className="text-xl font-semibold">Thêm tiền tiết kiệm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-foreground rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Saving Info */}
          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text)]">Mục tiêu:</span>
              <span className="font-semibold text-amber-500">{savingName}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text)]">Đã tiết kiệm:</span>
              <span className="font-medium">{formatVND(currentAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text)]">Còn thiếu:</span>
              <span className="font-medium text-amber-600">
                {formatVND(remainingAmount > 0 ? remainingAmount : 0)}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Số tiền bỏ vào (VNĐ) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(formatInputNumber(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-foreground border border-[var(--color-border)]/20 
                       focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-lg"
              placeholder="VD: 100.000"
              autoFocus
            />
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-[var(--color-text)] mt-2">
                💰 Sau khi thêm: {(currentAmount + parseFloat(amount)).toLocaleString()}đ / {targetAmount.toLocaleString()}đ
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-medium bg-foreground border border-[var(--color-border)]/20 
                       hover:brightness-110 transition-all disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg font-medium bg-amber-500 text-white 
                       hover:bg-amber-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Thêm tiền"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
