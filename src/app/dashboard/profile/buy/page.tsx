"use client";

import { useEffect, useState } from "react";
import usePackage from "@/services/usePackage";
import usePayment from "@/services/usePayment";
import { useUserContext } from "@/context";
import { Loader2, Crown, CheckCircle, XCircle } from "lucide-react";
import { Package } from "@/type/Package";

export default function BuyPage() {
  const { getPackages, packageLoading } = usePackage();
  const { createPayment, paymentLoading } = usePayment();
  const context = useUserContext();

  const userId = context?.user?.idUser;

  const [packages, setPackages] = useState<Package[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  // Thêm state cho modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // Format VNĐ #,###
  const formatMoney = (value: number) =>
    value.toLocaleString("en-US").replace(/,/g, ",");

  // Map permission text
  const mapPermission = (key: string) => {
    switch (key) {
      case "SOCIAL_NETWORK":
        return "Trao đổi cùng nhau trên blog";
      case "AI_CHATTING":
        return "Sử dụng chat bot thông minh";
      default:
        return null;
    }
  };

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setError("Vui lòng đăng nhập để xem gói");
        return;
      }

      try {
        setError(null);
        const res = await getPackages(userId);

        if (res?.success && Array.isArray(res.data)) {
          setPackages(res.data as Package[]);
        } else {
          setError("Không lấy được danh sách gói");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải gói");
      }
    };
    load();
  }, [userId]);

  // Hàm mở modal xác nhận
  const handleBuyClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setShowConfirmModal(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setSelectedPackage(null);
  };

  // Hàm xử lý mua thực sự
  const handleConfirmBuy = async () => {
    if (!selectedPackage || !userId) {
      handleCloseModal();
      return;
    }

    setBuyingId(selectedPackage.idPackage);

    try {
      const body = {
        idUser: userId,
        idPackage: selectedPackage.idPackage,
        amount: selectedPackage.price,
      };

      const res = await createPayment(body);
      if (res?.success && res?.data?.orderUrl) {
        window.location.href = res.data.orderUrl;
      } else {
        alert(res?.message || "Không thể tạo thanh toán");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo thanh toán");
    } finally {
      setBuyingId(null);
      handleCloseModal();
    }
  };

  // 3 quyền default
  const defaultPermissions = [
    "Quản lý dòng tiền",
    "Biểu đồ dòng tiền",
    "Quản lý chi tiêu cá nhân",
  ];

  return (
    <div className="min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Chọn gói phù hợp với bạn để có trải nghiệm tốt nhất
        </h1>
        <p className="text-slate-400 mb-12">
          Với nhiều tính năng thú vị và độc đáo đang chờ bạn
        </p>

        {packageLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-600 rounded">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages.map((pkg) => {
              const isBasic = pkg.packageName.toUpperCase() === "BASIC";

              const cardClass = isBasic
                ? "relative bg-white text-black border border-gray-200 shadow"
                : "relative bg-[#0C1222] text-white shadow-xl";

              return (
                <div
                  key={pkg.idPackage}
                  className={`rounded-2xl p-8 transition ${cardClass}`}
                >
                  {" "}
                  {!isBasic && (
                    <Crown className="h-6 w-6 text-yellow-400 absolute top-3 right-3 drop-shadow-md" />
                  )}
                  {/* Package name */}
                  <div className="uppercase text-sm tracking-wide opacity-70">
                    {pkg.packageName}
                  </div>
                  {/* Price */}
                  {pkg.price === 0 ? (
                    <div className="text-5xl font-bold mt-3">Miễn phí</div>
                  ) : (
                    <div className="text-5xl font-bold mt-3">
                      {formatMoney(pkg.price)}đ
                      <span className="text-base font-medium opacity-80">
                        {" "}
                        / tháng
                      </span>
                    </div>
                  )}
                  {/* Description */}
                  <p className="mt-4 text-sm opacity-80 leading-relaxed">
                    {pkg.description}
                  </p>
                  <hr className="my-6 opacity-20" />
                  {/* Permissions */}
                  <ul className="space-y-3 text-sm">
                    {/* 3 quyền mặc định */}
                    {defaultPermissions.map((p, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {p}
                      </li>
                    ))}

                    {/* Quyền dynamic từ API */}
                    {pkg.permissions?.map((p, i) => {
                      const mapped = mapPermission(p.permissionName);
                      if (!mapped) return null;

                      return (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {mapped}
                        </li>
                      );
                    })}

                    {/* Permission bị thiếu ở BASIC */}
                    {pkg.packageName === "BASIC" && (
                      <>
                        <li className="flex items-center gap-2 opacity-50">
                          <XCircle className="w-4 h-4 text-red-400" />
                          Trao đổi cùng nhau trên blog
                        </li>
                        <li className="flex items-center gap-2 opacity-50">
                          <XCircle className="w-4 h-4 text-red-400" />
                          Sử dụng chat bot thông minh
                        </li>
                      </>
                    )}
                  </ul>
                  {/* Button */}
                  <div className="mt-8">
                    {isBasic ? (
                      <button
                        disabled
                        className="w-full border rounded-full py-2 text-black pointer-events-none cursor-not-allowed"
                      >
                        Mặc định
                      </button>
                    ) : pkg.bought ? (
                      <button
                        disabled
                        className="w-full bg-red-700 text-white rounded-full py-2 cursor-not-allowed "
                      >
                        Hủy gói
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyClick(pkg)}
                        disabled={paymentLoading}
                        className="w-full bg-white text-black rounded-full py-2 font-semibold
                                   hover:bg-gray-100 transition disabled:opacity-50"
                      >
                        Mua ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal xác nhận */}
      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg text-black font-bold mb-2">
              Xác nhận mua gói
            </h3>
            <p className="text-gray-600  mb-4">
              Bạn có chắc chắn muốn mua gói{" "}
              <span className="font-semibold">
                {selectedPackage.packageName}
              </span>{" "}
              với giá{" "}
              <span className="font-semibold">
                {selectedPackage.price === 0
                  ? "Miễn phí"
                  : `${formatMoney(selectedPackage.price)}đ`}
              </span>
              ?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                disabled={buyingId === selectedPackage.idPackage}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmBuy}
                disabled={buyingId === selectedPackage.idPackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {buyingId === selectedPackage.idPackage && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
