"use client";

import React, { useEffect, useState } from "react";
import useFund from "@/services/useFund";
// [EDIT 1] Import icon Coins
import { Loader2, Coins } from "lucide-react";

interface AddGoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: AddGoldData) => void;
  loading?: boolean;
  fundId: string;
}

export interface AddGoldData {
  id: string;
  assetName: string;
  mappingKey: string;
  idFund: string;
}

interface GoldPriceItem {
  id: string;
  name: string;
  type: string;
  buyPrice: number;
  sellPrice: number;
  location: string;
  lastUpdated: string;
}

const AddGold = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  fundId,
}: AddGoldModalProps) => {
  const { getGoldPrice } = useFund();
  const [goldList, setGoldList] = useState<GoldPriceItem[]>([]);
  const [fetching, setFetching] = useState(false);
  const [selectedGold, setSelectedGold] = useState<GoldPriceItem | null>(null);
  const [step, setStep] = useState<"select" | "confirm">("select");

  useEffect(() => {
    if (isOpen) {
      fetchGoldPrice();
    }
  }, [isOpen]);

  const fetchGoldPrice = async () => {
    setFetching(true);
    try {
      const res = await getGoldPrice();
      if (res?.data?.sjcGold) {
        setGoldList(res.data.sjcGold);
      }
    } catch (error) {
      console.error("Failed to fetch gold prices", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSelectGold = (gold: GoldPriceItem) => {
    setSelectedGold(gold);
    setStep("confirm");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGold && onSubmit) {
      onSubmit({
        id: selectedGold.id,
        assetName: selectedGold.name,
        mappingKey: selectedGold.type,
        idFund: fundId,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedGold(null);
    setStep("select");
    onClose();
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
          className="absolute cursor-pointer top-6 right-6 text-text/60 hover:text-text z-10"
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
          <>
            <div className="p-8 pb-4 flex-shrink-0">
              <h2 className="text-2xl font-bold text-text mb-2 text-center">
                Chọn loại Vàng (SJC)
              </h2>
              <p className="text-center text-text/60 text-sm">
                Giá được cập nhật theo thời gian thực
              </p>
            </div>

            <div className="flex-1 overflow-y-auto nice-scroll px-8 pb-8">
              {fetching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-text" size={32} />
                </div>
              ) : goldList.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {goldList.map((gold) => (
                    <button
                      key={gold.id}
                      onClick={() => handleSelectGold(gold)}
                      className="w-full cursor-pointer p-4 bg-background rounded-xl hover:bg-yellow-500/10 transition-all border border-text/10 hover:border-yellow-500/50 text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* [EDIT 2] Thay thế chữ SJC bằng Icon Coins */}
                          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-600">
                            <Coins className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="font-semibold text-text group-hover:text-yellow-600 transition-colors">
                              {gold.name}
                            </div>
                            <div className="text-xs text-text/60">
                              Mua: {formatPrice(gold.buyPrice)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-text/60">Bán ra</div>
                          <div className="font-bold text-yellow-600 text-lg">
                            {formatPrice(gold.sellPrice)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text/60">Không tải được giá vàng</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-8">
            <button
              onClick={() => setStep("select")}
              className="mb-4 cursor-pointer flex items-center gap-2 text-text/60 hover:text-text"
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
              Chọn lại
            </button>

            <h2 className="text-2xl font-bold text-text mb-6 text-center">
              Xác nhận thêm Vàng
            </h2>

            {selectedGold && (
              <div className="bg-background border border-yellow-500/30 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text/60">Loại vàng</span>
                  <div className="flex items-center gap-2">
                    {/* [EDIT 3] Icon Coins ở màn hình xác nhận */}
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-text">
                      {selectedGold.name}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text/60">Mã (Type)</span>
                  <span className="font-mono text-sm bg-text/5 px-2 py-1 rounded">
                    {selectedGold.type}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-text/10">
                  <span className="text-text/60">Giá ghi nhận (Bán ra)</span>
                  <span className="font-bold text-yellow-500 text-xl">
                    {formatPrice(selectedGold.sellPrice)}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-full shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : "Thêm vào quỹ"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGold;
