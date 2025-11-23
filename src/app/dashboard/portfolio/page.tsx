'use client';

import CryptoTable from '@/components/invest/CryptoTable'
import Fund from '@/components/invest/Fund'
import useCrypto from '@/services/useCrypto';
import { Loader2 } from 'lucide-react';
import React from 'react'

const Portfolio = () => {
    const { cryptoLoading } = useCrypto();

    if (cryptoLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-text" size={48} />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col p-2 sm:p-3 lg:p-4 gap-3 sm:gap-4 overflow-hidden bg-foreground">
            {/* Crypto Table Section - Responsive height */}
            <div className='h-[45vh] sm:h-[48vh] flex-shrink-0 overflow-hidden'>
                <CryptoTable />
            </div>

            {/* Fund Section - Takes remaining space */}
            <div className='flex-1 min-h-0 overflow-hidden'>
                <Fund />
            </div>
        </div>
    )
}

export default Portfolio