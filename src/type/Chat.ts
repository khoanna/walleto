export interface ChatResponse {
    role: string;
    message: string;
}

// For SignalR chat
export interface ChatMessage {
    idMessage?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: string;
    isRead?: boolean;
}

export interface ChatHistoryResponse {
    success: boolean;
    message: string;
    statusCode: number;
    data: ChatMessage[];
}