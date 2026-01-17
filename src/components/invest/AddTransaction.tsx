'use client'

import React, { useState } from 'react'
import { formatInputNumber, parseFormattedNumber } from '@/utils/formatCurrency'

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: AddTransactionData) => void;
    loading?: boolean;
    assetId: string;
    assetName: string;
    assetSymbol: string;
    currentPrice: number;
    assetImage: string;
}

interface AddTransactionData {
    type: string;
    price: number;
    quantity: number;
    fee: number;
    expense: number;
    idAsset: string;
}

const AddTransaction = ({ isOpen, onClose, onSubmit, loading, assetId, assetName, assetSymbol, currentPrice, assetImage }: AddTransactionModalProps) => {
    const [transactionType, setTransactionType] = useState<'Mua' | 'Bán'>('Mua');
    const [quantity, setQuantity] = useState('');
    const [fee, setFee] = useState('0');
    const [expense, setExpense] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.({
            type: transactionType,
            price: currentPrice,
            quantity: parseFloat(quantity),
            fee: parseFormattedNumber(fee),
            expense: parseFormattedNumber(expense),
            idAsset: assetId,
        });
        handleClose();
    };

    const handleClose = () => {
        setTransactionType('Mua');
        setQuantity('');
        setFee('0');
        setExpense('');
        onClose();
    };

    // Tính quantity từ expense hoặc ngược lại
    const handleQuantityChange = (value: string) => {
        setQuantity(value);
        if (value && parseFloat(value) > 0 && currentPrice > 0) {
            const calculatedExpense = parseFloat(value) * currentPrice;
            setExpense(formatInputNumber(Math.round(calculatedExpense).toString()));
        } else {
            setExpense('');
        }
    };

    const handleExpenseChange = (value: string) => {
        const formatted = formatInputNumber(value);
        setExpense(formatted);
        
        const numericValue = parseFormattedNumber(formatted);
        if (numericValue > 0 && currentPrice > 0) {
            const calculatedQuantity = numericValue / currentPrice;
            setQuantity(calculatedQuantity.toString());
        } else {
            setQuantity('');
        }
    };

    const handleFeeChange = (value: string) => {
        setFee(formatInputNumber(value));
    };
    
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-lg bg-foreground rounded-3xl shadow-2xl relative max-h-[85vh] flex flex-col">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute cursor-pointer top-6 right-6 text-text/60 hover:text-text transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8 overflow-y-auto nice-scroll">
                    <h2 className="text-2xl font-bold text-text mb-2 text-center">Thêm giao dịch</h2>
                    <p className="text-center text-text/60 mb-6 flex items-center justify-center gap-3">
                        {assetImage && <img src={assetImage} alt={`${assetName} image`} className="w-6 h-6 rounded-full" />}
                        {assetName} ({assetSymbol.toUpperCase()})
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Transaction Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">Loại giao dịch</label>
                            <div className="grid grid-cols-2 gap-3 ">
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('Mua')}
                                    className={`px-4 py-3 cursor-pointer rounded-lg font-semibold transition-all border ${
                                        transactionType === 'Mua'
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-background text-text border-text/10 hover:border-text/20'
                                    }`}
                                >
                                    Mua
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('Bán')}
                                    className={`px-4 py-3 cursor-pointer rounded-lg font-semibold transition-all border ${
                                        transactionType === 'Bán'
                                            ? 'bg-red-500 text-white border-red-500'
                                            : 'bg-background text-text border-text/10 hover:border-text/20'
                                    }`}
                                >
                                    Bán
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">
                                Giá hiện tại (VND)
                            </label>
                            <input
                                type="text"
                                value={formatPrice(currentPrice)}
                                disabled
                                className="w-full px-4 py-3 bg-background/50 text-text rounded-lg border border-text/10
                                         cursor-not-allowed opacity-75"
                            />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                step="0.00000001"
                                min="0"
                                value={quantity}
                                onChange={(e) => handleQuantityChange(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-background text-text rounded-lg border border-text/10
                                         focus:outline-none focus:ring-2 focus:ring-text/30 focus:border-transparent
                                         placeholder:text-text/40 transition-all"
                            />
                        </div>

                        {/* Expense (Vốn) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">
                                Vốn (VND)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={expense}
                                onChange={(e) => handleExpenseChange(e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-background text-text rounded-lg border border-text/10
                                         focus:outline-none focus:ring-2 focus:ring-text/30 focus:border-transparent
                                         placeholder:text-text/40 transition-all"
                            />
                        </div>

                        {/* Fee */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-text">
                                Phí giao dịch (VND)
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={fee}
                                onChange={(e) => handleFeeChange(e.target.value)}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-background text-text rounded-lg border border-text/10
                                         focus:outline-none focus:ring-2 focus:ring-text/30 focus:border-transparent
                                         placeholder:text-text/40 transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !quantity || !expense}
                            className={`w-full mt-8 px-6 py-3 font-semibold rounded-full
                                     hover:brightness-110 active:scale-[0.98] transition-all shadow-lg
                                     cursor-pointer border disabled:opacity-50 disabled:cursor-not-allowed ${
                                         transactionType === 'Mua'
                                             ? 'bg-green-500 text-white border-green-500'
                                             : 'bg-red-500 text-white border-red-500'
                                     }`}
                        >
                            {loading ? 'Đang xử lý...' : `Xác nhận ${transactionType}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTransaction;
