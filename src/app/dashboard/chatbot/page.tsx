"use client";

import { useState, useRef, useEffect } from "react";
import { Send, User, Bot } from "lucide-react";
import useAI from "@/services/useAI";
import { useUserContext } from "@/context";
import { ChatResponse } from "@/type/Chat";

interface Message {
    id: number;
    sender: "user" | "model";
    text: string;
}

export default function ChatBoxPage() {
    const { aiLoading, getHistoryChat, generateMessage } = useAI();
    const context = useUserContext();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: "model",
            text: "Xin chào 👋 Tôi là Walleto Bot — trợ lý tài chính của bạn. Bạn muốn tôi giúp gì hôm nay?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch chat history on mount
    useEffect(() => {
        const fetchHistory = async () => {
            if (!context?.user?.idUser) return;
            
            try {
                const response = await getHistoryChat(context.user.idUser);
                const history: ChatResponse[] = response?.data || [];
                
                // Convert history to messages format
                const historyMessages: Message[] = history.map((chat, index) => ({
                    id: Date.now() + index,
                    sender: chat.role === "user" ? "user" : "model",
                    text: chat.message,
                }));
                
                // Add history after welcome message
                setMessages((prev) => [prev[0], ...historyMessages]);
            } catch (error) {
                console.error("Error loading chat history:", error);
            }
        };
        
        fetchHistory();
    }, [context?.user?.idUser]);

    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !context?.user?.idUser || isLoadingResponse) return;

        const userMessage = input.trim();
        const newMsg: Message = { id: Date.now(), sender: "user", text: userMessage };
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        setIsLoadingResponse(true);

        try {
            // Call API to generate response
            const response = await generateMessage({
                body: {
                    idUser: context.user.idUser,
                    userMessage: userMessage,
                }
            });

            // Extract bot response from API - handle {aiResponse: "message"} format
            let botMessage = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.";
            
            if (response?.data) {
                // If response.data is an object with aiResponse property
                if (typeof response.data === 'object' && response.data.aiResponse) {
                    botMessage = response.data.aiResponse;
                }
                // If response.data is already a string
                else if (typeof response.data === 'string') {
                    botMessage = response.data;
                }
            }
            
            // Clean up message - remove escape characters but keep markdown
            botMessage = botMessage
                .replace(/\\n/g, '\n')           // Replace \n with actual newline
                .replace(/\\"/g, '"')            // Replace \" with "
                .replace(/\\'/g, "'")            // Replace \' with '
                .replace(/\\\\/g, '\\')          // Replace \\ with \
                .trim();                         // Remove extra whitespace
            
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "model",
                    text: botMessage,
                },
            ]);
        } catch (error) {
            console.error("Error generating message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: "model",
                    text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                },
            ]);
        } finally {
            setIsLoadingResponse(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-[#111318] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3 bg-[#111318]">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-white">Walleto AI Assistant</h2>
                    <p className="text-xs text-gray-400">Trợ lý tài chính thông minh của bạn</p>
                </div>
            </div>

            {/* Chat messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#111318]"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.sender === "user" ? "bg-gray-700" : "bg-primary/20"
                        }`}>
                            {msg.sender === "user" ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-primary" />}
                        </div>

                        {/* Message Bubble */}
                        <div
                            className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                                msg.sender === "user"
                                    ? "bg-gray-800 text-white border border-gray-700 rounded-tr-none"
                                    : "bg-primary/10 text-gray-200 border border-primary/10 rounded-tl-none"
                            }`}
                        >
                            {msg.sender === "model" ? (
                                // Format bot messages with markdown-like styling
                                msg.text.split('\n').map((line, i) => {
                                    // Parse **bold** text
                                    const parts = line.split(/(\*\*.*?\*\*)/g);
                                    return (
                                        <span key={i}>
                                            {parts.map((part, j) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    // Bold text
                                                    return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
                                                } else if (part.startsWith('*') && part.endsWith('*')) {
                                                    // Italic text
                                                    return <em key={j} className="italic">{part.slice(1, -1)}</em>;
                                                } else {
                                                    return <span key={j}>{part}</span>;
                                                }
                                            })}
                                            {i < msg.text.split('\n').length - 1 && <br />}
                                        </span>
                                    );
                                })
                            ) : (
                                // User messages - plain text
                                msg.text
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Loading indicator */}
                {isLoadingResponse && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot size={14} className="text-primary" />
                        </div>
                        <div className="bg-primary/10 border border-primary/10 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input box */}
            <div className="p-4 border-t border-gray-800 flex items-center gap-3 bg-[#111318]">
                <div className="flex-1 bg-gray-800 rounded-full flex items-center px-4 border border-gray-700 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                    <input
                        type="text"
                        placeholder="Hỏi tôi về thị trường, danh mục đầu tư..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        disabled={isLoadingResponse}
                        className="w-full py-3 bg-transparent text-sm text-white focus:outline-none placeholder-gray-500 disabled:opacity-50"
                    />
                </div>
                <button
                    onClick={handleSend}
                    disabled={isLoadingResponse || !input.trim()}
                    className="bg-primary hover:bg-primary-hover text-white p-3 rounded-full cursor-pointer transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
