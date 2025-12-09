// Socket using signalR
// endpoint: {process.env.NEXT_PUBLIC_SOCKET}/hubs/message
// socket name: ReceiveMessage

import {useState, useCallback, useRef} from "react";
import * as signalR from "@microsoft/signalr";
import {getToken} from "./Token";
import useAuthFetch from "./useAuthFetch";

// Types
export interface ChatMessage {
  idMessage: string;
  content: string;
  idSender: string;
  sendAt: string;
}

export interface ChatUser {
  idUser: string;
  name: string;
  urlAvatar: string | null;
}

interface UseChatOptions {
  idFriendship: string;
  currentUserId: string;
  onMessageReceived?: (message: ChatMessage) => void;
}

export const useChat = ({idFriendship, currentUserId, onMessageReceived}: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const {authFetch} = useAuthFetch();

  // Build SignalR connection
  const buildConnection = useCallback(() => {
    const token = getToken();
    if (!token) {
      setError("Không có token xác thực");
      return null;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SOCKET}/hubs/message`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    return connection;
  }, []);

  // Connect to hub
  const connect = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const connection = buildConnection();
      if (!connection) return;

      // Handle incoming messages
      connection.on(
        "ReceiveMessage",
        (message: {
          idUser: string;
          name: string;
          urlAvatar: string | null;
          messageDetailResponses: Array<{
            idMessage: string;
            content: string;
            isFriend: boolean;
            sendAt: string;
          }>;
        }) => {
          console.log("Received message via SignalR:", message);
          console.log("Current user ID:", currentUserId);
          console.log("Message sender ID:", message.idUser);

          // message.idUser is the ID of the person who SENT this message
          if (message.messageDetailResponses && message.messageDetailResponses.length > 0) {
            const senderId = message.idUser;
            const newMessages: ChatMessage[] = message.messageDetailResponses.map((msg) => ({
              idMessage: msg.idMessage,
              content: msg.content,
              idSender: senderId,
              sendAt: msg.sendAt,
            }));

            setMessages((prev) => {
              // Avoid duplicates
              const newMsgs = newMessages.filter(
                (newMsg) => !prev.some((m) => m.idMessage === newMsg.idMessage)
              );
              if (newMsgs.length === 0) return prev;
              return [...prev, ...newMsgs];
            });

            newMessages.forEach((msg) => onMessageReceived?.(msg));
          }
        }
      );

      // Connection state handlers
      connection.onreconnecting((err) => {
        console.log("Reconnecting...", err);
        setIsConnected(false);
        setIsConnecting(true);
      });

      connection.onreconnected((connectionId) => {
        console.log("Reconnected:", connectionId);
        setIsConnected(true);
        setIsConnecting(false);
      });

      connection.onclose((err) => {
        console.log("Connection closed:", err);
        setIsConnected(false);
        setIsConnecting(false);
      });

      await connection.start();
      connectionRef.current = connection;
      setIsConnected(true);
      console.log("SignalR Connected!");
    } catch (err) {
      console.error("SignalR Connection Error:", err);
      setError("Không thể kết nối chat. Vui lòng thử lại.");
    } finally {
      setIsConnecting(false);
    }
  }, [buildConnection, idFriendship, onMessageReceived]);

  // Disconnect from hub
  const disconnect = useCallback(async () => {
    if (connectionRef.current) {
      try {
        await connectionRef.current.stop();
        connectionRef.current = null;
        setIsConnected(false);
        console.log("SignalR Disconnected");
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    }
  }, []);

  // Get message history
  const getMessages = useCallback(async () => {
    if (!idFriendship) return;

    setIsLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/message/list-message?idFriendship=${idFriendship}&idUser=${currentUserId}`,
        {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        }
      );
      const data = await response.json();
      console.log("API Response:", data);

      if (data?.data?.messageDetailResponses && Array.isArray(data.data.messageDetailResponses)) {
        // Map directly from response - use idSender from each message
        const mappedMessages: ChatMessage[] = data.data.messageDetailResponses.map(
          (msg: {idMessage: string; content: string; idSender: string; sendAt: string}) => ({
            idMessage: msg.idMessage,
            content: msg.content,
            idSender: msg.idSender, // Use idSender directly from response
            sendAt: msg.sendAt,
          })
        );

        console.log("Current user ID:", currentUserId);
        console.log("Mapped messages:", mappedMessages);

        setMessages(mappedMessages);
      } else {
        console.warn("Messages data format unexpected:", data);
        setMessages([]);
      }
    } catch (err) {
      console.error("Get messages error:", err);
      setError("Không thể tải tin nhắn");
    } finally {
      setIsLoading(false);
    }
  }, [idFriendship, currentUserId, authFetch]);

  // Send message via API
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!idFriendship || !currentUserId || !content.trim()) return false;

      try {
        const response = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/message/send-message`,
          {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              idFriendship: idFriendship,
              idUser: currentUserId,
              content: content.trim(),
            }),
          }
        );

        const data = await response.json();

        if (data?.success || data?.data) {
          // Optimistic update - add message locally
          const newMessage: ChatMessage = {
            idMessage: Date.now().toString(),
            idSender: currentUserId,
            content: content.trim(),
            sendAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, newMessage]);
          return true;
        } else {
          setError(data?.message || "Không thể gửi tin nhắn");
          return false;
        }
      } catch (err) {
        console.error("Send message error:", err);
        setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
        return false;
      }
    },
    [idFriendship, currentUserId, authFetch]
  );

  const deleteMessageHistory = async () => {
    if (!idFriendship) return;

    setIsLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/message/delete-message?idFriendship=${idFriendship}`,
        {
          method: "DELETE",
          headers: {"Content-Type": "application/json"},
        }
      );
      const data = await response.json();
      console.log(data);

      if (data?.success) {
        setMessages([]);
      } else {
        setError(data?.message || "Không thể xóa lịch sử tin nhắn");
      }
    } catch (err) {
      console.error("Delete messages error:", err);
      setError("Không thể xóa lịch sử tin nhắn");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    messages,
    isConnected,
    isConnecting,
    isLoading,
    error,
    sendMessage,
    getMessages,
    connect,
    disconnect,
    deleteMessageHistory,
    clearError: () => setError(null),
  };
};

export default useChat;
