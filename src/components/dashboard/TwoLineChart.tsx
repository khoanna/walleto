'use client'

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Transaction } from '@/type/Dashboard';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type Range = 'week' | 'month' | 'year';

interface TwoLineChartProps {
    transactions: Transaction[];
}

function Tab({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={[
                'px-3 py-1.5 text-xs rounded-full transition-all cursor-pointer',
                active
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/10',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

// Helper function to process transactions into chart data
function processTransactions(transactions: Transaction[], range: Range) {
    const now = new Date();
    
    // Initialize data structure based on range
    let categories: string[] = [];
    let dataIn: number[] = [];
    let dataOut: number[] = [];
    
    if (range === 'week') {
        // Last 7 days
        categories = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const counts = Array(7).fill(0).map(() => ({ in: 0, out: 0 }));
        
        transactions.forEach(t => {
            const date = new Date(t.transactionDate);
            const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff < 7 && daysDiff >= 0) {
                const dayIndex = (date.getDay() + 6) % 7; // Convert to Monday = 0
                if (t.transactionType === 'Thu') {
                    counts[dayIndex].in += t.amount / 1000; // Convert to thousands
                } else {
                    counts[dayIndex].out += t.amount / 1000;
                }
            }
        });
        
        dataIn = counts.map(c => Math.round(c.in));
        dataOut = counts.map(c => Math.round(c.out));
        
    } else if (range === 'month') {
        // Last 5 weeks
        categories = ['W1', 'W2', 'W3', 'W4', 'W5'];
        const counts = Array(5).fill(0).map(() => ({ in: 0, out: 0 }));
        
        transactions.forEach(t => {
            const date = new Date(t.transactionDate);
            const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(daysDiff / 7);
            if (weekIndex < 5 && weekIndex >= 0) {
                if (t.transactionType === 'Thu') {
                    counts[4 - weekIndex].in += t.amount / 1000;
                } else {
                    counts[4 - weekIndex].out += t.amount / 1000;
                }
            }
        });
        
        dataIn = counts.map(c => Math.round(c.in));
        dataOut = counts.map(c => Math.round(c.out));
        
    } else {
        // Last 12 months
        categories = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        const counts = Array(12).fill(0).map(() => ({ in: 0, out: 0 }));
        
        transactions.forEach(t => {
            const date = new Date(t.transactionDate);
            const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
            if (monthsDiff < 12 && monthsDiff >= 0) {
                const monthIndex = date.getMonth();
                if (t.transactionType === 'Thu') {
                    counts[monthIndex].in += t.amount / 1000;
                } else {
                    counts[monthIndex].out += t.amount / 1000;
                }
            }
        });
        
        dataIn = counts.map(c => Math.round(c.in));
        dataOut = counts.map(c => Math.round(c.out));
    }
    
    return { categories, in: dataIn, out: dataOut };
}

export default function TwoLineChart({ transactions }: TwoLineChartProps) {
    const [range, setRange] = useState<Range>('month');

    const dataset = useMemo(() => {
        return processTransactions(transactions, range);
    }, [transactions, range]);

    const options = useMemo(() => ({
        chart: {
            toolbar: { show: false },
            foreColor: '#94a3b8',
            animations: { enabled: true, easing: 'easeinout', speed: 400 },
        },
        stroke: { curve: 'smooth' as const, width: 3 },
        colors: ['#ef4444', '#22c55e'], 
        legend: { position: 'top' as const, horizontalAlign: 'left' as const },
        markers: { size: 0, hover: { size: 5 } },
        xaxis: {
            categories: dataset.categories,
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { fontSize: '12px' } },
        },
        yaxis: {
            labels: { style: { fontSize: '12px' } },
        },
        grid: {
            yaxis: { lines: { show: false } },
            xaxis: { lines: { show: false } },
            strokeDashArray: 0,
            padding: { left: 8, right: 8, top: 6, bottom: 0 },
        },
        tooltip: {
            theme: 'dark' as const,
            y: { 
                formatter: (val: number) => {
                    // Convert from thousands back to full amount
                    const amount = val * 1000;
                    return `${Math.round(amount).toLocaleString('vi-VN')} đ`;
                }
            },
        },
    }), [dataset.categories]);

    const series = useMemo(() => ([
        { name: 'Tiền ra', data: dataset.out },
        { name: 'Tiền vào', data: dataset.in },
    ]), [dataset]);

    return (
        <div className="rounded-2xl p-4 bg-background shadow-xl min-h-[340px]">

            <div style={{ height: 270 }}>
                <Chart options={options} series={series} type="line" height={270} />
            </div>

            <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2">
                    <Tab  active={range === 'week'} onClick={() => setRange('week')}>
                        Theo tuần
                    </Tab>
                    <Tab active={range === 'month'} onClick={() => setRange('month')}>
                        Theo tháng
                    </Tab>
                    <Tab active={range === 'year'} onClick={() => setRange('year')}>
                        Theo năm
                    </Tab>
                </div>
            </div>
        </div>
    );
}