import React from "react";

export default function OurSolution() {
  return (
    <section className="w-full bg-[#050F24] text-white py-24 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10">
      <div className="w-full md:w-1/2">
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
          Giải pháp của chúng tôi
        </h2>
      </div>

      <div className="w-full md:w-1/2 text-gray-300 leading-relaxed text-sm md:text-base">
        <div>
          <div className="font-semibold text-gray-100">
            Quản lý tiền bạc giờ đây không còn là nỗi lo.
          </div>
          <div>
            Giải pháp của chúng tôi giúp bạn theo dõi chi tiêu hằng ngày và biến
            động crypto trong cùng một ứng dụng đơn giản, dễ dùng. Bạn sẽ luôn
            biết số tiền của mình đang ở đâu, còn lại bao nhiêu và có thể tiết
            kiệm thế nào cho những mục tiêu quan trọng.
          </div>
        </div>
      </div>
    </section>
  );
}
