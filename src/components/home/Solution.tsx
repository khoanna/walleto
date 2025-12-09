// components/home/Solution.tsx
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

export default function OurSolution() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const leftItemVariants: Variants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const rightItemVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.3,
      },
    },
  };

  return (
    <motion.section
      className="w-full bg-[#050F24] text-white py-24 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between gap-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      variants={containerVariants}
    >
      <motion.div className="w-full md:w-1/2" variants={leftItemVariants}>
        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
          Giải pháp của chúng tôi
        </h2>
      </motion.div>

      <motion.div
        className="w-full md:w-1/2 text-gray-300 leading-relaxed text-sm md:text-base"
        variants={rightItemVariants}
      >
        <div>
          <motion.div
            className="font-semibold text-gray-100 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Quản lý tiền bạc giờ đây không còn là nỗi lo.
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Giải pháp của chúng tôi giúp bạn theo dõi chi tiêu hằng ngày và biến
            động crypto trong cùng một ứng dụng đơn giản, dễ dùng. Bạn sẽ luôn
            biết số tiền của mình đang ở đâu, còn lại bao nhiêu và có thể tiết
            kiệm thế nào cho những mục tiêu quan trọng.
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}
