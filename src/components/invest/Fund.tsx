"use client";

import React, { useEffect, useState } from "react";
import CreateFund from "./CreateFund";
import EditFund from "./EditFund";
import { useUserContext } from "@/context";
import useFund from "@/services/useFund";
import { FundItem } from "@/type/FundItem";
import { useRouter } from "next/navigation";
import {
  Plus,
  FolderOpen,
  Edit3,
  Trash2,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";

const Fund = () => {
  const router = useRouter();
  const userContext = useUserContext();
  const { createFund, getListFunds, fundLoading, updateFund, deleteFund } =
    useFund();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<FundItem | null>(null);
  const [funds, setFunds] = useState<FundItem[]>([]);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const data = await getListFunds(userContext?.user?.idUser || "");
        setFunds(data?.data || []);
      } catch (error) {
        console.error("Error fetching funds:", error);
      }
    };
    fetchFunds();
  }, []);

  const handleCreateFund = async (data: {
    fundName: string;
    fundDescription: string;
  }) => {
    const newFund = {
      fundName: data.fundName,
      description: data.fundDescription,
      idUser: userContext?.user?.idUser || "",
    };
    await createFund(newFund);
    const refreshData = await getListFunds(userContext?.user?.idUser || "");
    setFunds(refreshData?.data || []);
    setIsCreateModalOpen(false);
  };

  const handleEditFund = (e: React.MouseEvent, fund: FundItem) => {
    e.stopPropagation();
    setSelectedFund(fund);
    setIsEditModalOpen(true);
  };

  const handleUpdateFund = async (data: {
    fundName: string;
    description: string;
  }) => {
    const updatedFund = {
      fundName: data.fundName,
      description: data.description,
    };
    await updateFund(selectedFund?.idFund || "", updatedFund);
    const refreshData = await getListFunds(userContext?.user?.idUser || "");
    setFunds(refreshData?.data || []);
    setIsEditModalOpen(false);
  };

  const handleDeleteFund = async (
    e: React.MouseEvent,
    idFund: string,
    fundName: string
  ) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn xóa quỹ "${fundName}"?`)) {
      await deleteFund(idFund);
      const refreshData = await getListFunds(userContext?.user?.idUser || "");
      setFunds(refreshData?.data || []);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-2 sm:p-4">
      {/* --- Header Area --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            Quản lý quỹ
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Theo dõi hiệu suất và phân bổ tài sản của bạn
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto group flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 
                     text-primary-foreground font-medium rounded-lg shadow-lg shadow-primary/20 
                     transition-all duration-200 text-sm sm:text-base active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Tạo quỹ mới
        </button>
      </div>

      {/* --- Grid Content --- */}
      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-1">
        {funds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border border-dashed border-border rounded-xl bg-background/30">
            <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Chưa có quỹ nào được tạo.</p>
          </div>
        ) : (
          /* FIX GRID:
             - grid-cols-1: Mặc định (Mobile).
             - md:grid-cols-2: Tablet dọc (nếu không gian đủ).
             - lg:grid-cols-1: Desktop nhỏ (Vì có Sidebar 480px chiếm chỗ, nên cột còn lại hẹp -> về 1 cột).
             - xl:grid-cols-2: Desktop lớn (>= 1280px) -> Đủ chỗ cho 2 cột.
             - 2xl:grid-cols-3: Màn hình cực lớn -> 3 cột.
          */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
            {funds.map((fund) => (
              <div
                key={fund.idFund}
                onClick={() =>
                  router.push(`/dashboard/portfolio/${fund.idFund}`)
                }
                className="group relative bg-background border border-border hover:border-primary/20 
                           rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300 
                           hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 flex flex-col h-full"
              >
                {/* Decoration Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

                {/* --- Card Header: Icon & Actions --- */}
                <div className="relative flex justify-between items-start mb-4 z-10">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-muted 
                                border border-border flex items-center justify-center text-lg sm:text-xl font-bold text-primary shadow-sm flex-shrink-0"
                  >
                    {fund.fundName.charAt(0).toUpperCase()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditFund(e, fund)}
                      className="p-1.5 sm:p-2 text-text/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) =>
                        handleDeleteFund(e, fund.idFund, fund.fundName)
                      }
                      className="p-1.5 sm:p-2 text-text/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Xóa quỹ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* --- Card Body: Info --- */}
                <div className="relative z-10 flex-1 min-h-[60px]">
                  <h3 className="text-base sm:text-lg font-bold text-text mb-1 group-hover:text-primary transition-colors line-clamp-1 break-all">
                    {fund.fundName}
                  </h3>
                  <p className="text-xs sm:text-sm text-text/50 line-clamp-2 leading-relaxed">
                    {fund.description || "Chưa có mô tả cho quỹ này."}
                  </p>
                </div>

                {/* --- Card Footer: Date & Arrow --- */}
                <div className="relative z-10 flex items-center justify-between pt-4 mt-2 border-t border-border/30">
                  {/* Date - Moved here to avoid overlapping */}
                  <div className="flex items-center gap-1.5 text-xs text-text/40 font-medium">
                    <Clock size={12} className="text-primary" />
                    <span>
                      {new Date(fund.createAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  {/* CTA Arrow */}
                  <div
                    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full 
                                  bg-primary/10 text-primary
                                  group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    <ArrowRight
                      size={18}
                      className="-ml-0.5 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      <CreateFund
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateFund}
        loading={fundLoading}
      />

      <EditFund
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateFund}
        fundData={
          selectedFund
            ? {
                idFund: selectedFund.idFund,
                fundName: selectedFund.fundName,
                description: selectedFund.description,
              }
            : undefined
        }
        loading={fundLoading}
      />
    </div>
  );
};

export default Fund;
