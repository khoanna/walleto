'use client'

import useFund from '@/services/useFund';
import React, { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react';

interface AssetDetail {
    valueTotalAsset: number;
    averageNetCost: number;
    totalProfitAndLoss: number;
    listInvestmentDetailResponses: {
        idDetail: string;
        type: string;
        price: number;
        quantity: number;
        fee: number;
        expense: number;
        currentProfit: number;
        profit: number; 
        createAt: string;
    }[];
}

interface CryptoDetailProps {
    isOpen: boolean;
    onClose: () => void;
    idAsset: string;
    assetName: string;
    assetSymbol: string;
    assetImage: string;
}

const CryptoDetail = ({ isOpen, onClose, idAsset, assetName, assetSymbol, assetImage }: CryptoDetailProps) => {
    const { getDetailAsset, fundLoading } = useFund();
    const [assetDetail, setAssetDetail] = useState<AssetDetail | null>(null);

    useEffect(() => {
        if (isOpen && idAsset) {
            const fetchAssetDetail = async () => {
                try {
                    const data = await getDetailAsset(idAsset);
                    setAssetDetail(data?.data);
                } catch (error) {
                    console.error('Error fetching asset detail:', error);
                }
            };
            fetchAssetDetail();
        }
    }, [isOpen, idAsset]);

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getProfitLabel = (profit: number) => {
        if (profit > 0) return 'Lời';
        if (profit < 0) return 'Lỗ';
        return 'Hòa vốn';
    };

    const getChangeColor = (value: number) => {
        if (value > 0) return 'text-green-500';
        if (value < 0) return 'text-red-500';
        return 'text-text';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="w-full max-w-5xl bg-foreground rounded-3xl shadow-2xl relative max-h-[85vh] flex flex-col">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer top-6 right-6 text-text/60 hover:text-text transition-colors z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {fundLoading ? (
                    <div className="flex items-center justify-center p-16">
                        <Loader2 className="animate-spin text-text" size={48} />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-8 pb-4 border-b border-text/10">
                            <h2 className="text-2xl font-bold text-text mb-2">Chi tiết tài sản</h2>
                            <p className="text-text/60 flex items-center gap-3">
                                <img src={assetImage} className='w-6 h-6 rounded-full' alt="Asset Image" />
                                {assetName} ({assetSymbol.toUpperCase()})
                            </p>
                        </div>

                        {/* Stats Cards */}
                        {assetDetail && (
                            <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-background rounded-xl p-4 border border-text/10">
                                    <p className="text-xs text-text/60 mb-1">Giá trị hiện tại</p>
                                    <p className="text-lg font-bold text-text">
                                        {formatPrice(assetDetail.valueTotalAsset)}
                                    </p>
                                </div>
                                <div className="bg-background rounded-xl p-4 border border-text/10">
                                    <p className="text-xs text-text/60 mb-1">Giá vốn trung bình</p>
                                    <p className="text-lg font-bold text-text">
                                        {formatPrice(assetDetail.averageNetCost)}
                                    </p>
                                </div>
                                <div className="bg-background rounded-xl p-4 border border-text/10">
                                    <p className="text-xs text-text/60 mb-1">Lãi/Lỗ</p>
                                    <p className={`text-lg font-bold ${getChangeColor(assetDetail.totalProfitAndLoss)}`}>
                                        {assetDetail.totalProfitAndLoss >= 0 ? '+' : ''}{formatPrice(assetDetail.totalProfitAndLoss)}
                                    </p>
                                </div>
                                <div className="bg-background rounded-xl p-4 border border-text/10">
                                    <p className="text-xs text-text/60 mb-1">% Thay đổi</p>
                                    <p className={`text-lg font-bold ${getChangeColor(assetDetail.totalProfitAndLoss)}`}>
                                        {assetDetail.averageNetCost > 0
                                            ? `${assetDetail.totalProfitAndLoss >= 0 ? '+' : ''}${((assetDetail.totalProfitAndLoss / assetDetail.averageNetCost) * 100).toFixed(2)}%`
                                            : '0.00%'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Transactions Table */}
                        <div className="flex-1 overflow-y-auto nice-scroll px-8 pb-8">
                            <h3 className="text-lg font-semibold text-text mb-4">Lịch sử giao dịch</h3>
                            {assetDetail && assetDetail.listInvestmentDetailResponses.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-background border-b border-text/10 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-text uppercase tracking-wider">Loại</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-text uppercase tracking-wider">Giá</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-text uppercase tracking-wider">Số lượng</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-text uppercase tracking-wider">Vốn</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-text uppercase tracking-wider">Phí</th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold text-text uppercase tracking-wider">Lãi/Lỗ hiện tại</th>
                                                <th className="px-4 py-3 text-center text-xs font-semibold text-text uppercase tracking-wider">Trạng thái</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-text uppercase tracking-wider">Thời gian</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-text/5">
                                            {assetDetail.listInvestmentDetailResponses.map((transaction) => (
                                                <tr key={transaction.idDetail} className="hover:bg-text/5 transition-colors">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            transaction.type === 'Mua' 
                                                                ? 'bg-green-500/20 text-green-500' 
                                                                : 'bg-red-500/20 text-red-500'
                                                        }`}>
                                                            {transaction.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-text whitespace-nowrap">
                                                        {formatPrice(transaction.price)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-text whitespace-nowrap">
                                                        {transaction.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-text whitespace-nowrap">
                                                        {formatPrice(transaction.expense)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-text/60 whitespace-nowrap">
                                                        {formatPrice(transaction.fee)}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right text-sm font-semibold whitespace-nowrap ${getChangeColor(transaction.currentProfit)}`}>
                                                        {transaction.currentProfit >= 0 ? '+' : ''}{formatPrice(transaction.currentProfit)}
                                                    </td>
                                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            transaction.profit === 1 
                                                                ? 'bg-green-500/20 text-green-500'
                                                                : transaction.profit === 0
                                                                ? 'bg-yellow-500/20 text-yellow-500'
                                                                : 'bg-red-500/20 text-red-500'
                                                        }`}>
                                                            {getProfitLabel(transaction.profit)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-text/60 whitespace-nowrap">
                                                        {formatDateTime(transaction.createAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <svg className="w-16 h-16 text-text/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-text/60 text-center">
                                        Chưa có giao dịch nào
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default CryptoDetail