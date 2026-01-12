export default function Testimonials() {
  return (
    <section id="community" className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Đánh giá</span>
          <h2 className="section-title">
            Được Yêu thích bởi <span className="gradient-text">Hàng ngàn người</span>
          </h2>
          <p className="section-subtitle">
            Xem cộng đồng nói gì về trải nghiệm Walleto của họ
          </p>
        </div>

        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Walleto đã thay đổi cách tôi quản lý danh mục crypto. Việc theo dõi thời gian thực và thông tin từ AI đã giúp tôi tăng lợi nhuận thêm 40%."</p>
            <div className="testimonial-author">
              <div className="author-avatar">SC</div>
              <div>
                <div className="author-name">Sarah Chen</div>
                <div className="author-role">Nhà đầu tư Crypto</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Cuối cùng cũng có ứng dụng kết hợp tất cả tài chính của tôi vào một nơi. Trực quan hóa dòng tiền cực kỳ dễ hiểu và đã giúp tôi tiết kiệm hàng giờ mỗi tuần."</p>
            <div className="testimonial-author">
              <div className="author-avatar">MJ</div>
              <div>
                <div className="author-name">Marcus Johnson</div>
                <div className="author-role">Chủ Doanh nghiệp Nhỏ</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Tính năng cộng đồng là một bước ngoặt. Tôi đã học được rất nhiều từ các nhà đầu tư khác và các cuộc thảo luận luôn mang lại thông tin giá trị."</p>
            <div className="testimonial-author">
              <div className="author-avatar">ER</div>
              <div>
                <div className="author-name">Emily Rodriguez</div>
                <div className="author-role">Nhà phân tích Tài chính</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">"Trợ lý AI giống như có một cố vấn tài chính cá nhân 24/7. Nó nắm bắt những cơ hội mà tôi có thể đã bỏ lỡ và giúp tôi đi đúng hướng."</p>
            <div className="testimonial-author">
              <div className="author-avatar">DP</div>
              <div>
                <div className="author-name">David Park</div>
                <div className="author-role">Nhà giao dịch trong ngày</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
