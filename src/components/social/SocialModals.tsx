"use client";
import { X, CheckCircle, Circle, AlertTriangle, Send } from "lucide-react";
import { UserAvatar } from "./SocialFeed";
import { UserInfo } from "@/type/Social";
import { Asset } from "@/type/Dashboard"; // Import type Asset

// --- 1. ASSET MODAL ---
interface AssetSelectionModalProps {
  assets: Asset[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  // optional callback to signal parent to reset/clear selection when modal is closed
  onCancel?: () => void;
}

export const AssetSelectionModal = ({
  assets,
  selectedIds,
  onToggle,
  onConfirm,
  onClose,
  onCancel,
}: AssetSelectionModalProps) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
    <div className="bg-gray-200 w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
      <div className="p-4 border-b flex justify-between items-center  rounded-t-xl">
        <h3 className="font-bold">Chọn tài sản chia sẻ</h3>
        <button
          onClick={() => {
            // notify parent to clear selection if provided, then close
            if (onCancel) onCancel();
            onClose();
          }}
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {assets.map((asset) => (
          <div
            key={asset.idAsset}
            onClick={() => onToggle(asset.idAsset)}
            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
              selectedIds.has(asset.idAsset)
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {selectedIds.has(asset.idAsset) ? (
                <CheckCircle className="text-blue-600" size={20} />
              ) : (
                <Circle className="text-gray-300" size={20} />
              )}
              <img
                src={asset.url}
                className="w-8 h-8 rounded-full bg-white"
                alt={asset.assetSymbol}
              />
              <div>
                <p className="font-bold text-sm">{asset.assetName}</p>
                <p className="text-xs text-gray-500">
                  {asset.assetSymbol.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t">
        <button
          onClick={() => {
            // confirm selected and close
            onConfirm();
            onClose();
          }}
          className="w-full bg-[#022d6d] text-white py-2.5 rounded-lg font-medium"
        >
          Xác nhận ({selectedIds.size})
        </button>
      </div>
    </div>
  </div>
);

// --- 2. DELETE FRIEND ---
interface DeleteFriendModalProps {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteFriendModal = ({
  name,
  onCancel,
  onConfirm,
}: DeleteFriendModalProps) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-[#1C253A] rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle className="text-red-600" size={24} />
      </div>
      <h3 className="text-lg font-bold mb-2">Hủy kết bạn?</h3>
      <p className="text-sm text-gray-500 mb-6">
        Bạn có chắc chắn muốn xóa <span className="font-bold">{name}</span> khỏi
        danh sách bạn bè?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl text-sm"
        >
          Hủy bỏ
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl text-sm shadow-md shadow-red-200"
        >
          Xóa bạn
        </button>
      </div>
    </div>
  </div>
);

// --- 3. CHAT ---
interface ChatPopupProps {
  user?: UserInfo | null;
  onClose: () => void;
}

export const ChatPopup = ({ user, onClose }: ChatPopupProps) => {
  const hasUser = !!user && !!user.name;

  return (
    <div className="fixed bottom-4 right-4 bg-background border shadow-2xl rounded-t-xl w-80 flex flex-col z-40 h-96">
      <div
        className="bg-[#022d6d] text-white p-3 flex justify-between items-center cursor-pointer"
        onClick={onClose}
      >
        <div className="flex items-center gap-2">
          <UserAvatar url={user?.urlAvatar} size="w-8 h-8" />
          <span className="font-semibold text-sm">
            {hasUser ? user!.name : "Không thể tải dữ liệu người dùng"}
          </span>
        </div>
        <X size={20} />
      </div>
      <div className="flex-1 bg-gray-50 p-3">
        {hasUser ? (
          <div className="bg-white border p-2 rounded-xl rounded-tl-none text-sm shadow-sm inline-block">
            Xin chào {user!.name}!
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            Đang không thể tải thông tin người dùng.
          </div>
        )}
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 px-3 py-1 bg-gray-100 rounded-full text-sm outline-none"
          placeholder={hasUser ? "Nhập tin nhắn..." : "Không thể gửi tin nhắn"}
          disabled={!hasUser}
        />
        <button
          disabled={!hasUser}
          title={hasUser ? "Gửi" : "Không có dữ liệu người dùng"}
        >
          <Send
            size={18}
            className={`text-blue-600 ${!hasUser ? "opacity-40" : ""}`}
          />
        </button>
      </div>
    </div>
  );
};

// --- 4. EDIT POST MODAL ---
interface EditPostModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const EditPostModal = ({ onClose, children }: EditPostModalProps) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-5">
    <div className="bg-gray-200 w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg">Chỉnh sửa bài viết</h3>
        <button onClick={onClose}>
          <X size={24} />
        </button>
      </div>
      <div className="p-4 overflow-y-auto">{children}</div>
    </div>
  </div>
);

// --- 5. EDIT COMMENT MODAL ---
interface EditCommentModalProps {
  starRating: number;
  setStarRating: (v: number) => void;
  commentText: string;
  setCommentText: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const EditCommentModal = ({
  starRating,
  setStarRating,
  commentText,
  setCommentText,
  onCancel,
  onConfirm,
  isLoading = false,
}: EditCommentModalProps) => {
  const { Star } = require("lucide-react");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1C253A] rounded-xl shadow-2xl w-full max-w-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Sửa bình luận</h3>
          <button onClick={onCancel} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Đánh giá</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setStarRating(s)}
                  disabled={isLoading}
                  className="text-2xl hover:scale-110 transition disabled:opacity-50"
                >
                  {s <= starRating ? "⭐" : "☆"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Bình luận</p>
            <textarea
              className="w-full p-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Viết bình luận..."
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-300 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Đang xử lý..." : "Cập nhật"}
          </button>
        </div>
      </div>
    </div>
  );
};
