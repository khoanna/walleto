"use client";
import { useState, useRef, useEffect } from "react";
import { X, CheckCircle, Circle, AlertTriangle, Send, Loader2, MoreVertical, Trash2, UserX } from "lucide-react";
import { UserAvatar } from "./SocialFeed";
import { UserInfo } from "@/type/Social";
import { Asset } from "@/type/Dashboard";
import { useChat, ChatMessage } from "@/services/useChat";
import { useUserContext } from "@/context";

// --- 1. ASSET MODAL ---
interface AssetSelectionModalProps {
  assets: Asset[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onConfirm: () => void;
  onClose: () => void;
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
    <div className="bg-white dark:bg-[#1C253A] w-full max-w-md rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/50 flex justify-between items-center rounded-t-xl">
        <h3 className="font-bold">Chọn tài sản chia sẻ</h3>
        <button
          onClick={() => {
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
              {/* Note: Ideally use Next/Image here if domains are configured */}
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
      <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <UserX className="text-red-600" size={24} />
      </div>
      <h3 className="text-lg font-bold mb-2">Hủy kết bạn?</h3>
      <p className="text-sm text-gray-500 mb-6">
        Bạn có chắc chắn muốn xóa <span className="font-bold">{name}</span> khỏi
        danh sách bạn bè?
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium rounded-xl text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          Hủy bỏ
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl text-sm shadow-md shadow-red-200 dark:shadow-red-900/30 hover:bg-red-700 transition"
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
  idFriendship: string;
  onClose: () => void;
}

export const ChatPopup = ({ user, idFriendship, onClose }: ChatPopupProps) => {
  const hasUser = !!user && !!user.idUser && !!idFriendship;
  const userContext = useUserContext();
  const currentUser = userContext?.user;
  
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isConnected,
    isConnecting,
    isLoading,
    error,
    sendMessage,
    getMessages,
    connect,
    disconnect,
    clearError,
    deleteMessageHistory,
  } = useChat({
    idFriendship: idFriendship || "",
    currentUserId: currentUser?.idUser || "",
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Connect to socket and load messages on mount
  useEffect(() => {
    if (idFriendship && currentUser?.idUser) {
      connect();
      getMessages();
    }
    
    return () => {
      disconnect();
    };
  }, [idFriendship, currentUser?.idUser]);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!inputMessage.trim() || isSending || !hasUser) return;
    
    setIsSending(true);
    const success = await sendMessage(inputMessage);
    if (success) {
      setInputMessage("");
    }
    setIsSending(false);
  };

  // Handle enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if message is from current user by comparing idSender with current user's idUser
  const isMyMessage = (msg: ChatMessage) => {
    return msg.idSender === currentUser?.idUser;
  };

  // Format time from sendAt
  const formatTime = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";
    
    msgs.forEach((msg) => {
      const msgDate = msg.sendAt ? new Date(msg.sendAt).toLocaleDateString("vi-VN") : "";
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    
    return groups;
  };

  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toLocaleDateString("vi-VN");
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("vi-VN");
    
    if (dateStr === today) return "Hôm nay";
    if (dateStr === yesterday) return "Hôm qua";
    return dateStr;
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 bg-foreground rounded-2xl flex flex-col z-40 overflow-hidden transition-all duration-300 ease-in-out
        ${isMinimized ? "w-72 h-16" : "w-[360px] h-[520px]"}
        shadow-[0_10px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_50px_rgba(0,0,0,0.5)]
        ring-1 ring-black/5 dark:ring-white/10`}
    >
      {/* Header */}
      <div 
        className="relative bg-foreground text-text px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3 relative z-10">
          {/* Avatar with online indicator */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <UserAvatar url={user?.urlAvatar} size="w-10 h-10" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background 
              ${isConnected ? "bg-emerald-400" : isConnecting ? "bg-amber-400 animate-pulse" : "bg-gray-400"}`} 
            />
          </div>
          
          <div className="flex flex-col">
            <span className="font-semibold text-[15px] leading-tight">
              {hasUser ? user!.name : "Không thể tải dữ liệu"}
            </span>
            {hasUser && (
              <span className="text-[11px] text-text/60 flex items-center gap-1">
                {isConnected ? "Đang hoạt động" : isConnecting ? "Đang kết nối..." : "Offline"}
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 relative z-10" onClick={(e) => e.stopPropagation()}>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-full transition-all duration-200"
            >
              <MoreVertical size={18} />
            </button>
            
            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-background rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 size={14} />
                  </div>
                  <span>Xóa lịch sử tin nhắn</span>
                </button>
              </div>
            )}
          </div>
          
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center hover:bg-background rounded-full transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl p-5 m-4 shadow-2xl max-w-[300px] animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
            </div>
            <h4 className="font-bold text-center mb-2 text-base">Xóa lịch sử tin nhắn?</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">
              Tất cả tin nhắn sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-foreground text-text rounded-xl text-sm font-medium hover:opacity-80 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  await deleteMessageHistory();
                  setShowDeleteConfirm(false);
                }}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && !isMinimized && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-4 py-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{error}</span>
          </div>
          <button onClick={clearError} className="hover:underline font-medium">Đóng</button>
        </div>
      )}

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 bg-background px-4 py-3 overflow-y-auto">
            {!hasUser ? (
              <div className="flex items-center justify-center h-full text-sm text-text/60">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle size={24} className="text-text/40" />
                  </div>
                  <p>Không thể tải thông tin người dùng.</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="relative w-12 h-12 mx-auto mb-3">
                    <div className="absolute inset-0 rounded-full border-2 border-foreground"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin"></div>
                  </div>
                  <p className="text-sm text-text/60">Đang tải tin nhắn...</p>
                </div>
              </div>
            ) : !Array.isArray(messages) || messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 rounded-full bg-foreground flex items-center justify-center mb-4">
                  <Send size={28} className="text-blue-500" />
                </div>
                <p className="text-base font-medium text-text mb-1">
                  Bắt đầu cuộc trò chuyện
                </p>
                <p className="text-sm text-text/60">
                  Gửi tin nhắn đầu tiên đến {user!.name}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupMessagesByDate(messages).map((group, groupIdx) => (
                  <div key={groupIdx}>
                    {/* Date separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="px-3 py-1 rounded-full bg-foreground text-xs text-text/60 font-medium">
                        {formatDateLabel(group.date)}
                      </div>
                    </div>
                    
                    {/* Messages in group */}
                    <div className="space-y-2">
                      {group.messages.map((msg, idx) => {
                        const isMe = isMyMessage(msg);
                        const showAvatar = !isMe && (idx === 0 || isMyMessage(group.messages[idx - 1]));
                        
                        return (
                          <div 
                            key={msg.idMessage || idx} 
                            className={`flex items-center gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                          >
                            {/* Friend avatar - aligned center with message */}
                            {!isMe && (
                              <div className={`shrink-0 self-center ${showAvatar ? "visible" : "invisible"}`}>
                                <div className="w-7 h-7 rounded-full overflow-hidden">
                                  <UserAvatar url={user?.urlAvatar} size="w-7 h-7" />
                                </div>
                              </div>
                            )}
                            
                            <div className={`max-w-[70%] group ${isMe ? "order-1" : ""}`}>
                              <div
                                className={`px-4 py-2 text-[14px] leading-relaxed
                                  ${isMe
                                    ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
                                    : "bg-foreground text-text rounded-2xl rounded-bl-md"
                                  }`}
                              >
                                {msg.content}
                              </div>
                              {msg.sendAt && (
                                <p className={`text-[10px] text-text/40 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isMe ? "text-right" : "text-left"}`}>
                                  {formatTime(msg.sendAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-background">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <input
                  className="w-full px-4 py-3 bg-foreground rounded-2xl text-sm outline-none 
                    focus:ring-2 focus:ring-blue-500/30 
                    transition-all duration-200 disabled:opacity-50 placeholder:text-text/40"
                  placeholder={hasUser ? "Nhập tin nhắn..." : "Không thể gửi"}
                  disabled={!hasUser}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!hasUser || isSending || !inputMessage.trim()}
                className="w-11 h-11 flex items-center justify-center bg-blue-500 
                  text-white rounded-xl hover:bg-blue-600 
                  transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                  hover:scale-105 active:scale-95"
                title={hasUser ? "Gửi tin nhắn" : "Không có dữ liệu người dùng"}
              >
                {isSending ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            {!isConnected && hasUser && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {isConnecting ? "Đang kết nối..." : "Mất kết nối. Đang thử lại..."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
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
        <h3 className="font-bold text-black text-lg">Chỉnh sửa bài viết</h3>
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
  // Removed forbidden require() call here.
  // The 'Star' icon wasn't being used (emojis were used instead), so it's safe to remove.

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
