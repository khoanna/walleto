"use client";

import React from "react";
import { FileText, Users, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export type AdminSectionType = "posts" | "users";

interface AdminSidebarProps {
  activeSection: AdminSectionType;
  onSectionChange: (section: AdminSectionType) => void;
}

export const AdminSidebar = ({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) => {
  const router = useRouter();

  const sections = [
    {
      id: "posts" as const,
      label: "Quản lý bài viết",
      icon: FileText,
      description: "Duyệt và quản lý nội dung bài viết",
    },
    {
      id: "users" as const,
      label: "Quản lý người dùng",
      icon: Users,
      description: "Quản lý tài khoản và quyền truy cập",
    },
  ];

  return (
    <aside className="w-64 bg-[#0A1628]/90 backdrop-blur-xl border-r border-white/10 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-lg font-bold text-white">Admin</h2>
        <p className="text-xs text-slate-400 mt-1">Bảng điều khiển</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex flex-col gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                  : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-blue-400" : "text-slate-400"
                  }`}
                />
                <span
                  className={`font-medium text-sm ${
                    isActive ? "text-white" : ""
                  }`}
                >
                  {section.label}
                </span>
              </div>
              <p
                className={`text-xs ${
                  isActive ? "text-blue-200" : "text-slate-500"
                }`}
              >
                {section.description}
              </p>
            </button>
          );
        })}
      </nav>

      {/* Footer - Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Quay lại Dashboard</span>
        </button>
      </div>
    </aside>
  );
};
