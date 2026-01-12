export default function HowItWorks() {
  return (
    <section id="about" className="how-it-works-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Cách hoạt động</span>
          <h2 className="section-title">
            Bắt đầu với <span className="gradient-text">4 Bước Đơn giản</span>
          </h2>
          <p className="section-subtitle">
            Từ đăng ký đến làm chủ tài chính—quy trình tinh gọn của chúng tôi giúp mọi thứ trở nên dễ dàng
          </p>
        </div>

        <div className="timeline">
          <div className="timeline-line"></div>
          
          <div className="timeline-item left">
            <div className="timeline-number gradient-primary">01</div>
            <div className="timeline-card">
              <h3>Tạo Tài khoản</h3>
              <p>Đăng ký trong vài giây chỉ với email của bạn. Không cần thẻ tín dụng để bắt đầu.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-number gradient-blue">02</div>
            <div className="timeline-card">
              <h3>Kết nối Tài sản</h3>
              <p>Liên kết ví tiền điện tử, tài khoản ngân hàng và danh mục đầu tư của bạn một cách an toàn.</p>
            </div>
          </div>

          <div className="timeline-item left">
            <div className="timeline-number gradient-violet">03</div>
            <div className="timeline-card">
              <h3>Theo dõi & Phân tích</h3>
              <p>Nhận thông tin chi tiết theo thời gian thực, đề xuất từ AI và phân tích toàn diện.</p>
            </div>
          </div>

          <div className="timeline-item right">
            <div className="timeline-number gradient-orange">04</div>
            <div className="timeline-card">
              <h3>Gia tăng Tài sản</h3>
              <p>Đưa ra quyết định thông minh hơn, đạt được mục tiêu và xây dựng thành công tài chính lâu dài.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
