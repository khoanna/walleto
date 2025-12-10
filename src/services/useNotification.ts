import { useEffect, useState, useCallback, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import useAuthFetch from "./useAuthFetch";
import { getToken } from "./Token";

interface Notification {
    idNotification: string;
    title: string;
    content: string;
    isRead: boolean;
    notificationDate: string;
}

export const useNotification = (idUser: string) => {
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const {authFetch} = useAuthFetch();

    // Build SignalR connection
    const buildConnection = useCallback(() => {
        const token = getToken();
        if (!token) return null;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_SOCKET}/hubs/notification`, {
                accessTokenFactory: () => token,
                // Remove skipNegotiation to allow fallback transports
                // skipNegotiation: true,
                // Allow all transports: WebSockets -> Server-Sent Events -> Long Polling
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        return connection;
    }, []);

    // Connect to SignalR hub
    const connect = useCallback(async () => {
        if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
            return;
        }

        try {
            const connection = buildConnection();
            if (!connection) return;

            // Handle incoming notifications
            connection.on("ReceiveNotification", (notification: Notification) => {
                console.log("Received notification via SignalR:", notification);
                setNotifications((prev) => {
                    // Avoid duplicates
                    const exists = prev.some((n) => n.idNotification === notification.idNotification);
                    if (exists) return prev;
                    // Add new notification at the beginning
                    return [notification, ...prev];
                });
            });

            connection.onreconnecting(() => {
                console.log("Notification hub reconnecting...");
                setIsConnected(false);
            });

            connection.onreconnected(() => {
                console.log("Notification hub reconnected");
                setIsConnected(true);
            });

            connection.onclose(() => {
                console.log("Notification hub connection closed");
                setIsConnected(false);
            });

            await connection.start();
            connectionRef.current = connection;
            setIsConnected(true);
            console.log("Notification SignalR Connected!");
        } catch (err) {
            console.error("Notification SignalR Connection Error:", err);
        }
    }, [buildConnection]);

    // Disconnect from SignalR hub
    const disconnect = useCallback(async () => {
        if (connectionRef.current) {
            try {
                await connectionRef.current.stop();
                connectionRef.current = null;
                setIsConnected(false);
                console.log("Notification SignalR Disconnected");
            } catch (err) {
                console.error("Notification disconnect error:", err);
            }
        }
    }, []);

    // Connect and fetch notifications on mount
    useEffect(() => {
        if (idUser) {
            getListNotifications();
            connect();
        }

        return () => {
            disconnect();
        };
    }, [idUser]);

    const getListNotifications = async () => {
        try {
            setLoading(true);
            const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/notification/list-notification-by-user?idUser=${idUser}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            console.log(data);
            
            if (Array.isArray(data)) {
                setNotifications(data);
            } else if (data?.data && Array.isArray(data.data)) {
                setNotifications(data.data);
            }
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }   

    const seeNotifications = async (idNotification: string) => {
        try {
            setLoading(true);
            const response = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/notification/update-is-read-notification?idNotification=${idNotification}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            // Update local state instead of refetching
            setNotifications((prev) =>
                prev.map((n) =>
                    n.idNotification === idNotification ? { ...n, isRead: true } : n
                )
            );
            return data;
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    }

    // Count unread notifications
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
        loading,
        notifications,
        unreadCount,
        isConnected,
        getListNotifications,
        seeNotifications,
        connect,
        disconnect,
    };
}