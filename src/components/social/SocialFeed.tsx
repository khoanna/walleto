"use client";
import React from "react";
import {
  User,
  MoreVertical,
  Edit,
  Trash2,
  MessageCircle,
  Star,
  Send,
  X,
  Heart,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  Post,
  TransactionOfPost,
  InvestmentAssetOfPost,
  ShareType,
  DateFilter,
  EvaluateResponse,
} from "@/type/Social";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// --- HELPER FUNCTIONS ---
interface UserAvatarProps {
  url: string | null | undefined;
  size?: string;
  iconSize?: number;
}

export const UserAvatar = ({
  url,
  size = "w-10 h-10",
  iconSize = 20,
}: UserAvatarProps) => {
  if (url && url.trim() !== "") {
    return (
      <img
        src={url}
        className={`${size} rounded-full object-cover bg-gray-100`}
        alt="Avatar"
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-muted flex items-center justify-center text-muted-foreground`}
    >
      <User size={iconSize} />
    </div>
  );
};

const formatDateVN = (d: string) => {
  if (!d) return "";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? ""
    : `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
};

const formatCurrency = (val: number) =>
  val >= 1e9
    ? (val / 1e9).toFixed(2) + "B"
    : val >= 1e6
    ? (val / 1e6).toFixed(2) + "M"
    : val.toLocaleString();

// --- COMPONENTS ---

interface PostFormProps {
  content: string;
  setContent: (v: string) => void;
  selectedImage: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  shareType: ShareType;
  setShareType: (t: ShareType) => void;
  chartData: TransactionOfPost[] | null;
  setChartData: (d: TransactionOfPost[] | null) => void;
  assetData: InvestmentAssetOfPost[] | null;
  setAssetData: (d: InvestmentAssetOfPost[] | null) => void;
  dateFilter: DateFilter;
  setDateFilter: (d: DateFilter) => void;
  onShareCashflow: () => void;
  onSharePortfolio: () => void;
  onSelectAssets: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEditMode: boolean;
}

export const PostForm = (props: PostFormProps) => {
  const {
    content,
    setContent,
    selectedImage,
    onImageUpload,
    onRemoveImage,
    shareType,
    setShareType,
    chartData,
    setChartData,
    assetData,
    setAssetData,
    dateFilter,
    setDateFilter,
    onShareCashflow,
    onSharePortfolio,
    onSelectAssets,
    onSubmit,
    isLoading,
    isEditMode,
  } = props;

  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#22C55E", "#EF4444"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: chartData?.map((t) => t.transactionDate) || [],
      labels: { formatter: (val: string) => formatDateVN(val) },
    },
    tooltip: {
      x: { formatter: (val) => formatDateVN(new Date(val).toISOString()) },
    },
  };

  return (
    <div className="space-y-4">
      <textarea
        placeholder="Chia sẻ suy nghĩ..."
        className="w-full p-4 border border-gray-700 rounded-xl bg-gray-800 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white placeholder-gray-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <label className="px-4 py-2 text-xs text-white font-medium bg-gray-800 border border-gray-700 rounded-full cursor-pointer hover:bg-gray-700 transition flex items-center gap-2">
          <span>📷</span> {isEditMode ? "Đổi ảnh" : "Upload ảnh"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
          />
        </label>
        {(!isEditMode || shareType === "portfolio") && (
          <button
            onClick={onSharePortfolio}
            disabled={isEditMode && shareType !== "portfolio"}
            className={`px-4 py-2 text-xs font-medium rounded-full transition flex items-center gap-2 border ${
              shareType === "portfolio"
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span>📈</span> {isEditMode ? "Chọn lại Coin" : "Chia sẻ Portfolio"}
          </button>
        )}
        {(!isEditMode || shareType === "cashflow") && (
          <button
            onClick={onShareCashflow}
            disabled={isEditMode && shareType !== "cashflow"}
            className={`px-4 py-2 text-xs font-medium rounded-full transition flex items-center gap-2 border ${
              shareType === "cashflow"
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span>💰</span> {isEditMode ? "Sửa Timeline" : "Chia sẻ Dòng tiền"}
          </button>
        )}
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="mt-3 relative w-40">
          <img
            src={selectedImage}
            className="rounded-lg shadow-lg border border-gray-700"
            alt="preview"
          />
          <button
            onClick={onRemoveImage}
            className="absolute -top-2 -right-2 bg-gray-800 border border-gray-700 text-red-500 p-1.5 rounded-full shadow-md hover:bg-gray-700 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Cashflow Section */}
      {shareType === "cashflow" && (
        <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <p className="font-bold text-sm text-white">Dữ liệu dòng tiền</p>
            <div className="flex items-center gap-2 text-sm bg-[#111318] p-2 rounded-lg border border-gray-700">
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, from: e.target.value })
                }
                className="bg-transparent focus:outline-none text-xs text-gray-300 pointer-cursor"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, to: e.target.value })
                }
                className="bg-transparent focus:outline-none text-xs text-gray-300 pointer-cursor"
              />
            </div>
            {!isEditMode && (
              <button
                onClick={() => {
                  setChartData(null);
                  setShareType("none");
                }}
                className="text-xs text-red-500 hover:underline p-1 hover:bg-white/5 rounded"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {chartData && (
            <div className="rounded-xl p-2 bg-[#111318] mb-3 border border-gray-700">
              <Chart
                options={{
                  ...chartOptions,
                  grid: { borderColor: "#333" },
                  theme: { mode: "dark" },
                }}
                series={[
                  {
                    name: "Thu",
                    data: chartData.map((t) =>
                      t.transactionType === "Thu" ? t.amount : 0
                    ),
                  },
                  {
                    name: "Chi",
                    data: chartData.map((t) =>
                      t.transactionType === "Chi" ? t.amount : 0
                    ),
                  },
                ]}
                type="area"
                height={200}
              />
            </div>
          )}
        </div>
      )}

      {/* Portfolio Section */}
      {shareType === "portfolio" && assetData && (
        <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-sm text-white">
              Danh mục ({assetData.length} coin)
            </p>
            <div className="flex gap-2">
              <button
                onClick={onSelectAssets}
                className="text-xs text-primary hover:underline font-medium"
              >
                <Edit size={16} />
              </button>
              {!isEditMode && (
                <button
                  onClick={() => {
                    setAssetData(null);
                    setShareType("none");
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {assetData.map((a) => {
              // RENDER GOLD ICON
              const isGold = a.url === "GOLD_ICON" || a.url === "";
              return (
                <div
                  key={a.assetSymbol}
                  className="flex items-center gap-2 bg-[#111318] px-3 py-1.5 rounded-lg text-xs shadow-sm border border-gray-700"
                >
                  {isGold ? (
                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-[10px] font-bold border border-yellow-500/30">
                      G
                    </div>
                  ) : (
                    <img
                      src={a.url}
                      className="w-5 h-5 rounded-full"
                      alt={a.assetSymbol}
                    />
                  )}
                  <span className="font-medium">{a.assetSymbol}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover disabled:opacity-70 transition-colors shadow-lg shadow-primary/20"
        >
          <Send size={16} />{" "}
          {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Đăng bài"}
        </button>
      </div>
    </div>
  );
};

// --- POST ITEM COMPONENT ---

interface PostItemProps {
  post: Post;
  currentUserId?: string;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  activeMenuId: string | null;
  toggleMenu: (id: string | null) => void;
  showCommentBox: boolean;
  toggleCommentBox: () => void;
  starRating: number;
  setStarRating: (v: number) => void;
  commentText: string;
  setCommentText: (v: string) => void;
  onSubmitComment: () => void;
  isExpanded: boolean;
  toggleExpanded: () => void;
  onToggleFavorite?: (postId: string, isFavorited: boolean) => Promise<void>;
  onDeleteComment?: (postId: string, idEvaluate: string) => Promise<void>;
  onUpdateComment?: (
    postId: string,
    idEvaluate: string,
    body: { comment?: string; star?: number }
  ) => Promise<void>;
}

export const PostItem = (props: PostItemProps) => {
  const {
    post,
    currentUserId,
    onEdit,
    onDelete,
    activeMenuId,
    toggleMenu,
    showCommentBox,
    toggleCommentBox,
    starRating,
    setStarRating,
    commentText,
    setCommentText,
    onSubmitComment,
    isExpanded,
    toggleExpanded,
    onToggleFavorite,
    onDeleteComment,
    onUpdateComment,
  } = props;

  const [isFavoriting, setIsFavoriting] = React.useState(false);

  const [isDeletingComment, setIsDeletingComment] = React.useState<
    string | null
  >(null);

  const [editingCommentId, setEditingCommentId] = React.useState<string | null>(
    null
  );

  const [editingCommentText, setEditingCommentText] =
    React.useState<string>("");

  const [editingCommentStars, setEditingCommentStars] =
    React.useState<number>(0);

  const isOwner = currentUserId === post.userOfPostResponse.idUser;

  const snapshot = post.snapshotResponse?.[0] ?? {};

  const transactionData = snapshot.transactionOfPosts ?? null;

  const assetData = snapshot.investmentAssetOfPosts ?? null;

  const comments = post.evaluateResponse.evaluateResponses || [];

  const visibleComments = isExpanded ? comments : comments.slice(0, 3);

  const commentCount = post.evaluateResponse.totalComments ?? 0;

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite || !currentUserId) return;

    setIsFavoriting(true);

    try {
      await onToggleFavorite(post.idPost, post.isFavorited ?? false);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDeleteComment = async (idEvaluate: string) => {
    if (!onDeleteComment) return;

    setIsDeletingComment(idEvaluate);

    try {
      await onDeleteComment(post.idPost, idEvaluate);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeletingComment(null);
    }
  };

  const handleStartEdit = (c: EvaluateResponse) => {
    setEditingCommentId(c.idEvaluate);

    setEditingCommentText(c.comment || "");

    setEditingCommentStars(c.star || 0);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);

    setEditingCommentText("");

    setEditingCommentStars(0);
  };

  const handleSaveEdit = async (idEvaluate: string) => {
    if (!onUpdateComment) return;

    try {
      await onUpdateComment(post.idPost, idEvaluate, {
        star: editingCommentStars,

        comment: editingCommentText,
      });

      handleCancelEdit();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#22C55E", "#EF4444"],
    stroke: { curve: "smooth", width: 2 },
    theme: { mode: "dark" },
    grid: { borderColor: "#333" },
    xaxis: {
      categories: transactionData?.map((t) => t.transactionDate) || [],
      labels: {
        formatter: (val: string) => formatDateVN(val),
        style: { colors: "#9CA3AF" },
      },
    },
    yaxis: {
      labels: { style: { colors: "#9CA3AF" } },
    },
    tooltip: {
      theme: "dark",
      x: { formatter: (val) => formatDateVN(new Date(val).toISOString()) },
    },
  };

  return (
    <div className="bg-[#111318] rounded-2xl p-6 shadow-lg border border-gray-800 hover:border-gray-700 transition-all duration-300 relative group">
      {/* Header */}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <UserAvatar url={post.userOfPostResponse.urlAvatar} />

          <div>
            <p className="font-bold text-sm text-white">
              {post.userOfPostResponse.name}
            </p>

            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-400">
                {formatDateVN(post.createAt)}
              </p>
              <div className="w-1 h-1 rounded-full bg-gray-600"></div>
              <p className="text-xs text-primary font-medium">Public</p>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative post-menu-trigger">
            <button
              onClick={() =>
                toggleMenu(activeMenuId === post.idPost ? null : post.idPost)
              }
              className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {activeMenuId === post.idPost && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-[#1A1D24] border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => onEdit(post)}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <Edit size={14} /> Sửa
                </button>

                <button
                  onClick={() => onDelete(post.idPost)}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}

      <p className="text-sm mb-3 whitespace-pre-wrap text-gray-200">
        {post.content || post.title}
      </p>

      {post.urlImage && (
        <img
          src={post.urlImage}
          className="w-full h-auto max-h-96 object-cover rounded-xl mb-3 border border-gray-800"
          alt="content"
        />
      )}

      {/* Chart */}

      {transactionData && transactionData.length > 0 && (
        <div className="rounded-xl p-2 bg-[#111318] mb-3 border border-gray-700">
          <Chart
            options={chartOptions}
            series={[
              {
                name: "Thu",

                data: transactionData.map((t) =>
                  t.transactionType === "Thu" ? t.amount : 0
                ),
              },

              {
                name: "Chi",

                data: transactionData.map((t) =>
                  t.transactionType === "Chi" ? t.amount : 0
                ),
              },
            ]}
            type="area"
            height={200}
          />
        </div>
      )}

      {/* Asset Table */}

      {assetData && assetData.length > 0 && (
        <div className="overflow-x-auto rounded-xl mb-3 border border-gray-700">
          <table className="w-full text-sm">
            <thead className="text-gray-400 bg-gray-800 text-xs font-semibold uppercase">
              <tr>
                <th className="text-left p-2 pl-3">Token</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2 pr-3">24h</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">
              {assetData.map((a, i) => {
                // CHECK GOLD ICON (nếu url rỗng hoặc là GOLD_ICON)
                const isGold = a.url === "GOLD_ICON" || a.url === "";

                return (
                  <tr
                    key={i}
                    className="hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="p-2 pl-3 flex items-center gap-2 text-white">
                      {isGold ? (
                        <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-[10px] font-bold border border-yellow-500/30">
                          G
                        </div>
                      ) : (
                        <img
                          src={a.url}
                          className="w-5 h-5 rounded-full"
                          alt={a.assetSymbol}
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                      )}

                      <span>{a.assetSymbol}</span>
                    </td>

                    <td className="text-right p-2 text-gray-300">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(a.currentPrice)}
                    </td>

                    <td
                      className={`text-right p-2 pr-3 font-medium ${
                        a.priceChangePercentage24h >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {a.priceChangePercentage24h !== 0 ? (
                        <>
                          {a.priceChangePercentage24h >= 0 ? "+" : ""}
                          {a.priceChangePercentage24h.toFixed(2)}%
                        </>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}

      <div className="flex justify-between items-center pt-4 border-t border-gray-800 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="fill-yellow-500 w-4 h-4" />

            <span className="text-sm font-bold">
              {post.evaluateResponse.totalComments === 0
                ? "Chưa có đánh giá"
                : post.evaluateResponse.averageStars.toFixed(1)}
            </span>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            {commentCount} bình luận
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleFavorite}
            disabled={isFavoriting}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full transition-all ${
              post.isFavorited
                ? "bg-red-500/10 text-red-500"
                : "text-gray-400 hover:bg-[#1A1D24] hover:text-white"
            } disabled:opacity-50`}
          >
            <Heart
              size={18}
              className={post.isFavorited ? "fill-red-500 text-red-500" : ""}
            />

            <span>{post.isFavorited ? "Đã thích" : "Thích"}</span>
          </button>

          <button
            onClick={toggleCommentBox}
            className="flex items-center gap-2 text-sm text-gray-400 hover:bg-[#1A1D24] hover:text-white px-3 py-1.5 rounded-full transition-all"
          >
            <MessageCircle size={18} /> Bình luận
          </button>
        </div>
      </div>

      {/* Comments */}
      {showCommentBox && (
        <div className="mt-3 p-3 bg-[#1A1D24] rounded-xl animate-in slide-in-from-top-2 border border-gray-800">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`cursor-pointer w-6 h-6 transition-colors ${
                  s <= starRating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-600 hover:text-yellow-500/50"
                }`}
                onClick={() => setStarRating(s)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-3 rounded-xl bg-[#111318] border border-gray-800 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-blue-500 transition-all"
              placeholder="Viết đánh giá..."
              rows={1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={onSubmitComment}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-xl text-sm font-medium transition-all"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
      {visibleComments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
          {visibleComments.map((c: EvaluateResponse) => {
            const isCommentOwner = currentUserId === c.idUser;
            return (
              <div key={c.idEvaluate} className="flex gap-3">
                <UserAvatar url={c.urlAvatar} size="w-8 h-8" iconSize={16} />
                <div className="flex-1 p-3 rounded-xl bg-[#1A1D24] border border-gray-800/50">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-white block">
                        {c.name}
                      </span>
                      {editingCommentId !== c.idEvaluate && (
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={
                                i < c.star
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-700"
                              }
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isCommentOwner && editingCommentId !== c.idEvaluate && (
                        <>
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c.idEvaluate)}
                            disabled={isDeletingComment === c.idEvaluate}
                            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Xóa bình luận"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingCommentId === c.idEvaluate ? (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`cursor-pointer w-5 h-5 transition-colors ${
                              s <= editingCommentStars
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-700 hover:text-yellow-500/50"
                            }`}
                            onClick={() => setEditingCommentStars(s)}
                          />
                        ))}
                      </div>
                      <textarea
                        className="w-full p-2 rounded-lg bg-[#111318] border border-gray-800 text-white text-sm resize-none focus:outline-none focus:border-blue-500 transition-all"
                        rows={3}
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(c.idEvaluate)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
                        >
                          Lưu
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 bg-[#111318] hover:bg-gray-800 text-gray-300 rounded-lg text-sm transition-all"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mt-1 text-gray-300">{c.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateVN(c.createAt)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {comments.length > 3 && (
            <button
              onClick={toggleExpanded}
              className="text-xs font-medium text-gray-400 hover:text-blue-500 hover:underline w-full text-left pl-12 transition-colors"
            >
              {isExpanded
                ? "Thu gọn bình luận"
                : `Xem thêm ${comments.length - 3} bình luận...`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
