'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCompactNumber, formatVND } from '@/utils/formatCurrency';

interface Asset {
  idAsset: string;
  id: string;
  assetName: string;
  assetSymbol: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  priceChangePercentage24h: number;
  url: string;
}

interface PortfolioTableProps {
  assets: Asset[];
}

/* ---------- helpers ---------- */
const Trend = ({ v }: { v: number }) => {
  const up = v >= 0;
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        up
          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20'
          : 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-400/20',
      ].join(' ')}
      title={`${up ? '+' : ''}${v.toFixed(2)}%`}
    >
      {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {up ? '+' : ''}
      {v.toFixed(2)}%
    </span>
  );
};

/* ---------- components ---------- */

export function PortfolioTable({ assets }: PortfolioTableProps) {
  return (
    <div className="h-full flex flex-col text-text overflow-hidden rounded-2xl bg-background backdrop-blur shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="px-4 sm:px-6 py-3 sm:py-4 text-lg sm:text-xl font-bold border-b border-white/5">
        Danh mục đầu tư
      </div>

      {/* table */}
      <div className="flex-1 overflow-auto nice-scroll">
        <table className="w-full text-xs sm:text-sm">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="border-b border-white/5">
              <Th>Name</Th>
              <Th className="hidden sm:table-cell">Marketcap</Th>
              <Th className="text-right">Volume</Th>
              <Th className="text-right">Price</Th>
              <Th className="text-right">24h Change</Th>
            </tr>
          </thead>
          <tbody>
            {assets.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 sm:py-16 text-center text-slate-400">
                  Chưa có tài sản đầu tư
                </td>
              </tr>
            ) : (
              assets.map((asset, idx) => (
                <tr
                  key={asset.idAsset + idx}
                  className="group border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <Td>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <img
                        src={asset.url || 'https://via.placeholder.com/40'}
                        alt={asset.assetSymbol}
                        className="size-6 sm:size-7 rounded-full ring-1 ring-white/10"
                      />
                      <div className="leading-tight">
                        <div className="font-semibold text-slate-100 text-xs sm:text-sm">{asset.assetName}</div>
                        <div className="text-[10px] sm:text-[11px] text-slate-400">{asset.assetSymbol}</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="hidden sm:table-cell">{formatCompactNumber(asset.marketCap)} đ</Td>
                  <Td className="text-right">{formatCompactNumber(asset.totalVolume)} đ</Td>
                  <Td className="text-right">{formatVND(asset.currentPrice)}</Td>
                  <Td className="text-right"><Trend v={asset.priceChangePercentage24h} /></Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}



function Th({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <th className={['py-2 px-3 font-medium text-left', className].join(' ')}>{children}</th>
  );
}

function Td({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={['py-3 px-3 align-middle', className].join(' ')}>{children}</td>;
}
