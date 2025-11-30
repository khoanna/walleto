import { TransactionOfPost } from "@/type/TransactionOfPost";
import useAuthFetch from "./useAuthFetch";
import React from "react";
import { useState } from "react";
import { InvestmentAssetOfPost } from "@/type/InvestmentAssetOfPost";

export default function usePost() {
  const { authFetch } = useAuthFetch();
  const [postLoading, setPostLoading] = useState(false);

  const createTransactionPost = async (body: {
    title: string;
    content: string;
    urlImage: string;
    idUser: string;
    transactionOfPost: TransactionOfPost[];
  }) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/create-transaction-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const createAssetPost = async (body: {
    title: string;
    content: string;
    urlImage: string;
    idUser: string;
    investmentAssetOfPost: InvestmentAssetOfPost[];
  }) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/create-asset-post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const getListPostByUser = async (idUser: string) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-by-user?idUser=${idUser}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const getListPostApproved = async (idUser: string) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-approved?idUser=${idUser}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const getListNotApprovedPosts = async () => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-not-approved`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const deletePost = async (idPost: string) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/delete-post?idPost=${idPost}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const updateApprovePost = async (
    idPost: string,
    body: { approved: boolean }
  ) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-approve-post?idPost=${idPost}`,

        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const updateTransactionPost = async (
    idPost: string,
    body: {
      title: string;
      content: string;
      urlImage: string;
      transactionOfPost: TransactionOfPost[];
    }
  ) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-transaction-post?idPost=${idPost}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const updateAssetPost = async (
    idPost: string,
    body: {
      title: string;
      content: string;
      urlImage: string;
      investmentAssetOfPost: InvestmentAssetOfPost[];
    }
  ) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-asset-post?idPost=${idPost}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  const updatePost = async (
    idPost: string,
    body: { title: string; content: string; urlImage: string }
  ) => {
    try {
      setPostLoading(true);
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-post?idPost=${idPost}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          // GỬI TRỰC TIẾP, KHÔNG BỌC postUpdateRequest
          body: JSON.stringify({
            title: body.title,
            content: body.content,
            urlImage: body.urlImage || "",
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Update post error:", error);
      throw error;
    } finally {
      setPostLoading(false);
    }
  };

  return {
    postLoading,
    createTransactionPost,
    createAssetPost,
    getListPostByUser,
    getListPostApproved,
    getListNotApprovedPosts,
    deletePost,
    updateApprovePost,
    updateTransactionPost,
    updateAssetPost,
    updatePost,
  };
}
