"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  Shield,
  User as UserIcon,
  Mail,
  Calendar,
  Loader2,
  Users,
  Edit2,
  Plus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { useAdmin } from "@/services/useAdmin";
import useUser from "@/services/useUser";
import User from "@/type/User";

type FormPayload = {
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  address?: string | null;
  urlAvatar?: string | null;
  password?: string;
  confirmPassword?: string;
};

function AddEditForm({
  initialData,
  onCancel,
  onSubmit,
}: {
  initialData?: User | null;
  onCancel: () => void;
  onSubmit: (payload: FormPayload) => Promise<void> | void;
}) {
  const { uploadAvatar } = useUser();
  const [form, setForm] = useState<FormPayload>({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: (initialData as any)?.phone || "",
    gender: (initialData as any)?.gender || "",
    address: (initialData as any)?.address || "",
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
    key: keyof FormPayload,
    value: string | null | undefined
  ) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ (jpg, png, jpeg)");
      return;
    }

    try {
      setUploadingFile(true);
      const uploadedUrl = await uploadAvatar(file);
      setForm((s) => ({ ...s, urlAvatar: uploadedUrl }));
      setPreviewUrl(uploadedUrl);
      console.log("Upload ảnh thành công:", uploadedUrl);
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      alert("Lỗi khi upload ảnh. Vui lòng thử lại.");
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
    // basic validation
    if (!form.name || !form.email) {
      alert("Vui lòng điền tên và email");
      return;
    }
    if (!initialData) {
      // add mode — check password
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center gap-3 pb-3 border-b border-white/10">
        <div className="relative group">
          <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden shadow-lg">
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
              title="Xóa ảnh"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Họ và tên"
          className="w-full p-2 bg-white/5 rounded-lg text-white"
        />
        <input
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          placeholder="Email"
          className="w-full p-2 bg-white/5 rounded-lg text-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          value={form.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          placeholder="Số điện thoại"
          className="w-full p-2 bg-white/5 rounded-lg text-white"
        />
        <input
          value={form.gender || ""}
          onChange={(e) => handleChange("gender", e.target.value)}
          placeholder="Giới tính"
          className="w-full p-2 bg-white/5 rounded-lg text-white"
        />
      </div>

      <input
        value={form.address || ""}
        onChange={(e) => handleChange("address", e.target.value)}
        placeholder="Địa chỉ"
        className="w-full p-2 bg-white/5 rounded-lg text-white"
      />

      {!initialData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="password"
            value={form.password || ""}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Mật khẩu"
            className="w-full p-2 bg-white/5 rounded-lg text-white"
          />
          <input
            type="password"
            value={form.confirmPassword || ""}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Xác nhận mật khẩu"
            className="w-full p-2 bg-white/5 rounded-lg text-white"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white/10 rounded-lg text-slate-300"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 rounded-lg text-white"
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    idUser?: string;
    message?: string;
  }>({ isOpen: false });

  const {
    getListUsers,
    addUser,
    deleteAndRestoreUser,
    updateUser,
    approveLoading,
  } = useAdmin();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getListUsers();
      // API response structure: { success, message, statusCode, data: [...] }
      const list: User[] = res?.data || [];
      setUsers(list);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setShowAddModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (idUser: string, name?: string) => {
    setConfirmModal({
      isOpen: true,
      idUser,
      message: `Bạn có chắc muốn thay đổi trạng thái người dùng ${name || ""}?`,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      if (!confirmModal.idUser) return;
      await deleteAndRestoreUser(confirmModal.idUser);
      await fetchUsers();
      setConfirmModal({ isOpen: false });
    } catch (err) {
      console.error(err);
      setConfirmModal({ isOpen: false });
    }
  };

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

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
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Thêm người dùng
          </button>
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
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-300">
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
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs">
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-red-500/20 text-red-300 text-xs">
                          Ngừng hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
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
                          className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                            user.isActive
                              ? "hover:bg-red-500/20 hover:text-red-400"
                              : "hover:bg-green-500/20 hover:text-green-300"
                          }`}
                          title={
                            user.isActive ? "Ngừng hoạt động" : "Khôi phục"
                          }
                          disabled={actionLoading === user.idUser}
                        >
                          {actionLoading === user.idUser ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-[#0B1622] w-full max-w-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Thêm người dùng mới
            </h3>
            <AddEditForm
              onCancel={() => setShowAddModal(false)}
              onSubmit={async (payload) => {
                try {
                  await addUser(payload);
                  setShowAddModal(false);
                  await fetchUsers();
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-[#0B1622] w-full max-w-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              Chỉnh sửa người dùng
            </h3>
            <AddEditForm
              initialData={editingUser}
              onCancel={() => setShowEditModal(false)}
              onSubmit={async (payload) => {
                try {
                  await updateUser(editingUser.idUser, payload);
                  setShowEditModal(false);
                  setEditingUser(null);
                  await fetchUsers();
                } catch (err) {
                  console.error(err);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setConfirmModal({ isOpen: false })}
          />
          <div className="relative bg-[#0B1622] w-full max-w-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-2">Xác nhận</h3>
            <p className="text-sm text-slate-400 mb-4">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmModal({ isOpen: false })}
                className="px-4 py-2 bg-white/10 rounded-lg text-slate-300"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 rounded-lg text-white"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
