"use client";

import { useEffect, useState } from "react";
import usePackage from "@/services/usePackage";
import usePayment from "@/services/usePayment";
import { useUserContext } from "@/context";
import { Loader2 } from "lucide-react";

export default function BuyPage() {
  const { getPackages, packageLoading } = usePackage();
  const { createPayment, paymentLoading } = usePayment();
  const context = useUserContext();
  const userId = context?.user?.idUser;

  const [packages, setPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        const res = await getPackages();
        if (res?.success && Array.isArray(res.data)) {
          setPackages(res.data);
        } else {
          setError("Không lấy được danh sách gói");
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải gói");
      }
    };
    load();
  }, []);

  const handleBuy = async (pkg: any) => {
    if (!userId) {
      alert("Vui lòng đăng nhập");
      return;
    }
    setBuyingId(pkg.idPackage);
    try {
      const body = {
        idUser: userId,
        idPackage: pkg.idPackage,
        amount: pkg.price,
      };
      const res = await createPayment(body);
      if (res?.success && res?.data?.orderUrl) {
        // redirect to payment URL
        window.location.href = res.data.orderUrl;
      } else {
        alert(res?.message || "Không thể tạo thanh toán");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo thanh toán");
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mua gói Premium</h1>

        {packageLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 text-red-600 rounded">{error}</div>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.idPackage}
                className="p-4 border rounded-lg bg-[var(--foreground)]/60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">
                      {pkg.packageName}
                    </div>
                    <div className="text-sm text-slate-300">
                      {pkg.description}
                    </div>
                    <div className="text-sm mt-2">
                      Giá: {pkg.price?.toLocaleString()} VND
                    </div>
                    <div className="text-sm">
                      Thời hạn: {pkg.durationDays} ngày
                    </div>
                    <div className="text-sm mt-2">
                      Quyền:{" "}
                      {pkg.permissions
                        ?.map((p: any) => p.permissionName)
                        .join(", ")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {pkg.packageName === "BASIC" ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-500 text-white rounded-md cursor-not-allowed"
                      >
                        Mặc định
                      </button>
                    ) : pkg.bought ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-green-600 text-white rounded-md cursor-not-allowed"
                      >
                        Đã có
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(pkg)}
                        disabled={buyingId === pkg.idPackage}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                      >
                        {buyingId === pkg.idPackage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Mua gói"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
