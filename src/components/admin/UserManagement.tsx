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
  Plus,
  Edit2,
  Upload,
  X,
} from "lucide-react";
import { useAdmin } from "@/services/useAdmin";
import useUser from "@/services/useUser";
import User from "@/type/User";

type TabType = "active" | "inactive";

// Form payload type
type UserFormPayload = {
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  address?: string | null;
  urlAvatar?: string | null;
  password?: string;
  confirmPassword?: string;
};

// Add/Edit Form Component
interface AddEditFormProps {
  initialData?: User | null;
  onCancel: () => void;
  onSubmit: (payload: UserFormPayload) => Promise<void> | void;
}

function AddEditForm({ initialData, onCancel, onSubmit }: AddEditFormProps) {
  const { uploadAvatar } = useUser();
  const [form, setForm] = useState<UserFormPayload>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    gender: initialData?.gender || "",
    address: initialData?.address || "",
    urlAvatar: initialData?.urlAvatar || "",
    password: "",
    confirmPassword: "",
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialData?.urlAvatar || null
  );
  const [uploadingFile, setUploadingFile] = useState(false);
  const submittingRef = React.useRef(false);

  const handleChange = (
    key: keyof UserFormPayload,
    value: string | null | undefined
  ) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ");
      return;
    }

    try {
      setUploadingFile(true);
      const uploadedUrl = await uploadAvatar(file);
      setForm((s) => ({ ...s, urlAvatar: uploadedUrl }));
      setPreviewUrl(uploadedUrl);
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert("Lỗi khi upload ảnh");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemovePreview = () => {
    setForm((s) => ({ ...s, urlAvatar: "" }));
    setPreviewUrl(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (submittingRef.current) return;

    if (!form.name || !form.email) {
      alert("Vui lòng điền tên và email");
      return;
    }

    if (!initialData) {
      if (!form.password) {
        alert("Vui lòng nhập mật khẩu");
        return;
      }
      if (form.password !== form.confirmPassword) {
        alert("Mật khẩu không khớp");
        return;
      }
    }

    try {
      submittingRef.current = true;
      await onSubmit(form);
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto"
    >
      {/* Avatar Upload */}
      <div className="flex flex-col items-center gap-3 pb-4 border-b border-white/10">
        <div className="relative group">
          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden shadow-lg">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8" />
            )}
          </div>
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePreview}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition disabled:opacity-50">
          <Upload className="w-4 h-4" />
          <span>{uploadingFile ? "Đang tải..." : "Chọn ảnh"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadingFile}
          />
        </label>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Họ và tên"
          className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Email"
          className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Số điện thoại"
          className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={form.gender || ""}
          onChange={(e) => handleChange("gender", e.target.value)}
          placeholder="Giới tính"
          className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <input
        value={form.address || ""}
        onChange={(e) => handleChange("address", e.target.value)}
        placeholder="Địa chỉ"
        className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {!initialData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="password"
            value={form.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Mật khẩu"
            className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={form.confirmPassword || ""}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className="w-full p-2 bg-white/5 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 rounded-lg text-slate-300 hover:bg-white/20 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition disabled:opacity-50"
          disabled={uploadingFile}
        >
          Lưu
        </button>
      </div>
    </form>
  );
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { getListUsers, deleteAndRestoreUser, addUser, updateUser } =
    useAdmin();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getListUsers();
      const list: User[] = res?.data || [];
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
    if (activeTab === "active") {
      filtered = filtered.filter((user) => user.isActive === true);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((user) => user.isActive === false);
    }
    setFilteredUsers(filtered);
  }, [searchQuery, users, activeTab]);

  const activeCount = users.filter((u) => u.isActive === true).length;
  const inactiveCount = users.filter((u) => u.isActive === false).length;

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            Quản lý người dùng
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý tài khoản và quyền truy cập người dùng
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Thêm người dùng</span>
          <span className="sm:hidden">Thêm</span>
        </button>
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
              <p className="text-2xl font-bold text-white">{activeCount}</p>
              <p className="text-xs text-slate-400">Đang hoạt động</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-pink-500/10 border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Ban className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{inactiveCount}</p>
              <p className="text-xs text-slate-400">Đã khóa</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("active")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Đang hoạt động</span>
          <span className="sm:hidden">Hoạt động</span>({activeCount})
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
          <span className="hidden sm:inline">Đã khóa</span>
          <span className="sm:hidden">Khóa</span>({inactiveCount})
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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 sm:px-6 py-3 text-left font-semibold text-slate-300">
                    Tên
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left font-semibold text-slate-300">
                    Email
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left font-semibold text-slate-300">
                    Phone
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left font-semibold text-slate-300">
                    Địa chỉ
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-center font-semibold text-slate-300">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.idUser}
                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                      user.isActive === false ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {user.urlAvatar ? (
                          <img
                            src={user.urlAvatar}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-4 h-4 text-blue-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate sm:hidden">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {user.email}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {user.phone || "—"}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4">
                      <span className="text-sm text-slate-400">
                        {user.address || "—"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
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
                          className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
                          <span className="hidden sm:inline">
                            {user.isActive ? "Khóa" : "Mở khóa"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative bg-[#0B1622] w-full max-w-2xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Thêm người dùng mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddEditForm
              onCancel={() => setShowAddModal(false)}
              onSubmit={async (payload) => {
                try {
                  await addUser(payload);
                  setShowAddModal(false);
                  await fetchUsers();
                } catch (err) {
                  console.error(err);
                  alert("Lỗi khi thêm người dùng");
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative bg-[#0B1622] w-full max-w-2xl rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Chỉnh sửa người dùng
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AddEditForm
              initialData={editingUser}
              onCancel={() => {
                setShowEditModal(false);
                setEditingUser(null);
              }}
              onSubmit={async (payload) => {
                try {
                  await updateUser(editingUser.idUser, payload);
                  setShowEditModal(false);
                  setEditingUser(null);
                  await fetchUsers();
                } catch (err) {
                  console.error(err);
                  alert("Lỗi khi cập nhật người dùng");
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
