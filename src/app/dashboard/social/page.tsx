"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ApexOptions } from "apexcharts";
import { Heart, MessageCircle, Send, Smile, Lock, X } from "lucide-react";
import { useUserContext } from "@/context";

// Dynamic ApexCharts
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
  image?: string;
  likes: number;
  comments: Comment[];
}

interface Friend {
  id: number;
  name: string;
  avatar: string;
}

export default function SocialPage() {
  const context = useUserContext();
  const permissions = context?.permissions;
  const hasPostPermission = permissions?.includes("SOCIAL_NETWORK") ?? false;

  // ---------------- MOCK DATA ----------------
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

  const suggestedFriends: Friend[] = [
    { id: 1, name: "Minh Anh", avatar: "https://i.pravatar.cc/150?img=6" },
    { id: 2, name: "Hoàng", avatar: "https://i.pravatar.cc/150?img=8" },
    { id: 3, name: "Thảo My", avatar: "https://i.pravatar.cc/150?img=11" },
  ];

  const friendList: Friend[] = [
    { id: 10, name: "Duy", avatar: "https://i.pravatar.cc/150?img=16" },
    { id: 11, name: "Khôi", avatar: "https://i.pravatar.cc/150?img=17" },
    { id: 12, name: "Nhi", avatar: "https://i.pravatar.cc/150?img=18" },
  ];

  // ---------------- UPLOAD ẢNH ----------------
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
  };

  // ---------------- CHAT POPUP ----------------
  const [currentChat, setCurrentChat] = useState<Friend | null>(null);

  const openChat = (friend: Friend) => {
    setCurrentChat(friend);
  };
  const closeChat = () => setCurrentChat(null);

  // ---------------- CHART ----------------
  const chartOptions: ApexOptions = {
    chart: {
      id: "cashflow",
      toolbar: { show: false },
      animations: { enabled: true },
    },
    colors: ["#22C55E", "#EF4444"],
    stroke: { curve: "smooth", width: 3 },
    legend: { position: "top" },
    grid: { borderColor: "rgba(200,200,200,0.2)" },
    xaxis: {
      categories: ["T1", "T2", "T3", "T4", "T5", "T6"],
      labels: { style: { colors: "#94a3b8" } },
    },
  };

  const chartSeries = [
    { name: "Tiền vào", data: [20, 30, 40, 35, 60, 80] },
    { name: "Tiền ra", data: [15, 25, 50, 70, 50, 45] },
  ];

  // -----------------------------------------------------
  // ------------------- UI RETURN -----------------------
  // -----------------------------------------------------

  return (
    <div className="min-h-screen p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* FEED LIST */}
      <div className="lg:col-span-8 space-y-6">
        {/* --- POST COMPOSER --- */}
        {hasPostPermission && (
          <div className="bg-background rounded-xl border p-4 space-y-3">
            <textarea
              placeholder="Viết gì đó..."
              className="w-full bg-background p-3 rounded-lg border text-sm resize-none"
              rows={3}
            />

            {/* BUTTON SELECT IMAGE */}
            <label className="px-3 py-1.5 text-xs text-gray-200 bg-[#F1F5F9] dark:bg-[#1C253A] rounded-full cursor-pointer hover:brightness-110">
              Upload ảnh từ máy bạn
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <label className="px-3 py-1.5 text-xs ml-2 text-gray-200 bg-[#F1F5F9] dark:bg-[#1C253A] rounded-full cursor-pointer hover:brightness-110">
              Chia sẻ danh mục đầu tư
              <button className="hidden" onClick={() => {}} />
            </label>
            <label className="px-3 py-1.5 text-xs ml-2 text-gray-200 bg-[#F1F5F9] dark:bg-[#1C253A] rounded-full cursor-pointer hover:brightness-110">
              Chia sẻ biểu đồ dòng tiền
              <button className="hidden" onClick={() => {}} />
            </label>

            {/* Image Preview */}
            {selectedImage && (
              <div className="mt-3 relative w-40">
                <img src={selectedImage} className="rounded-lg shadow-md" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <button className="flex mt-2 items-center  gap-2 bg-[#022d6d] text-white px-4 py-2 rounded-lg text-sm">
              <Send className="w-4" /> Đăng bài
            </button>
          </div>
        )}

        {/* --- POSTS FEED --- */}
        {posts.map((post) => (
          <div key={post.id} className="bg-background rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <img src={post.avatar} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-sm">{post.author}</p>
                <p className="text-xs">{post.username}</p>
              </div>
            </div>

            <p className="text-sm mt-3">{post.content}</p>

            {post.chart && (
              <div className="mt-3">
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="line"
                  height={240}
                />
              </div>
            )}

            {post.table && (
              <div className="overflow-x-auto mt-3 text-sm">
                <table className="w-full border-t">
                  <tbody>
                    {["Bitcoin", "Monero", "Cardano", "Ethereum"].map(
                      (c, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{c}</td>
                          <td>20B</td>
                          <td>$6,777</td>
                          <td>0.0000038</td>
                          <td className="text-green-500">+1.1%</td>
                          <td className="text-red-500">-2.4%</td>
                          <td className="text-green-500">+7.7%</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------- */}
      {/* RIGHT SIDEBAR */}
      {/* ----------------------------------------------------- */}

      <div className="lg:col-span-4 space-y-4">
        {/* Suggested Friends */}
        <div className="bg-background border p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Gợi ý kết bạn</h3>
          <div className="space-y-3">
            {suggestedFriends.map((f) => (
              <div key={f.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={f.avatar} className="w-10 h-10 rounded-full" />
                  <span className="text-sm">{f.name}</span>
                </div>
                <button className="px-3 py-1 bg-[#0066FF] text-white rounded-lg text-xs">
                  Kết bạn
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Friend List */}
        <div className="bg-background border p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Tin nhắn</h3>
          <div className="space-y-3">
            {friendList.map((f) => (
              <div
                key={f.id}
                onClick={() => openChat(f)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/50 cursor-pointer transition"
              >
                <img src={f.avatar} className="w-9 h-9 rounded-full" />
                <span className="text-sm">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------- */}
      {/* CHAT POP-UP */}
      {/* ----------------------------------------------------- */}
      {currentChat && (
        <div className="fixed bottom-4 right-4 bg-background border shadow-xl rounded-xl w-72 p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">{currentChat.name}</p>
            <X className="cursor-pointer" onClick={closeChat} />
          </div>

          <div className="h-40 bg-background/40 rounded-lg p-2 overflow-y-auto text-sm">
            {/* mock tin nhắn */}
            <p className="mb-2 bg-white/20 p-2 rounded-lg">Hello 👋</p>
          </div>

          <input
            className="w-full mt-2 px-3 py-2 border rounded-lg text-sm"
            placeholder="Nhập tin nhắn..."
          />
        </div>
      )}
    </div>
  );
}
