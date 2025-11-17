"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/services/useUser";
import { useUserContext } from "@/context";
import User from "@/type/User";
import {
  ArrowLeft,
  Loader2,
  Edit2,
  X,
  Check,
  Upload,
  Star,
  Crown,
} from "lucide-react";
interface InputFieldProps {
  label: string;
  required?: boolean;
  name: string;
  value: string;
  editable: boolean;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  placeholder?: string;
  multiline?: boolean;
}
export default function ProfilePage() {
  const router = useRouter();
  const { getUserProfile, updateUser, uploadAvatar, userLoading } = useUser(); // ← thêm uploadImage
  const context = useUserContext();
  const setUser = context?.setUser;
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    address: "",
    urlAvatar: "",
    avatarFile: null as File | null,
  });

  /* ------------------------------------------------- */
  /* 1. Lấy thông tin người dùng */
  /* ------------------------------------------------- */
  useEffect(() => {
    const fetchUserData = async () => {
      if (!context?.user?.idUser) return;
      try {
        setError(null);
        const response = await getUserProfile(context.user.idUser);
        if (response?.success && response?.data) {
          const user = response.data;
          const normalizedUser = {
            ...user,
            createdAt: user.createdAt || user.createAt,
          };
          setUserData(normalizedUser);
          setFormData({
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            gender: user.gender || "",
            address: user.address || "",
            urlAvatar: user.urlAvatar || "",
            avatarFile: null,
          });
        } else {
          setError("Không thể tải thông tin người dùng");
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin người dùng");
      }
    };
    fetchUserData();
  }, [context?.user?.idUser]);

  /* ------------------------------------------------- */
  /* 2. Xử lý input & avatar preview */
  /* ------------------------------------------------- */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp hình ảnh hợp lệ (jpg, png, jpeg)");
      return;
    }
    setFormData((p) => ({ ...p, avatarFile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  /* ------------------------------------------------- */
  /* 3. Lưu (upload → PATCH) */
  /* ------------------------------------------------- */
  const handleSave = async () => {
    if (!userData?.idUser) return;

    // Validation
    if (
      formData.phone &&
      (formData.phone.length < 10 || formData.phone.length > 12)
    ) {
      alert("Số điện thoại phải từ 10 đến 12 ký tự!");
      return;
    }
    if (formData.gender && !["Nam", "Nữ"].includes(formData.gender)) {
      alert("Giới tính chỉ được chọn 'Nam' hoặc 'Nữ'!");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      let finalUrlAvatar = formData.urlAvatar;

      // 1. Upload ảnh (nếu có)
      if (formData.avatarFile) {
        console.log("Bắt đầu upload ảnh...");
        const uploadedUrl = await uploadAvatar(formData.avatarFile);
        finalUrlAvatar = uploadedUrl;
        setPreviewUrl(uploadedUrl);
        console.log("Upload thành công:", uploadedUrl);
      }

      // 2. Cập nhật thông tin người dùng
      console.log("Gửi PATCH update user...");
      const body = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        gender: formData.gender || null,
        address: formData.address || null,
        urlAvatar: finalUrlAvatar || null,
      };

      const response = await updateUser(userData.idUser, body);

      console.log("Response từ updateUser:", response);

      if (response?.success) {
        // Tạo object user mới để cập nhật
        const updatedUser = {
          ...userData,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          address: formData.address,
          urlAvatar: finalUrlAvatar || userData.urlAvatar,
        } as User;

        // Cập nhật local state
        setUserData(updatedUser);

        // CẬP NHẬT CONTEXT → Sidebar sẽ tự động đổi
        if (context?.setUser) {
          context.setUser(updatedUser);
        }

        setIsEditing(false);
        alert("Cập nhật hồ sơ thành công!");
      } else {
        alert(response?.message || "Lỗi khi cập nhật hồ sơ");
      }
    } catch (err) {
      console.error("Lỗi trong handleSave:");
      alert("Lỗi khi lưu hồ sơ");
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl(null);
    setFormData({
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      gender: userData?.gender || "",
      address: userData?.address || "",
      urlAvatar: userData?.urlAvatar || "",
      avatarFile: null,
    });
  };

  /* ------------------------------------------------- */
  /* UI */
  /* ------------------------------------------------- */
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-[var(--text)]">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[var(--foreground)]/50 transition"
            title="Quay lại"
          >
            <ArrowLeft className="h-6 w-6 text-[var(--text)]" />
          </button>
          <h1 className="text-3xl font-bold">Hồ sơ cá nhân</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-[var(--text)]">
            {error}
          </div>
        )}

        {userData && (
          <div className="space-y-6">
            {/* Avatar */}
            <div className="bg-[var(--foreground)]/50 border border-[var(--border)]/20 rounded-3xl p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden shadow-lg">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    ) : userData.urlAvatar ? (
                      <img
                        src={userData.urlAvatar}
                        alt={userData.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userData.name?.charAt(0)?.toUpperCase() || "?"
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition">
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="opacity-80">{userData.email}</p>
                </div>

                <div className="mt-4 sm:mt-0 sm:ml-6 flex items-center">
                  {(() => {
                    const perms = context?.permissions;

                    const hasPremium = !!(
                      perms?.includes("AI_CHATTING") ||
                      perms?.includes("SOCIAL_NETWORK")
                    );

                    // ĐÃ CÓ PREMIUM → hiện badge có thể click xem gói
                    if (hasPremium) {
                      return (
                        <button
                          onClick={() => router.push("/dashboard/profile/buy")}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-400/50 rounded-lg hover:bg-yellow-500/30 transition font-medium"
                        >
                          <Crown className="h-5 w-5" />
                          <span>Prenium</span>
                        </button>
                      );
                    }

                    // CHƯA CÓ PREMIUM → nút mua gói như cũ
                    return (
                      <button
                        onClick={() => router.push("/dashboard/profile/buy")}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
                      >
                        Nâng cấp
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-[var(--foreground)]/50 border border-[var(--border)]/20 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                  >
                    <Edit2 className="h-4 w-4" />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Tên"
                  name="name"
                  value={formData.name}
                  editable={isEditing}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  value={formData.email}
                  editable={isEditing}
                  onChange={handleInputChange}
                  required
                />
                <InputField
                  label="Số điện thoại"
                  name="phone"
                  value={formData.phone}
                  editable={isEditing}
                  onChange={handleInputChange}
                  placeholder="10-12 ký tự"
                />
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Giới tính
                  </label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  ) : (
                    <p className="font-medium">
                      {userData.gender || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <InputField
                  label="Địa chỉ"
                  name="address"
                  value={formData.address}
                  editable={isEditing}
                  onChange={handleInputChange}
                  multiline
                />
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500/50 text-white font-medium py-3 rounded-lg transition"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition"
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------- */
/* Reusable InputField (giữ nguyên) */
/* ------------------------------------------------- */
function InputField({
  label,
  required,
  name,
  value,
  editable,
  onChange,
  placeholder,
  multiline = false,
}: InputFieldProps) {
  return (
    <div className={multiline ? "md:col-span-2" : ""}>
      <label className="block text-sm font-medium mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {editable ? (
        multiline ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        ) : (
          <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      ) : (
        <p className="font-medium">{value || "Chưa cập nhật"}</p>
      )}
    </div>
  );
}
