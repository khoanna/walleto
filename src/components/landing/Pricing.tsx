import Link from 'next/link';

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
            <p className="pricing-desc">Sử dụng những tính năng cơ bản của ứng dụng, giúp dễ dàng quản lý đầu tư và xem diễn biến thị trường đang diễn ra</p>
            <div className="pricing-price">
              <span className="price gradient-text">$0</span>
            </div>
            <ul className="pricing-features">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Quản lý dòng tiền
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Biểu đồ dòng tiền
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Quản lý chi tiêu cá nhân
              </li>
              <li className="opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mr-2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Trao đổi cùng nhau trên blog
              </li>
              <li className="opacity-50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500 mr-2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Sử dụng chat bot thông minh
              </li>
            </ul>
            <Link href="/auth" className="btn btn-outline full-width">Bắt đầu ngay</Link>
          </div>

          <div className="pricing-card popular">
            <div className="popular-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                <path d="M2 20h20M5 20V8h14v12M12 4v4" />
              </svg>
            </div>
            <h3 className="pricing-name">Premium</h3>
            <p className="pricing-desc">Sử dụng những tính năng nâng cao giúp việc quản lý đầu tư dễ dàng hơn bao giờ hết với những công cụ nâng cao,</p>
            <div className="pricing-price">
              <span className="price gradient-text">120,000đ</span>
              <span className="period">/tháng</span>
            </div>
            <ul className="pricing-features">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Quản lý dòng tiền
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Biểu đồ dòng tiền
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Quản lý chi tiêu cá nhân
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Sử dụng chat bot thông minh
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mr-2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Trao đổi cùng nhau trên blog
              </li>
            </ul>
            <Link href="/auth" className="btn btn-hero full-width">Bắt đầu ngay</Link>
          </div>

          <div className="pricing-card">
            <h3 className="pricing-name">Doanh nghiệp</h3>
            <p className="pricing-desc">Dành cho đội nhóm & tổ chức</p>
            <div className="pricing-price">
              <span className="price gradient-text">Tùy chỉnh</span>
              <span className="period">/liên hệ</span>
            </div>
            <ul className="pricing-features">
              <li>✓ Tất cả tính năng gói Premium</li>
              <li>✓ Truy cập nhiều người dùng</li>
              <li>✓ Tích hợp tùy chỉnh</li>
              <li>✓ Quản lý tài khoản riêng</li>
              <li>✓ Đảm bảo SLA</li>
              <li>✓ Truy cập API</li>
            </ul>
            <Link href="/auth" className="btn btn-outline full-width">Liên hệ Kinh doanh</Link>
          </div>
        </div>

        <p className="pricing-guarantee">💰 Hoàn tiền trong 30 ngày · Không cần lý do</p>
      </div>
    </section>
  );
}
