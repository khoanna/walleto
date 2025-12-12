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
  MoreHorizontal,
  Edit3,
  Trash2,
  ArrowRight,
  Calendar,
} from "lucide-react"; // Khuyên dùng lucide-react cho icon đẹp hơn

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
    <div className="w-full h-full flex flex-col p-2 sm:p-4 lg:p-6">
      {/* --- Header Area --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-500" />
            Quản lý quỹ
          </h1>
          <p className="text-text/50 text-sm mt-1">
            Theo dõi hiệu suất và phân bổ tài sản của bạn
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 
                     text-white font-medium rounded-lg shadow-lg shadow-blue-500/20 
                     transition-all duration-200 text-base active:scale-95"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Tạo quỹ mới
        </button>
      </div>

      {/* --- Grid Content --- */}
      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar pr-1">
        {funds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text/40 border border-dashed border-text/10 rounded-xl bg-background/30">
            <FolderOpen className="w-12 h-12 mb-3 opacity-20" />
            <p>Chưa có quỹ nào được tạo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {funds.map((fund) => (
              <div
                key={fund.idFund}
                onClick={() =>
                  router.push(`/dashboard/portfolio/${fund.idFund}`)
                }
                className="group relative bg-background border border-border/50 hover:border-blue-500/50 
                           rounded-xl pt-10 px-5 pb-5 cursor-pointer transition-all duration-300 
                           hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 overflow-hidden"
              >
                {/* Date - Moved to top-left */}
                <div className="absolute top-2 left-2 z-10 p-2 text-xs text-text/40 font-medium flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-md  ">
                  <Calendar size={12} className="text-blue-500" />
                  <span>
                    {new Date(fund.createAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                {/* Decoration Gradient Background on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* --- Card Header: Icon & Actions --- */}
                <div className="relative flex justify-between items-start mb-4 z-10">
                  {/* Fund Icon / Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 
                                border border-border flex items-center justify-center text-xl font-bold text-blue-600 shadow-sm"
                  >
                    {fund.fundName.charAt(0).toUpperCase()}
                  </div>

                  {/* Actions (Edit/Delete) - Always visible on mobile, hover on desktop if preferred, but simpler to keep visible or subtle */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleEditFund(e, fund)}
                      className="p-2 text-text/40 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) =>
                        handleDeleteFund(e, fund.idFund, fund.fundName)
                      }
                      className="p-2 text-text/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Xóa quỹ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* --- Card Body: Info --- */}
                <div className="relative z-10 mb-6">
                  <h3 className="text-lg font-bold text-text mb-1 group-hover:text-blue-500 transition-colors line-clamp-1">
                    {fund.fundName}
                  </h3>
                  <p className="text-sm text-text/50 line-clamp-2 h-10 leading-relaxed">
                    {fund.description || "Chưa có mô tả cho quỹ này."}
                  </p>
                </div>

                {/* --- Card Footer: CTA Arrow --- */}
                <div className="relative z-10 flex items-center justify-end pt-4">
                  {/* CTA Button - Replaced Text with Icon to prevent overflow */}
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full 
                                  bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400
                                  group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
                  >
                    <ArrowRight
                      size={22}
                      className="-ml-0.5 group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Modals (Giữ nguyên) --- */}
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
