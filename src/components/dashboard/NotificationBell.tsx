"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { useNotification } from "@/services/useNotification";

interface NotificationBellProps {
  idUser: string;
}

export default function NotificationBell({ idUser }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const {
    notifications,
    unreadCount,
    loading,
    seeNotifications,
  } = useNotification(idUser);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(16, rect.left), // Ensure at least 16px from left edge
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const handleNotificationClick = async (idNotification: string, isRead: boolean) => {
    if (!isRead) {
      await seeNotifications(idNotification);
    }
    // Navigate to social page and close dropdown
    setIsOpen(false);
    router.push("/dashboard/social");
  };

  // Dropdown content
  const dropdownContent = isOpen ? (
    <div 
      ref={dropdownRef}
      style={{ 
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
      className="w-80 sm:w-96 bg-[#0B162C] dark:bg-[#0A1226] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-[9999] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <Bell className="size-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="size-4 text-slate-400" />
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Bell className="size-6 text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div
                key={notification.idNotification}
                onClick={() => handleNotificationClick(notification.idNotification, notification.isRead)}
                className={`px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                  !notification.isRead ? "bg-blue-500/5" : ""
                }`}
              >
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.isRead 
                      ? "bg-white/5" 
                      : "bg-blue-500/20"
                  }`}>
                    {notification.isRead ? (
                      <CheckCheck className="size-4 text-slate-500" />
                    ) : (
                      <Bell className="size-4 text-blue-400" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-medium truncate ${
                        notification.isRead ? "text-slate-300" : "text-white"
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                      {notification.content}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {formatDate(notification.notificationDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/10 bg-white/5">
          <p className="text-[10px] text-center text-slate-500">
            Hiển thị {notifications.length} thông báo
          </p>
        </div>
      )}
    </div>
  ) : null;

  return (
    <>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 group"
        aria-label="Thông báo"
      >
        <Bell className="size-5 text-slate-300 group-hover:text-white transition-colors" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Portal for Dropdown */}
      {typeof window !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
}
