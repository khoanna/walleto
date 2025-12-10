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
  Calendar,
  Plus,
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
      className={`${size} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400`}
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
        className="w-full p-3 border-1 rounded-lg bg-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <label className="px-4 py-2 text-xs text-gray-200 font-medium bg-gray-100 dark:bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition">
          📷 {isEditMode ? "Đổi ảnh" : "Upload ảnh"}
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
            className={`px-4 py-2 text-xs font-medium rounded-full transition ${
              shareType === "portfolio"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            📈 {isEditMode ? "Chọn lại Coin" : "Chia sẻ Portfolio"}
          </button>
        )}
        {(!isEditMode || shareType === "cashflow") && (
          <button
            onClick={onShareCashflow}
            disabled={isEditMode && shareType !== "cashflow"}
            className={`px-4 py-2 text-xs font-medium rounded-full transition ${
              shareType === "cashflow"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-200 hover:bg-gray-700"
            }`}
          >
            💰 {isEditMode ? "Sửa Timeline" : "Chia sẻ Dòng tiền"}
          </button>
        )}
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="mt-3 relative w-40">
          <img
            src={selectedImage}
            className="rounded-lg shadow-sm"
            alt="preview"
          />
          <button
            onClick={onRemoveImage}
            className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-red-500 p-1 rounded-full shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Cashflow Section - ĐÃ FIX LỖI HỦY */}
      {shareType === "cashflow" && (
        <div className="mt-4 bg-foreground rounded-xl p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <p className="font-semibold text-sm">Dữ liệu dòng tiền</p>
            <div className="flex items-center gap-2 text-sm bg-background p-1.5 rounded-lg shadow-sm">
              <input
                type="date"
                value={dateFilter.from}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, from: e.target.value })
                }
                className="bg-transparent focus:outline-none text-xs"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={dateFilter.to}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, to: e.target.value })
                }
                className="bg-transparent focus:outline-none text-xs"
              />
            </div>
            {!isEditMode && (
              <button
                onClick={() => {
                  setChartData(null);
                  setShareType("none"); // <--- FIX LỖI: Reset shareType để ẩn thanh thời gian
                }}
                className="text-xs text-red-500 hover:underline"
              >
                <X />
              </button>
            )}
          </div>
          {chartData && (
            <div className="rounded-xl p-2 bg-background mb-3">
              <Chart
                options={chartOptions}
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
        <div className="mt-4 bg-foreground rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold text-sm">
              Danh mục ({assetData.length} coin)
            </p>
            <div className="flex gap-2">
              <button
                onClick={onSelectAssets}
                className="text-xs text-blue-600 hover:underline"
              >
                <Edit />
              </button>
              {!isEditMode && (
                <button
                  onClick={() => {
                    setAssetData(null);
                    setShareType("none"); // Reset type
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  <X />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {assetData.map((a) => (
              <div
                key={a.assetSymbol}
                className="flex items-center gap-1 bg-background px-2 py-1 rounded-lg text-xs shadow-sm"
              >
                <img
                  src={a.url}
                  className="w-4 h-4 rounded-full"
                  alt={a.assetSymbol}
                />
                <span className="font-medium">{a.assetSymbol}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#022d6d] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#034091] disabled:opacity-70 transition-colors shadow-sm"
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
  } = props;

  const isOwner = currentUserId === post.userOfPostResponse.idUser;
  const snapshot = post.snapshotResponse?.[0] ?? {};
  const transactionData = snapshot.transactionOfPosts ?? null;
  const assetData = snapshot.investmentAssetOfPosts ?? null;
  const comments = post.evaluateResponse.evaluateResponses || [];
  const visibleComments = isExpanded ? comments : comments.slice(0, 3);

  const chartOptions: ApexOptions = {
    chart: { toolbar: { show: false } },
    colors: ["#22C55E", "#EF4444"],
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories: transactionData?.map((t) => t.transactionDate) || [],
      labels: { formatter: (val: string) => formatDateVN(val) },
    },
    tooltip: {
      x: { formatter: (val) => formatDateVN(new Date(val).toISOString()) },
    },
  };

  return (
    <div className="bg-background rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 relative group">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <UserAvatar url={post.userOfPostResponse.urlAvatar} />
          <div>
            <p className="font-semibold text-sm">
              {post.userOfPostResponse.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatDateVN(post.createAt)}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="relative post-menu-trigger">
            <button
              onClick={() =>
                toggleMenu(activeMenuId === post.idPost ? null : post.idPost)
              }
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <MoreVertical size={20} />
            </button>
            {activeMenuId === post.idPost && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden">
                <button
                  onClick={() => onEdit(post)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Edit size={14} /> Sửa
                </button>
                <button
                  onClick={() => onDelete(post.idPost)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-sm mb-3 whitespace-pre-wrap">
        {post.content || post.title}
      </p>
      {post.urlImage && (
        <img
          src={post.urlImage}
          className="w-full h-auto max-h-96 object-cover rounded-xl mb-3"
          alt="content"
        />
      )}

      {/* Chart */}
      {transactionData && transactionData.length > 0 && (
        <div className="rounded-xl p-2 bg-foreground mb-3">
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
        <div className="overflow-x-auto rounded-xl mb-3 bg-foreground">
          <table className="w-full text-sm">
            <thead className="text-text bg-background">
              <tr>
                <th className="text-left p-2 pl-3">Token</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2 pr-3">24h</th>
              </tr>
            </thead>
            <tbody>
              {assetData.map((a, i) => (
                <tr key={i} className="hover:bg-background/50">
                  <td className="p-2 pl-3 flex items-center gap-2">
                    <img
                      src={a.url}
                      className="w-5 h-5 rounded-full"
                      alt={a.assetSymbol}
                    />
                    <span>{a.assetSymbol}</span>
                  </td>
                  <td className="text-right p-2">
                    ${formatCurrency(a.currentPrice)}
                  </td>
                  <td
                    className={`text-right p-2 pr-3 ${
                      a.priceChangePercentage24h >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {a.priceChangePercentage24h.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="fill-yellow-500 w-4 h-4" />
          <span className="text-sm font-bold">
            {post.evaluateResponse.totalComments === 0
              ? "Chưa có đánh giá"
              : post.evaluateResponse.averageStars.toFixed(1)}
          </span>
        </div>
        <button
          onClick={toggleCommentBox}
          className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
        >
          <MessageCircle size={18} /> Bình luận
        </button>
      </div>

      {/* Comments */}
      {showCommentBox && (
        <div className="mt-3 p-3 rounded-lg animate-in slide-in-from-top-2">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`cursor-pointer w-6 h-6 ${
                  s <= starRating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setStarRating(s)}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <textarea
              className="flex-1 p-2 rounded-lg bg-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Viết đánh giá..."
              rows={1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button
              onClick={onSubmitComment}
              className="bg-blue-600 text-white px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
      {visibleComments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50 space-y-3">
          {visibleComments.map((c: EvaluateResponse) => (
            <div key={c.idEvaluate} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="p-2 rounded-lg flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold">Người dùng</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        className={
                          i < c.star
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm mt-1">{c.comment}</p>
              </div>
            </div>
          ))}
          {comments.length > 3 && (
            <button
              onClick={toggleExpanded}
              className="text-xs font-medium text-gray-500 hover:text-blue-600 hover:underline w-full text-left pl-10"
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
