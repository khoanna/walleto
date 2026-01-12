export default function Pricing() {
  return (
    <section className="pricing-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Bảng giá</span>
          <h2 className="section-title">
            Đơn giản, Minh bạch <span className="gradient-text">Bảng giá</span>
          </h2>
          <p className="section-subtitle">
            Chọn gói phù hợp với nhu cầu của bạn. Nâng cấp hoặc hạ cấp bất cứ lúc nào.
          </p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <h3 className="pricing-name">Miễn phí</h3>
            <p className="pricing-desc">Hoàn hảo để bắt đầu</p>
            <div className="pricing-price">
              <span className="price gradient-text">$0</span>
              <span className="period">/trọn đời</span>
            </div>
            <ul className="pricing-features">
              <li>✓ Theo dõi tới 5 tài sản crypto</li>
              <li>✓ Theo dõi dòng tiền cơ bản</li>
              <li>✓ Truy cập cộng đồng</li>
              <li>✓ Hỗ trợ qua Email</li>
            </ul>
            <button className="btn btn-outline full-width">Bắt đầu ngay</button>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">✨ Phổ biến nhất</div>
            <h3 className="pricing-name">Chuyên nghiệp</h3>
            <p className="pricing-desc">Dành cho nhà đầu tư nghiêm túc</p>
            <div className="pricing-price">
              <span className="price gradient-text">$19</span>
              <span className="period">/tháng</span>
            </div>
            <ul className="pricing-features">
              <li>✓ Theo dõi crypto không giới hạn</li>
              <li>✓ Phân tích & thông tin nâng cao</li>
              <li>✓ Đề xuất hỗ trợ bởi AI</li>
              <li>✓ Tính năng cộng đồng ưu tiên</li>
              <li>✓ Cảnh báo thời gian thực</li>
              <li>✓ Xuất báo cáo</li>
            </ul>
            <button className="btn btn-hero full-width">⚡ Bắt đầu Dùng thử</button>
          </div>

          <div className="pricing-card">
            <h3 className="pricing-name">Doanh nghiệp</h3>
            <p className="pricing-desc">Dành cho đội nhóm & tổ chức</p>
            <div className="pricing-price">
              <span className="price gradient-text">Tùy chỉnh</span>
              <span className="period">/liên hệ</span>
            </div>
            <ul className="pricing-features">
              <li>✓ Tất cả tính năng gói Chuyên nghiệp</li>
              <li>✓ Truy cập nhiều người dùng</li>
              <li>✓ Tích hợp tùy chỉnh</li>
              <li>✓ Quản lý tài khoản riêng</li>
              <li>✓ Đảm bảo SLA</li>
              <li>✓ Truy cập API</li>
            </ul>
            <button className="btn btn-outline full-width">Liên hệ Kinh doanh</button>
          </div>
        </div>

        <p className="pricing-guarantee">💰 Hoàn tiền trong 30 ngày · Không cần lý do</p>
      </div>
    </section>
  );
}
