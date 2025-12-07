"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  MessageSquare,
  Image as ImageIcon,
  TrendingUp,
  Wallet,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Trash2,
  Clock,
  CheckCheck,
  Undo2,
  Search,
  ChevronLeft,
} from "lucide-react";
import { useUserContext } from "@/context";
import { useAdmin } from "@/services/useAdmin";
import { getToken } from "@/services/Token";
import { decodeJWT } from "@/services/JwtDecoder";
import { Post } from "@/type/Social";

const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ADMIN_ROLE = "ADMIN";

type TabType = "pending" | "approved";
type ActionType = "approve" | "reject" | "delete";

// Image with fallback component
const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div className={`${fallbackClassName || className} bg-white/10 flex items-center justify-center`}>
        <ImageIcon className="w-8 h-8 text-slate-500" />
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className={`${className} bg-white/10 flex items-center justify-center absolute inset-0 z-10`}>
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={() => {
          console.log('Image load error:', src);
          setError(true);
        }}
        onLoad={() => setLoading(false)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

// Toast notification component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-xl shadow-2xl z-[100] flex items-center gap-3 animate-slide-up`}
    >
      {type === "success" && <CheckCircle className="w-5 h-5" />}
      {type === "error" && <XCircle className="w-5 h-5" />}
      {type === "info" && <AlertTriangle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

// Confirmation Modal
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText,
  confirmColor,
  onConfirm,
  onCancel,
  loading,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: "green" | "red" | "amber";
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  const colorClasses = {
    green: "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
    red: "from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700",
    amber: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
      <div className="bg-[#0D1B2A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-up">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${colorClasses[confirmColor]} text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const context = useUserContext();
  const user = context?.user;
  const isLoading = context?.isLoading;

  const {
    getListPostNotApproved,
    getListPosApproved,
    approvePost,
    rejectPost,
    deletePost,
  } = useAdmin();

  // States
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [approvedPosts, setApprovedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Toast & Modal states
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    postId: string;
    action: ActionType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    postId: "",
    action: "approve",
    title: "",
    message: "",
  });

  // Stats
  const [stats, setStats] = useState({
    approvedToday: 0,
    rejectedToday: 0,
  });

  // Check admin role
  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJWT(token);
      const role = decoded?.[ROLE_KEY];
      if (role === ADMIN_ROLE) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push("/dashboard");
      }
    } else if (!isLoading) {
      router.push("/auth");
    }
  }, [isLoading, router]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const [pendingRes, approvedRes] = await Promise.all([
        getListPostNotApproved(),
        user?.idUser ? getListPosApproved(user.idUser) : Promise.resolve({ data: [] }),
      ]);
      setPendingPosts(pendingRes?.data || []);
      setApprovedPosts(approvedRes?.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setToast({ message: "Có lỗi khi tải danh sách bài viết", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [user?.idUser]);

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin, fetchPosts]);

  // Get current posts based on active tab
  const currentPosts = activeTab === "pending" ? pendingPosts : approvedPosts;

  // Filter posts by search
  const filteredPosts = currentPosts.filter(
    (post) =>
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.userOfPostResponse?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show confirmation modal
  const showConfirm = (postId: string, action: ActionType) => {
    const configs = {
      approve: {
        title: "Phê duyệt bài viết",
        message: "Bài viết sẽ được hiển thị công khai trên mạng xã hội. Bạn có chắc chắn?",
      },
      reject: {
        title: "Hủy duyệt bài viết",
        message: "Bài viết sẽ bị gỡ khỏi mạng xã hội và chuyển về trạng thái chờ duyệt.",
      },
      delete: {
        title: "Xóa bài viết",
        message: "Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục. Bạn có chắc chắn?",
      },
    };

    setConfirmModal({
      isOpen: true,
      postId,
      action,
      ...configs[action],
    });
  };

  // Handle confirm action
  const handleConfirmAction = async () => {
    const { postId, action } = confirmModal;
    setActionLoading(postId);

    try {
      switch (action) {
        case "approve":
          await approvePost(postId);
          setStats((prev) => ({ ...prev, approvedToday: prev.approvedToday + 1 }));
          setToast({ message: "Đã phê duyệt bài viết thành công!", type: "success" });
          break;

        case "reject":
          await rejectPost(postId);
          setStats((prev) => ({ ...prev, rejectedToday: prev.rejectedToday + 1 }));
          setToast({ message: "Đã hủy duyệt bài viết!", type: "info" });
          break;

        case "delete":
          await deletePost(postId);
          setToast({ message: "Đã xóa bài viết!", type: "success" });
          break;
      }

      // Clear selected post if it was the one being actioned
      if (selectedPost?.idPost === postId) {
        setSelectedPost(null);
        setShowMobileDetail(false);
      }

      // Reload posts after action
      await fetchPosts();
    } catch (error) {
      console.error(`Error ${action} post:`, error);
      setToast({ message: `Có lỗi khi thực hiện thao tác`, type: "error" });
    } finally {
      setActionLoading(null);
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Handle post selection
  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setShowMobileDetail(true);
  };

  // Loading state
  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1F3A] to-[#050F24] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0F1F3A] to-[#050F24]">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={
          confirmModal.action === "approve"
            ? "Phê duyệt"
            : confirmModal.action === "reject"
            ? "Hủy duyệt"
            : "Xóa"
        }
        confirmColor={
          confirmModal.action === "approve"
            ? "green"
            : confirmModal.action === "reject"
            ? "amber"
            : "red"
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        loading={actionLoading === confirmModal.postId}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs sm:text-sm text-slate-400">Quản lý nội dung</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={fetchPosts}
                disabled={loading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Làm mới"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <span className="text-sm text-slate-300">{user?.name || "Admin"}</span>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Về Dashboard"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pendingPosts.length}</p>
                <p className="text-xs sm:text-sm text-slate-400">Chờ duyệt</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CheckCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{approvedPosts.length}</p>
                <p className="text-xs sm:text-sm text-slate-400">Đã duyệt</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.approvedToday}</p>
                <p className="text-xs sm:text-sm text-slate-400">Duyệt hôm nay</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Undo2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.rejectedToday}</p>
                <p className="text-xs sm:text-sm text-slate-400">Hủy hôm nay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "pending"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Chờ duyệt</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {pendingPosts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "approved"
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCheck className="w-4 h-4" />
              <span>Đã duyệt</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                {approvedPosts.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Posts List */}
          <div
            className={`lg:col-span-2 bg-[#0D1B2A]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden ${
              showMobileDetail ? "hidden lg:block" : ""
            }`}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                Danh sách bài viết
              </h2>
              <span className="text-sm text-slate-400">{filteredPosts.length} bài</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={36} />
                  <p className="text-slate-400">Đang tải...</p>
                </div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                {searchQuery ? (
                  <>
                    <Search className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg mb-2">Không tìm thấy kết quả</p>
                    <p className="text-slate-500 text-sm">Thử tìm kiếm với từ khóa khác</p>
                  </>
                ) : activeTab === "pending" ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500/50 mb-4" />
                    <p className="text-slate-400 text-lg mb-2">Tuyệt vời!</p>
                    <p className="text-slate-500 text-sm">Không có bài viết nào chờ duyệt</p>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg mb-2">Chưa có bài viết</p>
                    <p className="text-slate-500 text-sm">Các bài viết đã duyệt sẽ hiển thị ở đây</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredPosts.map((post) => (
                  <div
                    key={post.idPost}
                    className={`p-4 hover:bg-white/5 transition-all cursor-pointer group ${
                      selectedPost?.idPost === post.idPost
                        ? "bg-blue-500/10 border-l-4 border-blue-500"
                        : "border-l-4 border-transparent"
                    }`}
                    onClick={() => handleSelectPost(post)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="shrink-0 relative">
                        {post.userOfPostResponse?.urlAvatar ? (
                          <img
                            src={post.userOfPostResponse.urlAvatar}
                            alt={post.userOfPostResponse.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                            <span className="text-white font-semibold">
                              {post.userOfPostResponse?.name?.charAt(0) || "U"}
                            </span>
                          </div>
                        )}
                        {/* Status indicator */}
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0D1B2A] ${
                            activeTab === "pending" ? "bg-amber-500" : "bg-green-500"
                          }`}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm truncate">
                            {post.userOfPostResponse?.name || "Unknown User"}
                          </span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500">
                            {new Date(post.createAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        <p className="text-slate-300 text-sm line-clamp-2 mb-2">
                          {post.content || "Không có nội dung"}
                        </p>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.urlImage && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                              <ImageIcon className="w-3 h-3" /> Ảnh
                            </span>
                          )}
                          {post.snapshotResponse?.[0]?.transactionOfPosts && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                              <Wallet className="w-3 h-3" /> Cashflow
                            </span>
                          )}
                          {post.snapshotResponse?.[0]?.investmentAssetOfPosts && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                              <TrendingUp className="w-3 h-3" /> Portfolio
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Actions - Always visible on mobile */}
                      <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        {activeTab === "pending" ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm(post.idPost, "approve");
                              }}
                              disabled={actionLoading === post.idPost}
                              className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                              title="Phê duyệt"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm(post.idPost, "delete");
                              }}
                              disabled={actionLoading === post.idPost}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm(post.idPost, "reject");
                              }}
                              disabled={actionLoading === post.idPost}
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors"
                              title="Hủy duyệt"
                            >
                              <Undo2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showConfirm(post.idPost, "delete");
                              }}
                              disabled={actionLoading === post.idPost}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Post Detail */}
          <div
            className={`lg:col-span-3 bg-[#0D1B2A]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden ${
              !showMobileDetail ? "hidden lg:block" : ""
            }`}
          >
            {/* Mobile back button */}
            <div className="lg:hidden p-4 border-b border-white/10">
              <button
                onClick={() => {
                  setShowMobileDetail(false);
                  setSelectedPost(null);
                }}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Quay lại danh sách</span>
              </button>
            </div>

            <div className="hidden lg:block p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                Chi tiết bài viết
              </h2>
            </div>

            {selectedPost ? (
              <div className="flex flex-col h-[calc(100vh-300px)]">
                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {/* Status Banner */}
                  <div
                    className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
                      selectedPost.isApproved
                        ? "bg-green-500/10 border border-green-500/20"
                        : "bg-amber-500/10 border border-amber-500/20"
                    }`}
                  >
                  {selectedPost.isApproved ? (
                    <>
                      <CheckCheck className="w-6 h-6 text-green-500" />
                      <div>
                        <p className="text-green-400 font-medium">Đã được phê duyệt</p>
                        <p className="text-green-400/70 text-sm">
                          Bài viết đang hiển thị trên mạng xã hội
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-6 h-6 text-amber-500" />
                      <div>
                        <p className="text-amber-400 font-medium">Đang chờ duyệt</p>
                        <p className="text-amber-400/70 text-sm">
                          Bài viết cần được admin phê duyệt
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  {selectedPost.userOfPostResponse?.urlAvatar ? (
                    <img
                      src={selectedPost.userOfPostResponse.urlAvatar}
                      alt={selectedPost.userOfPostResponse.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/10">
                      <span className="text-white font-bold text-lg">
                        {selectedPost.userOfPostResponse?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {selectedPost.userOfPostResponse?.name || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedPost.createAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                    Nội dung
                  </h3>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-white whitespace-pre-wrap leading-relaxed">
                      {selectedPost.content || "Không có nội dung"}
                    </p>
                  </div>
                </div>

                {/* Image */}
                {selectedPost.urlImage && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider">
                      Hình ảnh đính kèm
                    </h3>
                    <ImageWithFallback
                      src={selectedPost.urlImage}
                      alt="Post image"
                      className="w-full rounded-xl object-cover max-h-80 border border-white/10"
                      fallbackClassName="w-full h-48 rounded-xl border border-white/10"
                    />
                  </div>
                )}

                {/* Transactions */}
                {selectedPost.snapshotResponse?.[0]?.transactionOfPosts && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-green-500" />
                      Dữ liệu Cashflow
                    </h3>
                    <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/5">
                            <th className="text-left p-3 text-slate-400 font-medium">Tên giao dịch</th>
                            <th className="text-center p-3 text-slate-400 font-medium">Loại</th>
                            <th className="text-right p-3 text-slate-400 font-medium">Số tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedPost.snapshotResponse[0].transactionOfPosts.map((t, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                              <td className="p-3 text-white">{t.transactionName}</td>
                              <td className="p-3 text-center">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    t.transactionType === "Thu"
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {t.transactionType}
                                </span>
                              </td>
                              <td className="p-3 text-right text-white font-medium">
                                {t.amount.toLocaleString("vi-VN")}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Assets */}
                {selectedPost.snapshotResponse?.[0]?.investmentAssetOfPosts && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      Dữ liệu Portfolio
                    </h3>
                    <div className="grid gap-3">
                      {selectedPost.snapshotResponse[0].investmentAssetOfPosts.map((asset, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                        >
                          {asset.url && (
                            <img
                              src={asset.url}
                              alt={asset.assetName}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{asset.assetName}</p>
                            <p className="text-slate-400 text-sm">{asset.assetSymbol}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {asset.currentPrice.toLocaleString("vi-VN")}đ
                            </p>
                            <p
                              className={`text-sm font-medium ${
                                asset.priceChangePercentage24h >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {asset.priceChangePercentage24h >= 0 ? "+" : ""}
                              {asset.priceChangePercentage24h.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                </div>
                
                {/* Fixed Action Buttons at bottom */}
                <div className="shrink-0 p-4 sm:p-6 border-t border-white/10 bg-[#0D1B2A] rounded-b-2xl">
                  {activeTab === "pending" || !selectedPost.isApproved ? (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => showConfirm(selectedPost.idPost, "approve")}
                        disabled={actionLoading === selectedPost.idPost}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
                      >
                        {actionLoading === selectedPost.idPost ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Phê duyệt
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => showConfirm(selectedPost.idPost, "delete")}
                        disabled={actionLoading === selectedPost.idPost}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                        Xóa bài viết
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => showConfirm(selectedPost.idPost, "reject")}
                        disabled={actionLoading === selectedPost.idPost}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all disabled:opacity-50"
                      >
                        {actionLoading === selectedPost.idPost ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Undo2 className="w-5 h-5" />
                            Hủy duyệt
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => showConfirm(selectedPost.idPost, "delete")}
                        disabled={actionLoading === selectedPost.idPost}
                        className="flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                        Xóa bài viết
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Eye className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg mb-2">Chọn một bài viết</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  Click vào bài viết bên trái để xem chi tiết và thực hiện thao tác
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
