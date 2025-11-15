"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ApexOptions } from "apexcharts";
import { Heart, MessageCircle, Send, Smile, Lock } from "lucide-react";
import { useUserContext } from "@/context";

// Dynamic import cho ApexCharts (tránh lỗi SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Comment {
  id: number;
  author: string;
  text: string;
}

interface Post {
  id: number;
  author: string;
  username: string;
  avatar: string;
  content: string;
  chart?: boolean;
  table?: boolean;
  likes: number;
  comments: Comment[];
}

export default function SocialPage() {
  const context = useUserContext();
  const permissions = context?.permissions;
  const hasPostPermission = permissions?.includes("SOCIAL_NETWORK") ?? false;

  const [posts] = useState<Post[]>([
    {
      id: 1,
      author: "Khang Dương",
      username: "@grcs_1212",
      avatar: "https://i.pravatar.cc/150?img=3",
      content: "Đây là dòng tiền của tôi 💰",
      chart: true,
      likes: 12542,
      comments: [
        { id: 1, author: "Tiến Khang", text: "Rất chi tiết 🔥" },
        { id: 2, author: "Ngọc Anh", text: "Chart này đẹp thật 😍" },
      ],
    },
    {
      id: 2,
      author: "Tiến Khang",
      username: "@daxuu",
      avatar: "https://i.pravatar.cc/150?img=5",
      content: "Đây là danh mục đầu tư của tôi 📊",
      table: true,
      likes: 12342,
      comments: [{ id: 1, author: "Bình", text: "Nice portfolio 💪" }],
    },
  ]);

  // Apex chart config
  const chartOptions: ApexOptions = {
    chart: {
      id: "cashflow",
      toolbar: { show: false },
      animations: { enabled: true },
      fontFamily: "Inter, sans-serif",
    },
    colors: ["#22C55E", "#EF4444"],
    stroke: { curve: "smooth", width: 3 },
    legend: { position: "top" },
    grid: { borderColor: "rgba(200,200,200,0.2)" },
    xaxis: {
      categories: ["T1", "T2", "T3", "T4", "T5", "T6"],
      labels: { style: { colors: "#94a3b8" } },
    },
    yaxis: {
      labels: { style: { colors: "#94a3b8" } },
    },
  };

  const chartSeries = [
    { name: "Tiền vào", data: [20, 30, 40, 35, 60, 80] },
    { name: "Tiền ra", data: [15, 25, 50, 70, 50, 45] },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 space-y-6 sm:space-y-8 transition-colors">
      {/* Post composer */}
      {hasPostPermission ? (
        <div className="bg-background rounded-xl shadow-sm border border-[var(--color-border)]/10 p-4 sm:p-5">
          <textarea
            placeholder="Viết gì đó..."
            className="w-full bg-background p-3 rounded-lg border border-[var(--color-border)]/20 focus:ring-1 focus:ring-[#0066FF]/40 text-xs sm:text-sm resize-none"
            rows={3}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {[
              "Chia sẻ danh mục đầu tư",
              "Chia sẻ phân bố tài chính",
              "Chia sẻ dòng tiền",
            ].map((text, idx) => (
              <button
                key={idx}
                className="text-xs px-3 py-1.5 rounded-full bg-[#F1F5F9] dark:bg-[#1C253A] hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                {text}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <button className="flex items-center gap-2 bg-[#0066FF] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#3385ff] active:scale-95 transition text-xs sm:text-sm">
              <Send className="w-4 h-4" /> Đăng bài
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-xl shadow-sm border border-[var(--color-border)]/10 p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-700">
              <Lock className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Tính năng mạng xã hội bị khóa
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Bạn không có quyền truy cập tính năng mạng xã hội. Vui lòng nâng cấp
            tài khoản để sử dụng.
          </p>
        </div>
      )}

      {/* Feed */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-background rounded-xl shadow-sm border border-[var(--color-border)]/10 p-4 sm:p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={post.avatar}
              alt={post.author}
              width={40}
              height={40}
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
            />
            <div>
              <div className="font-semibold text-sm sm:text-base">
                {post.author}
              </div>
              <div className="text-xs sm:text-sm">{post.username}</div>
            </div>
          </div>

          {/* Content */}
          <p className="text-xs sm:text-sm leading-relaxed">{post.content}</p>

          {/* Chart */}
          {post.chart && (
            <div className="mt-3 overflow-x-auto">
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="line"
                height={240}
              />
            </div>
          )}

          {/* Table */}
          {post.table && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-t border-[var(--color-border)]/10 mt-2">
                <thead>
                  <tr>
                    <th className="py-2 whitespace-nowrap">Name</th>
                    <th className="py-2 whitespace-nowrap">Giá mua</th>
                    <th className="py-2 whitespace-nowrap">Giá hiện tại</th>
                    <th className="py-2 whitespace-nowrap">Tổng cộng</th>
                    <th className="py-2 whitespace-nowrap">7D</th>
                    <th className="py-2 whitespace-nowrap">30D</th>
                    <th className="py-2 whitespace-nowrap">1Y</th>
                  </tr>
                </thead>
                <tbody>
                  {["Bitcoin", "Monero", "Cardano", "Ethereum"].map(
                    (coin, i) => (
                      <tr
                        key={i}
                        className="border-t border-[var(--color-border)]/10 hover:bg-background/50 transition"
                      >
                        <td className="py-2 whitespace-nowrap">{coin}</td>
                        <td className="whitespace-nowrap">20B</td>
                        <td className="whitespace-nowrap">$6,777</td>
                        <td className="whitespace-nowrap">0.0000038</td>
                        <td className="text-green-500 whitespace-nowrap">
                          +1.1%
                        </td>
                        <td className="text-red-500 whitespace-nowrap">
                          -2.4%
                        </td>
                        <td className="text-green-500 whitespace-nowrap">
                          +7.7%
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]/10">
            <span className="text-xs sm:text-sm">
              {post.likes.toLocaleString()} Likes
            </span>
            <div className="flex gap-3 sm:gap-4">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:scale-110 hover:text-red-500 transition" />
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:scale-110 transition" />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-3 pt-2">
            {post.comments.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-2 text-xs sm:text-sm"
              >
                <img
                  src="https://i.pravatar.cc/100?img=12"
                  alt={c.author}
                  width={28}
                  height={28}
                  className="rounded-full w-7 h-7 sm:w-7 sm:h-7"
                />
                <div className="bg-background px-3 py-2 rounded-xl shadow-sm">
                  <span className="font-medium">{c.author}: </span>
                  {c.text}
                </div>
              </div>
            ))}

            {/* Input comment */}
            <div className="flex items-center gap-2 mt-2">
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Thêm bình luận..."
                className="flex-1 bg-background border border-[var(--color-border)]/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-[#0066FF]/40 outline-none"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
