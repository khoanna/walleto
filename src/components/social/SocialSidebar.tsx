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
      className="bg-[#111318] p-4 rounded-2xl border border-gray-800 relative"
      ref={searchRef}
    >
      <div className="flex items-center gap-2 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 bg-[#1A1D24] border border-gray-800 transition-all">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          className="bg-transparent text-white focus:outline-none w-full text-sm placeholder-gray-500"
          value={query}
          onFocus={onFocus}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1D24] border border-gray-800 rounded-xl shadow-xl max-h-60 overflow-y-auto z-10 p-2 space-y-1">
          {results.length === 0 ? (
            <p className="text-xs text-center text-gray-500 py-2">
              Không tìm thấy
            </p>
          ) : (
            results.map((u) => (
              <div
                key={u.idUser}
                className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar url={u.urlAvatar} size="w-8 h-8" />
                  <div>
                    <p className="text-sm font-medium leading-none text-white">{u.name}</p>
                    <p className="text-[10px] text-gray-400">{u.email}</p>
                  </div>
                </div>
                {checkIsFriend(u.idUser) ? (
                  <div className="flex items-center gap-1 text-green-500 px-2 py-1 bg-green-500/10 rounded-lg">
                    <UserCheck size={14} />
                    <span className="text-[10px] font-medium">Bạn bè</span>
                  </div>
                ) : checkIsPending(u.idUser) ? (
                  <span className="text-[10px] text-gray-500 italic px-2">
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
                    className="p-1.5 bg-blue-600/10 text-blue-500 rounded-full hover:bg-blue-600 hover:text-white transition-all"
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
  <div className="bg-[#111318] p-4 rounded-2xl border border-gray-800">
    <h3 className="font-semibold text-sm mb-3 text-white">
      Yêu cầu kết bạn <span className="text-blue-500">({requests.length})</span>
    </h3>
    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <p className="text-xs text-gray-500 text-center italic">
          Không có lời mời nào
        </p>
      ) : (
        requests.map((req) => (
          <div
            key={req.idFriendship}
            className="flex flex-col gap-2 p-3 rounded-xl bg-[#1A1D24] border border-gray-800"
          >
            <div className="flex items-center gap-3">
              <UserAvatar url={req.infFriendshipResponse.sender.urlAvatar} />
              <span className="text-sm font-medium text-white">
                {req.infFriendshipResponse.sender.name}
              </span>
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={() =>
                  onReject(req.infFriendshipResponse.sender.idUser)
                }
                className="flex-1 py-1.5 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white font-medium rounded-lg text-xs transition"
              >
                Từ chối
              </button>
              <button
                onClick={() =>
                  onAccept(req.infFriendshipResponse.sender.idUser)
                }
                className="flex-1 py-1.5 bg-blue-600 text-white hover:bg-blue-500 font-medium rounded-lg text-xs transition"
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
  onChat: (u: UserInfo, idFriendship: string) => void;
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
  <div className="bg-[#111318] p-4 rounded-2xl border border-gray-800">
    <h3 className="font-semibold mb-3 text-sm text-white">
      Danh sách bạn bè ({friends.length})
    </h3>
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : friends.length === 0 ? (
        <p className="text-xs text-gray-500 text-center italic">
          Chưa có bạn bè
        </p>
      ) : (
        friends.map((f) => {
          const friendInfo = getFriendInfo(f);
          if (!friendInfo) return null;
          return (
            <div
              key={f.idFriendship}
              onClick={() => onChat(friendInfo, f.idFriendship)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1A1D24] cursor-pointer transition-all group"
            >
              <div className="relative">
                <UserAvatar url={friendInfo.urlAvatar} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium block text-gray-300 group-hover:text-blue-500 transition-colors">
                  {friendInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle
                  size={16}
                  className="text-gray-500 group-hover:text-blue-500 mr-2 transition-colors"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(f.idFriendship, friendInfo.name);
                  }}
                  className="p-1.5 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
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
