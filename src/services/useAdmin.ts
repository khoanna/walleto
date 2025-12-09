import { useState } from "react";
import useAuthFetch from "./useAuthFetch";
import User from "@/type/User";
import { Post, ApiResponse as SocialApiResponse } from "@/type/Social";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T | null;
}

interface UserPayload {
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  address?: string | null;
  urlAvatar?: string | null;
  password?: string;
  confirmPassword?: string;
}

export const useAdmin = () => {
  const [approveLoading, setApproveLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  const getListPosApproved = async (
    idUser: string
  ): Promise<SocialApiResponse<Post[]>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-approved?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data: SocialApiResponse<Post[]> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  // Get all approved posts for admin (without idUser filter)
  const getAllApprovedPosts = async (): Promise<SocialApiResponse<Post[]>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-approved`,
        {
          method: "GET",
        }
      );
      const data: SocialApiResponse<Post[]> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  // Get all posts for admin (with idUser to see all posts)
  const getAllPosts = async (idUser: string): Promise<SocialApiResponse<Post[]>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-approved?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data: SocialApiResponse<Post[]> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const getListPostNotApproved = async (): Promise<
    SocialApiResponse<Post[]>
  > => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-not-approved`,
        {
          method: "GET",
        }
      );
      const data: SocialApiResponse<Post[]> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const approvePost = async (
    postId: string
  ): Promise<SocialApiResponse<Post>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-approve-post?idPost=${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isApproved: true }),
        }
      );
      const data: SocialApiResponse<Post> = await response.json();
      setApproveLoading(false);
      return data;
    } catch (error) {
      setApproveLoading(false);
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const rejectPost = async (
    postId: string
  ): Promise<SocialApiResponse<Post>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-approve-post?idPost=${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isApproved: false }),
        }
      );
      const data: SocialApiResponse<Post> = await response.json();
      setApproveLoading(false);
      return data;
    } catch (error) {
      setApproveLoading(false);
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const deletePost = async (
    postId: string
  ): Promise<SocialApiResponse<Post>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/delete-post?idPost=${postId}`,
        {
          method: "DELETE",
        }
      );
      const data: SocialApiResponse<Post> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const getListUsers = async (): Promise<ApiResponse<User[]>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/list-user`,
        {
          method: "GET",
        }
      );
      const data: ApiResponse<User[]> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const addUser = async (body: UserPayload): Promise<ApiResponse<User>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/add-user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data: ApiResponse<User> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const deleteAndRestoreUser = async (
    idUser: string
  ): Promise<ApiResponse<null>> => {
    setApproveLoading(true);
    try {
      // Endpoint toggles inactive state; API uses GET without body per spec
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/delete-and-restore-user?idUser=${idUser}`,
        {
          method: "PATCH",
        }
      );
      // Some endpoints may return an empty string instead of valid JSON.
      // Safely read text and parse if possible, otherwise return a fallback object.
      const text = await response.text();
      let data: ApiResponse<null>;
      if (!text) {
        data = {
          success: response.ok,
          message: response.statusText || "OK",
          statusCode: response.status,
          data: null,
        };
      } else {
        try {
          data = JSON.parse(text) as ApiResponse<null>;
        } catch (err) {
          data = {
            success: response.ok,
            message: text,
            statusCode: response.status,
            data: null,
          };
        }
      }
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const updateUser = async (
    idUser: string,
    body: UserPayload
  ): Promise<ApiResponse<User>> => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/update-user?idUser=${idUser}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data: ApiResponse<User> = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  return {
    getListPostNotApproved,
    getListPosApproved,
    getAllApprovedPosts,
    getAllPosts,
    approvePost,
    rejectPost,
    approveLoading,
    deletePost,
    getListUsers,
    addUser,
    deleteAndRestoreUser,
    updateUser,
  };
};
