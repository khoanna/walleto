'use client'

import useCrypto from '@/services/useCrypto';
import { Crypto } from '@/type/Crypto';
import React, { useEffect, useState } from 'react'


const CryptoTable = () => {
    const { getCryptoList } = useCrypto();
    const [cryptoData, setCryptoData] = useState<Crypto[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCryptoList();
            setCryptoData(data?.data);
        };
        fetchData();
    }, []);

    const filteredCryptoData = cryptoData?.filter((crypto) =>
        crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatPrice = (price: number) => {
        // For mobile, use more compact format
        if (window.innerWidth < 640 && price > 1000000) {
            return new Intl.NumberFormat('vi-VN', {
                notation: 'compact',
                compactDisplay: 'short',
                maximumFractionDigits: 1,
            }).format(price) + ' đ';
        }
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 2,
        }).format(num);
    };

   

    return (
        <div className='w-full h-full flex flex-col'>
            {/* Header Section */}
            <div className="flex-shrink-0 rounded-t-lg bg-background p-2 sm:p-3 lg:p-4 border border-b-0 border-text/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                    <div className='flex items-center justify-center md:justify-start w-full'>
                        <p className="text-base sm:text-xl lg:text-2xl font-bold text-text">Top 100 cryptocurrencies</p>
                    </div>
                    <div className="relative w-full sm:w-64 lg:w-80">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-9 sm:pl-11 bg-foreground text-text rounded-lg border border-text/20 
                                     focus:outline-none focus:ring-2 focus:ring-text/30 focus:border-transparent
                                     placeholder:text-text/50 transition-all shadow-md text-sm"
                        />
                        <svg
                            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-text opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-text opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="flex-1 bg-background rounded-lg rounded-t-none shadow-2xl overflow-hidden border border-t-0 border-text/10 flex flex-col min-h-0">
                <div className="overflow-x-auto overflow-y-auto nice-scroll flex-1">
                    <table className="w-full min-w-[640px]">
                        <thead className="border-b border-text/10 sticky bg-background top-0 z-10">
                            <tr>
                                <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">#</th>
                                <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">Coin</th>
                                <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-right text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">Price</th>
                                <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-right text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">24h %</th>
                                <th className="hidden md:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-right text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">Market Cap</th>
                                <th className="hidden lg:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-right text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">Volume</th>
                                <th className="hidden xl:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 text-right text-[10px] sm:text-xs font-semibold text-text uppercase tracking-wider whitespace-nowrap">Circ. Supply</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-text/5">
                            {filteredCryptoData?.map((crypto) => (
                                <tr
                                    key={crypto.id}
                                    className="hover:bg-text/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-xs sm:text-sm text-text font-medium">
                                        {crypto.market_cap_rank}
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-2 sm:space-x-3 overflow-hidden">
                                            <img
                                                src={crypto.image}
                                                alt={crypto.name}
                                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <div className="text-xs sm:text-sm font-semibold text-text truncate">{crypto.name}</div>
                                                <div className="text-[10px] sm:text-xs text-text opacity-60 uppercase">{crypto.symbol}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-semibold text-text">
                                        {formatPrice(crypto.current_price)}
                                    </td>
                                    <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right text-xs sm:text-sm font-bold">
                                        <span className={crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {crypto.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                                        </span>
                                    </td>

                                    <td className="hidden md:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right text-xs sm:text-sm text-text font-medium">
                                        {formatNumber(crypto.market_cap)}
                                    </td>
                                    <td className="hidden lg:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right text-xs sm:text-sm text-text">
                                        {formatNumber(crypto.total_volume)}
                                    </td>
                                    <td className="hidden xl:table-cell px-2 sm:px-3 lg:px-4 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-right text-xs sm:text-sm text-text">
                                        <div>{formatNumber(crypto.circulating_supply)} {crypto.symbol.toUpperCase()}</div>
                                        {crypto.max_supply && (
                                            <div className="text-[10px] sm:text-xs text-text opacity-50">
                                                Max: {formatNumber(crypto.max_supply)}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default CryptoTable