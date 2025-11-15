import { ArrowUpRight } from 'lucide-react'
import React from 'react'
import { FinanceDasboard, TransactionThisWeekDashboard } from '@/type/Dashboard'
import { formatVND } from '@/utils/formatCurrency'

interface AccountProps {
    financeData: FinanceDasboard | null;
    weekData: TransactionThisWeekDashboard | null;
}

const Account = ({ financeData, weekData }: AccountProps) => {
    const totalAmount = financeData?.totalAmount || 0;
    const totalTransactions = weekData?.totalTransactionInWeek || 0;

    return (
        <div> <div className="flex flex-col justify-between min-h-[340px]">
            {/* Card 1: Số dư hiện tại */}
            <div className="shadow-xl min-h-[140px] bg-background/90 rounded-2xl border border-white/10 p-5">
                <p className="text-[13px] text-slate-400">Tài khoản hiện tại</p>
                <p className="mt-1 text-[34px] leading-tight font-extrabold tracking-tight text-text">
                    {formatVND(totalAmount)}
                </p>
                <p className="mt-1 text-[13px] font-medium text-emerald-500">
                    Tổng tài sản
                </p>
            </div>

            {/* Card 2: Tổng giao dịch tuần */}
            <div className="shadow-xl min-h-[140px] bg-background/90 rounded-2xl border border-white/10 p-5 flex items-start justify-between">
                <div className="mb-4 gap-3 flex flex-col">
                    <span className="grid place-items-center size-9 rounded-full bg-[#0B162C] text-white shadow-inner">
                        <ArrowUpRight className="size-4" />
                    </span>
                    <div>
                        <p className="text-[13px] text-slate-500">Tổng giao dịch</p>
                        <p className="text-[13px] text-slate-400">Tuần này</p>
                    </div>
                </div>
                <div className="text-2xl font-bold text-text">{totalTransactions}</div>
            </div>
        </div></div>
    )
}

export default Account