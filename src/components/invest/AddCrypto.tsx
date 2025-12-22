"use client";

import React, { useEffect, useState } from "react";
import useCrypto from "@/services/useCrypto";
import { Crypto } from "@/type/Crypto";
import { Loader2 } from "lucide-react";

interface AddCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AddCryptoData) => void;
  loading?: boolean;
  fundId: string;
}

interface AddCryptoData {
  id: string;
  assetName: string;
  assetSymbol: string;
  idFund: string;
}

const AddCrypto = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  fundId,
}: AddCryptoModalProps) => {
  const { getCryptoList, cryptoLoading } = useCrypto();
  const [cryptoList, setCryptoList] = useState<Crypto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto | null>(null);
  const [step, setStep] = useState<"select" | "form">("select");

  useEffect(() => {
    if (isOpen) {
      fetchCryptoList();
    }
  }, [isOpen]);

  const fetchCryptoList = async () => {
    try {
      const data = await getCryptoList();
      setCryptoList(data?.data || []);
    } catch (error) {
      console.error("Error fetching crypto list:", error);
    }
  };

  const filteredCryptoList = cryptoList.filter(
    (crypto) =>
      crypto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCrypto = (crypto: Crypto) => {
    setSelectedCrypto(crypto);
    setStep("form");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCrypto) {
      onSubmit?.({
        id: selectedCrypto.id,
        assetName: selectedCrypto.name,
        assetSymbol: selectedCrypto.symbol,
        idFund: fundId,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedCrypto(null);
    setStep("select");
    onClose();
  };

  const handleBack = () => {
    setStep("select");
    setSelectedCrypto(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-foreground rounded-3xl shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute cursor-pointer top-6 right-6 text-text/60 hover:text-text transition-colors z-10"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {step === "select" ? (
          // Step 1: Select Crypto
          <>
            <div className="p-8 pb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-text mb-6 text-center">
                Chọn tiền ảo
              </h2>

              {/* Search Bar */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 bg-background text-text rounded-lg border border-text/20 
                                             focus:outline-none focus:ring-2 focus:ring-text/30 focus:border-transparent
                                             placeholder:text-text/50 transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text opacity-50"
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
              </div>
            </div>

            {/* Crypto List */}
            <div className="flex-1 overflow-y-auto nice-scroll px-8 pb-8">
              {cryptoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-text" size={32} />
                </div>
              ) : filteredCryptoList.length > 0 ? (
                <div className="space-y-2">
                  {filteredCryptoList.map((crypto) => (
                    <button
                      key={crypto.id}
                      onClick={() => handleSelectCrypto(crypto)}
                      className="w-full cursor-pointer p-4 bg-background rounded-lg hover:bg-text/5 transition-all 
                                                     border border-text/10 hover:border-text/20 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <div className="font-semibold text-text">
                              {crypto.name}
                            </div>
                            <div className="text-xs text-text/60 uppercase">
                              {crypto.symbol}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-text">
                            {formatPrice(crypto.current_price)}
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              crypto.price_change_percentage_24h >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                            {crypto.price_change_percentage_24h?.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text/60">Không tìm thấy tiền ảo</p>
                </div>
              )}
            </div>
          </>
        ) : (
          // Step 2: Enter Amount Form
          <div className="p-8">
            <button
              onClick={handleBack}
              className="mb-4 cursor-pointer flex items-center gap-2 text-text/60 hover:text-text transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Quay lại
            </button>

            <h2 className="text-2xl font-bold text-text mb-6 text-center">
              Thêm {selectedCrypto?.name}
            </h2>

            {/* Selected Crypto Info */}
            {selectedCrypto && (
              <div className="mb-6 p-4 bg-background rounded-lg border border-text/10">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedCrypto.image}
                    alt={selectedCrypto.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-text">
                      {selectedCrypto.name}
                    </div>
                    <div className="text-sm text-text/60">
                      {formatPrice(selectedCrypto.current_price)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-background rounded-lg border border-text/10">
                <p className="text-text/70 text-sm mb-2">
                  Bạn có chắc chắn muốn thêm tiền ảo này vào quỹ?
                </p>
                <div className="text-text font-medium">
                  {selectedCrypto?.name} ({selectedCrypto?.symbol.toUpperCase()}
                  )
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 px-6 py-3 bg-background text-text font-semibold rounded-full
                                         hover:brightness-110 active:scale-[0.98] transition-all shadow-lg
                                         cursor-pointer border border-text/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang thêm..." : "Thêm vào quỹ"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCrypto;
