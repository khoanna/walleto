import {useState} from "react";
import useAuthFetch from "./useAuthFetch";

export const useAdmin = () => {
  const [approveLoading, setApproveLoading] = useState(false);
  const {authFetch} = useAuthFetch();

  const getListPosApproved = async (idUser: string) => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-approved?idUser=${idUser}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const getListPostNotApproved = async () => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/list-post-not-approved`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const approvePost = async (postId: string) => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-approve-post?idPost=${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({isApproved: true}),
        }
      );
      const data = await response.json();
      setApproveLoading(false);
      return data;
    } catch (error) {
      setApproveLoading(false);
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const rejectPost = async (postId: string) => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/update-approve-post?idPost=${postId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({isApproved: false}),
        }
      );
      const data = await response.json();
      setApproveLoading(false);
      return data;
    } catch (error) {
      setApproveLoading(false);
      throw error;
    } finally {
      setApproveLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    setApproveLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/post/delete-post?idPost=${postId}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
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
    approvePost,
    rejectPost,
    approveLoading,
    deletePost,
  };
};
