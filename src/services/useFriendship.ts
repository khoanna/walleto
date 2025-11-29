import useAuthFetch from "./useAuthFetch";
import { useState } from "react";

export default function useFriendship() {
  const [friendshipLoading, setFriendshipLoading] = useState(false);
  const { authFetch } = useAuthFetch();

  // Wrapper để tự động bật/tắt loading
  const handleRequest = async (url: string, method: string, body?: any) => {
    try {
      setFriendshipLoading(true);
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      return await res.json();
    } catch (error) {
      throw error;
    } finally {
      setFriendshipLoading(false);
    }
  };

  const createFrienship = (body: { idUser: string; idRef: string }) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/create-friendship`,
      "POST",
      body
    );

  const getFriendshipOfUser = (idUser: string) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/list-friendship-of-user?idUser=${idUser}`,
      "GET"
    );

  const getFriendshipSentOfUser = (idUser: string) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/list-friendship-sent-of-user?idUser=${idUser}`,
      "GET"
    );

  const getFriendshipReceiveOfUser = (idUser: string) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/list-friendship-received-of-user?idUser=${idUser}`,
      "GET"
    );

  const acceptFrienship = (idFriendship: string, body: { status: string }) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/accept-friendship?idFriendship=${idFriendship}`,
      "PATCH",
      body
    );

  const rejectFrienship = (idFriendship: string, body: { status: string }) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/reject-friendship?idFriendship=${idFriendship}`,
      "PATCH",
      body
    );

  const deleteFrienship = (idFriendship: string) =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/friendship/delete-friendship?idFriendship=${idFriendship}`,
      "DELETE"
    );

  const getUserList = () =>
    handleRequest(
      `${process.env.NEXT_PUBLIC_API_URL}/user/list-user-with-user-role`,
      "GET"
    );

  return {
    friendshipLoading, // Export biến này để dùng ở UI
    createFrienship,
    getFriendshipOfUser,
    getFriendshipSentOfUser,
    getFriendshipReceiveOfUser,
    acceptFrienship,
    rejectFrienship,
    deleteFrienship,
    getUserList,
  };
}
