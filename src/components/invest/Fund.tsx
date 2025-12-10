"use client";

import React, { useEffect, useState } from "react";
import CreateFund from "./CreateFund";
import EditFund from "./EditFund";
import { useUserContext } from "@/context";
import useFund from "@/services/useFund";
import { FundItem } from "@/type/FundItem";
import { useRouter } from "next/navigation";

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
    e.stopPropagation(); // Ngăn chặn click lan ra card
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
    <div className="w-full h-full flex flex-col p-2 sm:p-4 lg:p-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">
            Danh mục đầu tư
          </h1>
          <p className="text-text/50 text-sm mt-1">
            Quản lý và theo dõi hiệu suất các quỹ của bạn
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 
                             text-white font-medium rounded-full shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 
                             transform hover:-translate-y-0.5 transition-all duration-200 text-sm"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tạo quỹ mới
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
        {funds.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text/40 border-2 border-dashed border-text/10 rounded-2xl">
            <svg
              className="w-12 h-12 mb-3 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p>Chưa có quỹ nào. Hãy tạo quỹ đầu tiên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {funds.map((fund) => (
              <div
                key={fund.idFund}
                onClick={() =>
                  router.push(`/dashboard/portfolio/${fund.idFund}`)
                }
                className="group relative bg-background border border-text/10 rounded-2xl p-5 sm:p-6 
                                         hover:border-text/20 hover:shadow-2xl hover:shadow-black/5 transition-all duration-300 
                                         cursor-pointer flex flex-col justify-between min-h-[180px]"
              >
                {/* Gradient decoration top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-lg font-bold text-white shadow-inner">
                      {fund.fundName.charAt(0).toUpperCase()}
                    </div>

                    {/* Action Dropdown/Buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={(e) => handleEditFund(e, fund)}
                        className="p-2 hover:bg-text/10 rounded-full text-text/60 hover:text-blue-500 transition-colors"
                        title="Sửa"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) =>
                          handleDeleteFund(e, fund.idFund, fund.fundName)
                        }
                        className="p-2 hover:bg-red-500/10 rounded-full text-text/60 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-text mb-1 group-hover:text-blue-400 transition-colors">
                    {fund.fundName}
                  </h3>
                  <p className="text-sm text-text/50 line-clamp-2">
                    {fund.description || "Không có mô tả"}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-dashed border-text/10 flex items-center justify-between">
                  <span className="text-xs text-text/40 font-mono">
                    {new Date(fund.createAt).toLocaleDateString("vi-VN")}
                  </span>
                  <div className="text-xs font-medium text-blue-400 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500/20 transition-all duration-300">
                    Chi tiết
                    <svg
                        className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
