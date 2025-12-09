"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Shield,
  User as UserIcon,
  Calendar,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
} from "lucide-react";
import { useAdmin } from "@/services/useAdmin";
import User from "@/type/User";

type TabType = "active" | "inactive";

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { getListUsers, deleteAndRestoreUser } = useAdmin();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getListUsers();
      const list: User[] = res?.data || [];
      console.log(list);
      
      setUsers(list);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter((user) => user.isActive === true);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((user) => user.isActive === false);
    }
    setFilteredUsers(filtered);
  }, [searchQuery, users, activeTab]);

  // Count users by status
  const activeCount = users.filter((u) => u.isActive === true).length;
  const inactiveCount = users.filter((u) => u.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            Quản lý người dùng
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý tài khoản và quyền truy cập người dùng
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-xs text-slate-400">Tổng người dùng</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400">Quản trị viên</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-xs text-slate-400">Hôm nay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Đang hoạt động ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab("inactive")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "inactive"
              ? "bg-red-500/20 text-red-300 border border-red-500/30"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          <UserX className="w-4 h-4" />
          Đã khóa ({inactiveCount})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400">Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Giới tính
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-300">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.idUser}
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                      user.isActive === false ? "opacity-60 italic" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.urlAvatar ? (
                          <img
                            src={user.urlAvatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-white">
                          {user.name || "Chưa có"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {user.email || "Chưa có"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {(user as any)?.phone || "Chưa có"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {(user as any)?.gender || "Chưa có"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {(user as any)?.address || "Chưa có"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {user.createAt
                          ? new Date(user.createAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={async () => {
                          setActionLoading(user.idUser);
                          try {
                            await deleteAndRestoreUser(user.idUser);
                            await fetchUsers();
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                        disabled={actionLoading === user.idUser}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          user.isActive
                            ? "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
                            : "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30"
                        }`}
                      >
                        {actionLoading === user.idUser ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : user.isActive ? (
                          <Ban className="w-3 h-3" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {user.isActive ? "Khóa tài khoản" : "Mở khóa"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
