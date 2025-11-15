import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatVND } from "@/utils/formatCurrency";

interface BriefTransaction {
  idTransaction: string;
  transactionName: string;
  amount: number;
  transactionDate: string;
}

interface BalanceActivityProps {
  transactions: BriefTransaction[];
}

// Helper to format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0 || diffDays === 1) {
    return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN');
  }
}

export function BalanceActivity({ transactions }: BalanceActivityProps) {
  return (
    <div className="max-h-[400px] nice-scroll overflow-y-scroll rounded-2xl  bg-background text-text backdrop-blur p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="px-2 py-2 text-xl font-bold ">Giao dịch tuần này</div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-slate-400">
          Chưa có giao dịch nào
        </div>
      ) : (
        <ul className="mt-1 divide-y divide-white/5">
          {transactions.map((t, i) => {
            // Determine if it's income or expense based on amount (positive = income)
            const isIncome = t.amount > 0;
            const color = isIncome
              ? 'text-emerald-400 bg-emerald-500/10 ring-emerald-400/20'
              : 'text-rose-400 bg-rose-500/10 ring-rose-400/20';
            
            return (
              <li key={t.idTransaction} className="flex items-center justify-between p-3 hover:bg-white/[0.03] rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span
                    className={[
                      'grid place-items-center size-10 rounded-xl ring-1',
                      color.split(' ').slice(1).join(' '),
                    ].join(' ')}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="size-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="size-5 text-rose-400" />
                    )}
                  </span>
                  <div className="leading-tight">
                    <div className="font-medium ">{t.transactionName}</div>
                    <div className="text-[11px]">{formatDate(t.transactionDate)}</div>
                  </div>
                </div>
                <div className="text-text font-semibold">
                  {formatVND(Math.abs(t.amount))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}