'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ApexOptions } from 'apexcharts';
import { FinanceDasboard } from '@/type/Dashboard';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DonutChartProps {
  financeData: FinanceDasboard | null;
}

export default function DonutChart({ financeData }: DonutChartProps) {
  const labels = ['Tiền mặt', 'Crypto'];
  const series: number[] = [
    financeData?.cashPercent || 0,
    financeData?.cryptoPercent || 0,
  ];

  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'donut',
      toolbar: { show: false },
      foreColor: '#94a3b8',
    },
    colors: ['#f59e0b', '#34d399'],
    labels,
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      markers: { size: 10, offsetX: 0, offsetY: 0 },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    tooltip: {
      y: { formatter: (val: number) => `${val.toFixed(2)}%` },
    },
   
    grid: { padding: { top: 0, bottom: 0, left: 0, right: 0 } },
    responsive: [
      { breakpoint: 480, options: { chart: { height: 240 }, legend: { fontSize: '11px' } } },
    ],
  }), [labels]);

  return (
    <div className="rounded-2xl shadow-xl bg-background p-4 min-h-[340px]">
      <div className="text-sm text-text font-bold opacity-80 mb-2">Tài chính</div>
      <ReactApexChart options={options} series={series} type="donut" height={260} />
    </div>
  );
}
