import React from "react";
import Image from "next/image";

export default function FeatureSection() {
  const topFeatures = [
    {
      title: "Trực quan giao diện",
      desc: "Với những thông tin cần thiết, và những biểu đồ giúp bạn dễ xử lý thông tin.",
      img: "/Feature1.png",
      height: 240,
    },
    {
      title: "Thống kê thời gian thực",
      desc: "Cập nhật chính xác thị trường chứng khoán để không bỏ lỡ những thông tin quan trọng.",
      img: "/Feature2.png",
      height: 240,
    },
    {
      title: "Thông báo biến động",
      desc: "Cảnh báo biến động tài chính kịp thời giúp người dùng phản ứng nhanh với thị trường.",
      img: "/Feature3.png",
      height: 240,
    },
  ];

  const bottomFeatures = [
    {
      title: "Mục tiêu tiết kiệm",
      desc: "Tạo những mục tiêu chi tiêu để quản lý tài chính tốt hơn.",
      img: "/Feature4.png",
      height: 260,
    },
    {
      title: "Mục tiêu chi tiêu",
      desc: "Quản lý chi tiêu để sử dụng tiền hiệu quả hơn trong cuộc sống.",
      img: "/Feature5.png",
      height: 260,
    },
  ];

  return (
    <section className="w-full bg-[#050F24] text-white py-24 px-6 md:px-20">
      {/* ===== Title + Description ===== */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-200 to-gray-500 tracking-tight">
          Tích hợp mọi tính năng cần thiết
        </h2>
        <p className="text-gray-400 mt-4 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
          Walleto cung cấp đầy đủ các chức năng giúp bạn vừa tiện lợi, vừa dễ
          dàng trong việc quản lý tài chính, cũng như tiết kiệm chi tiêu của bản
          thân.
        </p>
      </div>

      {/* ===== Top Features ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {topFeatures.map((item, i) => (
          <div
            key={i}
            className="group bg-[#0C162C]/80 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.07)] transition-all duration-500 hover:-translate-y-1"
          >
            <div
              className="relative w-full flex items-center justify-center bg-gradient-to-b from-[#0D1933] to-[#0A1428]"
              style={{ height: `${item.height}px` }}
            >
              <Image
                src={item.img}
                alt={item.title}
                width={400}
                height={item.height}
                className="object-contain max-h-full transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-100">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Bottom Features ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {bottomFeatures.map((item, i) => (
          <div
            key={i}
            className="group bg-[#0C162C]/80 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.03)] hover:shadow-[0_0_25px_rgba(255,255,255,0.07)] transition-all duration-500 hover:-translate-y-1"
          >
            <div
              className="relative w-full flex items-center justify-center bg-gradient-to-b from-[#0D1933] to-[#0A1428]"
              style={{ height: `${item.height}px` }}
            >
              <Image
                src={item.img}
                alt={item.title}
                width={450}
                height={item.height}
                className="p-4 object-contain max-h-full transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-100">
                {item.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
