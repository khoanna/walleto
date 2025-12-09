"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { jwtDecode } from "jwt-decode";
import { getToken } from "@/services/Token";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAdmin } from "@/services/useAdmin";
import { UserManagement } from "@/components/admin/UserManagement";
import { Post, TransactionOfPost, InvestmentAssetOfPost } from "@/type/Social";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useUserContext } from "@/context";
import useAuth from "@/services/useAuth";

// Dynamic import Chart to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Constants
const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ADMIN_ROLE = "ADMIN";

// Helper to validate URL
const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || url.trim() === "") return false;
  // Allow relative URLs starting with /
  if (url.startsWith("/")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ImageWithFallback component
const ImageWithFallback = memo(function ImageWithFallback({
  src,
  alt,
  className,
  fill,
}: {
  src: string | undefined | null;
  alt: string;
  className?: string;
  fill?: boolean;
}) {
  const fallback = "/avatar.png";
  const validSrc = isValidImageUrl(src) ? src! : fallback;
  const [imgSrc, setImgSrc] = useState(validSrc);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isValidImageUrl(src)) {
      setImgSrc(src!);
      setHasError(false);
    } else {
      setImgSrc(fallback);
    }
  }, [src]);

  const handleError = useCallback(() => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
    }
  }, [hasError]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      fill={fill}
      onError={handleError}
    />
  );
});

// Toast component
const Toast = memo(function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={
          "px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm " +
          (type === "success"
            ? "bg-green-500/90 text-white"
            : "bg-red-500/90 text-white")
        }
      >
        <div className="flex items-center gap-2">
          {type === "success" ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
});

// ConfirmModal component
const ConfirmModal = memo(function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  type,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: "danger" | "warning" | "success";
}) {
  if (!isOpen) return null;

  const typeColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    success: "bg-green-500 hover:bg-green-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={"px-4 py-2 rounded-lg text-white transition-colors " + typeColors[type]}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

// Helper functions
const formatDateVN = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const formatCurrency = (num: number) => {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toFixed(2);
};

// PostCard component - Compact and clean version
const PostCard = memo(function PostCard({
  post,
  type,
  onApprove,
  onReject,
  onDelete,
}: {
  post: Post;
  type: "pending" | "approved";
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const snapshot = post.snapshotResponse?.[0] ?? {};
  const transactionData: TransactionOfPost[] | null = snapshot.transactionOfPosts ?? null;
  const assetData: InvestmentAssetOfPost[] | null = snapshot.investmentAssetOfPosts ?? null;
  
  const hasChart = transactionData && transactionData.length > 0;
  const hasAssets = assetData && assetData.length > 0;
  const postType = hasChart ? "cashflow" : hasAssets ? "portfolio" : "post";

  const chartOptions: ApexOptions = {
    chart: { 
      toolbar: { show: false },
      background: "transparent",
      sparkline: { enabled: false },
    },
    colors: ["#22C55E", "#EF4444"],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.4, opacityTo: 0.1 }
    },
    dataLabels: { enabled: true, style: { fontSize: "10px" } },
    xaxis: {
      categories: transactionData?.map((t) => t.transactionDate) || [],
      labels: { 
        show: true,
        formatter: (val: string) => formatDateVN(val),
        style: { colors: "#6b7280", fontSize: "9px" }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { theme: "dark" },
    legend: { 
      show: true, 
      position: "bottom",
      labels: { colors: "#9ca3af" },
      fontSize: "10px",
      markers: { size: 6 }
    }
  };

  const typeConfig = {
    cashflow: { label: "Cashflow", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    portfolio: { label: "Portfolio", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    post: { label: "Bài viết", color: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
  };

  return (
    <div className="bg-[#1a1a2e]/80 backdrop-blur rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Header - Compact */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10">
            <ImageWithFallback
              src={post.userOfPostResponse?.urlAvatar}
              alt={post.userOfPostResponse?.name || "Author"}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-white font-medium text-sm leading-tight">{post.userOfPostResponse?.name}</p>
            <p className="text-gray-500 text-[10px]">{formatDateVN(post.createAt)}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${typeConfig[postType].color}`}>
          {typeConfig[postType].label}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.title && <h3 className="text-white font-semibold text-sm mb-1">{post.title}</h3>}
        <p className="text-gray-400 text-xs line-clamp-2">{post.content}</p>
      </div>

      {/* Image - if any */}
      {post.urlImage && (
        <div className="relative w-full h-32 mx-4 mb-3 rounded-lg overflow-hidden" style={{ width: "calc(100% - 2rem)" }}>
          <ImageWithFallback src={post.urlImage} alt={post.title || ""} fill className="object-cover" />
        </div>
      )}

      {/* Data Section - Grows to fill space */}
      <div className="flex-grow flex flex-col justify-end">
        {/* Chart - Compact */}
        {hasChart && (
          <div className="mx-4 mb-3 rounded-xl bg-[#12121f] border border-white/5 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Biểu đồ Thu/Chi</p>
            </div>
            <div className="p-2">
              <Chart
                options={chartOptions}
                series={[
                  { name: "Thu", data: transactionData!.map((t) => t.transactionType === "Thu" ? t.amount : 0) },
                  { name: "Chi", data: transactionData!.map((t) => t.transactionType === "Chi" ? t.amount : 0) },
                ]}
                type="area"
                height={140}
              />
            </div>
          </div>
        )}

        {/* Assets - Compact Table */}
        {hasAssets && (
          <div className="mx-4 mb-3 rounded-xl bg-[#12121f] border border-white/5 overflow-hidden">
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Danh mục đầu tư</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-[10px] text-gray-500 border-b border-white/5">
                  <th className="text-left py-2 px-3 font-medium">Token</th>
                  <th className="text-right py-2 px-3 font-medium">Giá</th>
                  <th className="text-right py-2 px-3 font-medium">24h</th>
                </tr>
              </thead>
              <tbody>
                {assetData!.slice(0, 3).map((a, i) => (
                  <tr key={i} className="text-xs border-b border-white/5 last:border-0">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        {a.url && <img src={a.url} className="w-4 h-4 rounded-full" alt="" />}
                        <span className="text-white font-medium">{a.assetSymbol}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 px-3 text-gray-300">${formatCurrency(a.currentPrice)}</td>
                    <td className={`text-right py-2 px-3 font-medium ${a.priceChangePercentage24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {a.priceChangePercentage24h >= 0 ? "+" : ""}{a.priceChangePercentage24h.toFixed(2)}%
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          {assetData!.length > 3 && (
            <div className="text-center py-1.5 text-[10px] text-gray-500 border-t border-white/5">
              +{assetData!.length - 3} tokens khác
            </div>
          )}
        </div>
      )}
      </div>

      {/* Footer - Rating & Actions - Always at bottom */}
      <div className="px-4 pb-4 mt-auto border-t border-white/5 pt-3">
        <div className="flex items-center gap-1 mb-3 text-[11px] text-gray-500">
          <svg className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{post.evaluateResponse?.averageStars?.toFixed(1) || "0"} ({post.evaluateResponse?.totalComments || 0} đánh giá)</span>
        </div>
        
        <div className="flex gap-2">
          {type === "pending" ? (
            <>
              <button
                onClick={() => onApprove?.(post.idPost)}
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Duyệt bài
              </button>
              <button
                onClick={() => onReject?.(post.idPost)}
                className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => onDelete?.(post.idPost)}
              className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Xóa bài viết
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

type Section = "posts-pending" | "posts-approved" | "users";

export default function AdminPage() {
  const router = useRouter();
  const userContext = useUserContext();
  const user = userContext?.user;
  const { logout } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("posts-pending");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toast & Modal states
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "danger" | "warning" | "success";
    action: () => void;
  } | null>(null);

  // Logout handler
  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/auth");
  }, [logout, router]);

  // API hooks
  const {
    getListPostNotApproved,
    getListPosApproved,
    approvePost,
    rejectPost,
    deletePost,
  } = useAdmin();

  // Posts state
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: "",
    postType: "all" as "all" | "cashflow" | "portfolio" | "post",
    dateFrom: "",
    dateTo: "",
  });

  // Check authorization
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    try {
      const decoded = jwtDecode<Record<string, unknown>>(token);
      if (decoded && decoded[ROLE_KEY] === ADMIN_ROLE) {
        setIsAuthorized(true);
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/auth");
    }
  }, [router]);

  // Fetch posts - only once when authorized and user is loaded
  useEffect(() => {
    if (isAuthorized && !hasFetched && user?.idUser) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [pending, approved] = await Promise.all([
            getListPostNotApproved(),
            getListPosApproved(user.idUser),
          ]);
          setPendingPosts(pending?.data || []);
          setApprovedPosts(approved?.data || []);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          setIsLoading(false);
          setHasFetched(true);
        }
      };
      fetchData();
    }
  }, [isAuthorized, hasFetched, user?.idUser, getListPostNotApproved, getListPosApproved]);

  // Manual refresh function
  const refreshPosts = useCallback(async () => {
    if (!user?.idUser) return;
    setIsLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        getListPostNotApproved(),
        getListPosApproved(user.idUser),
      ]);
      setPendingPosts(pending?.data || []);
      setApprovedPosts(approved?.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.idUser, getListPostNotApproved, getListPosApproved]);

  // Actions
  const handleApprove = useCallback((id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Duyệt bài viết",
      message: "Bạn có chắc muốn duyệt bài viết này?",
      type: "success",
      action: async () => {
        try {
          await approvePost(id);
          setToast({ message: "Đã duyệt bài viết!", type: "success" });
          refreshPosts();
        } catch {
          setToast({ message: "Lỗi khi duyệt bài!", type: "error" });
        }
        setConfirmModal(null);
      },
    });
  }, [approvePost, refreshPosts]);

  const handleReject = useCallback((id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Từ chối bài viết",
      message: "Bạn có chắc muốn từ chối bài viết này?",
      type: "warning",
      action: async () => {
        try {
          await rejectPost(id);
          setToast({ message: "Đã từ chối bài viết!", type: "success" });
          refreshPosts();
        } catch {
          setToast({ message: "Lỗi khi từ chối bài!", type: "error" });
        }
        setConfirmModal(null);
      },
    });
  }, [rejectPost, refreshPosts]);

  const handleDelete = useCallback((id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Xóa bài viết",
      message: "Hành động này không thể hoàn tác. Bạn có chắc chắn?",
      type: "danger",
      action: async () => {
        try {
          await deletePost(id);
          setToast({ message: "Đã xóa bài viết!", type: "success" });
          refreshPosts();
        } catch {
          setToast({ message: "Lỗi khi xóa bài!", type: "error" });
        }
        setConfirmModal(null);
      },
    });
  }, [deletePost, refreshPosts]);

  // Stats
  const stats = useMemo(() => ({
    pending: pendingPosts.length,
    approved: approvedPosts.length,
  }), [pendingPosts.length, approvedPosts.length]);

  // Helper to determine post type
  const getPostType = useCallback((post: Post): "cashflow" | "portfolio" | "post" => {
    const snapshot = post.snapshotResponse?.[0] ?? {};
    const hasChart = snapshot.transactionOfPosts && snapshot.transactionOfPosts.length > 0;
    const hasAssets = snapshot.investmentAssetOfPosts && snapshot.investmentAssetOfPosts.length > 0;
    if (hasChart) return "cashflow";
    if (hasAssets) return "portfolio";
    return "post";
  }, []);

  // Filtered posts
  const filteredPendingPosts = useMemo(() => {
    return pendingPosts.filter((post) => {
      // Search by user name or content
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = !filters.searchTerm || 
        post.userOfPostResponse?.name?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.title?.toLowerCase().includes(searchLower);
      
      // Filter by post type
      const matchesType = filters.postType === "all" || getPostType(post) === filters.postType;
      
      // Filter by date range
      const postDate = new Date(post.createAt);
      const matchesDateFrom = !filters.dateFrom || postDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || postDate <= new Date(filters.dateTo + "T23:59:59");
      
      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [pendingPosts, filters, getPostType]);

  const filteredApprovedPosts = useMemo(() => {
    return approvedPosts.filter((post) => {
      // Search by user name or content
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = !filters.searchTerm || 
        post.userOfPostResponse?.name?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.title?.toLowerCase().includes(searchLower);
      
      // Filter by post type
      const matchesType = filters.postType === "all" || getPostType(post) === filters.postType;
      
      // Filter by date range
      const postDate = new Date(post.createAt);
      const matchesDateFrom = !filters.dateFrom || postDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || postDate <= new Date(filters.dateTo + "T23:59:59");
      
      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [approvedPosts, filters, getPostType]);

  // Reset filters when switching sections
  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    setFilters({ searchTerm: "", postType: "all", dateFrom: "", dateTo: "" });
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { id: "posts-pending" as Section, label: "Chờ duyệt", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", badge: stats.pending },
    { id: "posts-approved" as Section, label: "Đã duyệt", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "users" as Section, label: "Người dùng", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a14]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#12121f] transform transition-transform duration-300 lg:translate-x-0 " +
          (isSidebarOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Admin</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleSectionChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 " +
                (activeSection === item.id
                  ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white")
              }
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">
              {activeSection === "posts-pending" && "Bài viết chờ duyệt"}
              {activeSection === "posts-approved" && "Bài viết đã duyệt"}
              {activeSection === "users" && "Quản lý người dùng"}
            </h1>
            <p className="text-gray-400 mt-1">
              {activeSection === "posts-pending" && `${filteredPendingPosts.length}/${stats.pending} bài viết`}
              {activeSection === "posts-approved" && `${filteredApprovedPosts.length}/${stats.approved} bài viết`}
              {activeSection === "users" && "Quản lý tài khoản người dùng"}
            </p>
          </div>

          {/* Filter Bar - Only for posts sections */}
          {activeSection !== "users" && (
            <div className="mb-6 p-4 bg-[#1a1a2e]/80 backdrop-blur rounded-2xl border border-white/5">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Tìm theo tên người dùng, nội dung..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#12121f] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Post Type Filter */}
                <div className="w-full lg:w-48">
                  <select
                    value={filters.postType}
                    onChange={(e) => setFilters(prev => ({ ...prev, postType: e.target.value as typeof filters.postType }))}
                    className="w-full px-4 py-2.5 bg-[#12121f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    <option value="all">Tất cả loại</option>
                    <option value="cashflow">Cashflow</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="post">Bài viết</option>
                  </select>
                </div>

                {/* Date From */}
                <div className="w-full lg:w-44">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#12121f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
                    placeholder="Từ ngày"
                  />
                </div>

                {/* Date To */}
                <div className="w-full lg:w-44">
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#12121f] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors [color-scheme:dark]"
                    placeholder="Đến ngày"
                  />
                </div>

                {/* Clear Filters */}
                {(filters.searchTerm || filters.postType !== "all" || filters.dateFrom || filters.dateTo) && (
                  <button
                    onClick={() => setFilters({ searchTerm: "", postType: "all", dateFrom: "", dateTo: "" })}
                    className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          {activeSection === "users" ? (
            <UserManagement />
          ) : (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 auto-rows-fr">
                  {activeSection === "posts-pending" &&
                    (filteredPendingPosts.length > 0 ? (
                      filteredPendingPosts.map((post) => (
                        <PostCard
                          key={post.idPost}
                          post={post}
                          type="pending"
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-gray-400">
                          {pendingPosts.length > 0 ? "Không tìm thấy bài viết phù hợp" : "Không có bài viết nào chờ duyệt"}
                        </p>
                      </div>
                    ))}
                  {activeSection === "posts-approved" &&
                    (filteredApprovedPosts.length > 0 ? (
                      filteredApprovedPosts.map((post) => (
                        <PostCard
                          key={post.idPost}
                          post={post}
                          type="approved"
                          onDelete={handleDelete}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-400">
                          {approvedPosts.length > 0 ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào được duyệt"}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText="Xác nhận"
          cancelText="Hủy"
          onConfirm={confirmModal.action}
          onCancel={() => setConfirmModal(null)}
          type={confirmModal.type}
        />
      )}
    </div>
  );
}
