"use client";
import React from "react";
import {
  Search,
  UserPlus,
  UserCheck,
  Clock,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { UserAvatar } from "./SocialFeed";
import { UserInfo, FriendshipData } from "@/type/Social";

// --- 1. SEARCH BOX ---
interface UserSearchBoxProps {
  query: string;
  setQuery: (val: string) => void;
  onFocus: () => void;
  results: UserInfo[];
  showResults: boolean;
  onSendRequest: (id: string) => void;
  checkIsFriend: (id: string) => boolean;
  checkIsPending: (id: string) => boolean;
  checkIsSent: (id: string) => boolean;
  searchRef: React.RefObject<HTMLDivElement | null>;
}

export const UserSearchBox = (props: UserSearchBoxProps) => {
  const {
    query,
    setQuery,
    onFocus,
    results,
    showResults,
    onSendRequest,
    checkIsFriend,
    checkIsPending,
    checkIsSent,
    searchRef,
  } = props;
  return (
    <div
      className="bg-background/60 p-4 rounded-xl shadow-lg relative"
      ref={searchRef}
    >
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 bg">
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          className="bg-transparent focus:outline-none w-full text-sm"
          value={query}
          onFocus={onFocus}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-lg shadow-xl max-h-60 overflow-y-auto z-10 p-2 space-y-1">
          {results.length === 0 ? (
            <p className="text-xs text-center text-gray-500 py-2">
              Không tìm thấy
            </p>
          ) : (
            results.map((u) => (
              <div
                key={u.idUser}
                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar url={u.urlAvatar} size="w-8 h-8" />
                  <div>
                    <p className="text-sm font-medium leading-none">{u.name}</p>
                    <p className="text-[10px] text-gray-400">{u.email}</p>
                  </div>
                </div>
                {checkIsFriend(u.idUser) ? (
                  <div className="flex items-center gap-1 text-green-600 px-2 py-1 bg-green-50 rounded-lg">
                    <UserCheck size={14} />
                    <span className="text-[10px] font-medium">Đã là bạn</span>
                  </div>
                ) : checkIsPending(u.idUser) ? (
                  <span className="text-[10px] text-gray-400 italic px-2">
                    Chờ chấp nhận
                  </span>
                ) : checkIsSent(u.idUser) ? (
                  <div className="flex items-center gap-1 text-gray-500 px-2">
                    <Clock size={14} />
                    <span className="text-[10px] italic">Đã gửi</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSendRequest(u.idUser)}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                  >
                    <UserPlus size={16} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- 2. REQUEST LIST ---
interface FriendRequestListProps {
  requests: FriendshipData[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

export const FriendRequestList = ({
  requests,
  onAccept,
  onReject,
  isLoading = false,
}: FriendRequestListProps) => (
  <div className="bg-background/60 p-4 rounded-xl shadow-lg">
    <h3 className="font-semibold text-sm mb-3">
      Yêu cầu kết bạn <span className="text-blue-600">({requests.length})</span>
    </h3>
    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-xs text-gray-400 text-center italic">
          Không có lời mời nào
        </p>
      ) : (
        requests.map((req) => (
          <div
            key={req.idFriendship}
            className="flex flex-col gap-2 p-3 rounded-lg  shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <UserAvatar url={req.infFriendshipResponse.sender.urlAvatar} />
              <span className="text-sm font-medium">
                {req.infFriendshipResponse.sender.name}
              </span>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() =>
                  onReject(req.infFriendshipResponse.sender.idUser)
                }
                className="flex-1 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium rounded-lg text-xs transition"
              >
                Từ chối
              </button>
              <button
                onClick={() =>
                  onAccept(req.infFriendshipResponse.sender.idUser)
                }
                className="flex-1 py-1.5 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded-lg text-xs transition"
              >
                Chấp nhận
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// --- 3. FRIEND LIST ---
interface FriendListProps {
  friends: FriendshipData[];
  getFriendInfo: (f: FriendshipData) => UserInfo | null;
  onChat: (u: UserInfo) => void;
  onDelete: (id: string, name: string) => void;
  isLoading?: boolean;
}

export const FriendList = ({
  friends,
  getFriendInfo,
  onChat,
  onDelete,
  isLoading = false,
}: FriendListProps) => (
  <div className="bg-background/60 p-4 rounded-xl shadow-lg">
    <h3 className="font-semibold mb-3 text-sm">
      Danh sách bạn bè ({friends.length})
    </h3>
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : friends.length === 0 ? (
        <p className="text-xs text-gray-400 text-center italic">
          Chưa có bạn bè
        </p>
      ) : (
        friends.map((f) => {
          const friendInfo = getFriendInfo(f);
          if (!friendInfo) return null;
          return (
            <div
              key={f.idFriendship}
              onClick={() => onChat(friendInfo)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer transition-all shadow-sm hover:shadow-md group"
            >
              <div className="relative">
                <UserAvatar url={friendInfo.urlAvatar} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium block group-hover:text-blue-600 transition-colors">
                  {friendInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle
                  size={16}
                  className="group-hover:text-blue-500 mr-1"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(f.idFriendship, friendInfo.name);
                  }}
                  className="p-1.5 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
);
