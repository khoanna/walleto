// services/useUser.ts (Giả sử đường dẫn)

import {useState} from "react";
import useAuthFetch from "./useAuthFetch";

export default function useUser() {
  const [userLoading, setUserLoading] = useState(false);
  const {authFetch} = useAuthFetch();

  const getUserProfile = async (idUser: string) => {
    try {
      setUserLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/inf-user?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const getAllUsers = async () => {
    try {
      setUserLoading(true);
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/user/all-users`, {
        method: "GET",
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching all users:", error);
    } finally {
      setUserLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cloud-image/upload-image`, {
        method: "POST",
        body: form,
      });

      // Kiểm tra status trước khi parse JSON
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} - ${text}`);
      }

      const data = await res.json();

      if (data?.success && data?.data) {
        return data.data;
      } else {
        throw new Error(data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      throw err; // để handleSave bắt được
    }
  };

  const CreateUser = async (body: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    address: string;
    urlAvatar: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      setUserLoading(true);
      const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/user/add-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  const updateUser = async (
    idUser: string,
    body: {
      name: string;
      email: string;
      phone: string | null;
      gender: string | null;
      address: string | null;
      urlAvatar: string | null;
    }
  ) => {
    try {
      setUserLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update-user?idUser=${idUser}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json(); // ← Đảm bảo parse JSON
      return data; // ← TRẢ VỀ RESPONSE
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  const deleteUser = async (idUser: string) => {
    try {
      setUserLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/delete-user?idUser=${idUser}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({idUser}),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  const banOrUnbanUser = async (idUser: string) => {
    try {
      setUserLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/delete-or-restore-user?idUser=${idUser}`,
        {
          method: "PATCH",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setUserLoading(false);
    }
  };

  return {
    getUserProfile,
    getAllUsers,
    uploadAvatar,
    CreateUser,
    updateUser,
    deleteUser,
    userLoading,
    banOrUnbanUser,
  };
}
