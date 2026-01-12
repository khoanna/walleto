export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      
      <div className="container hero-content">
        <div className="badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
          </svg>
          <span>Quản lý Tài chính bằng AI</span>
        </div>
        
        <h1 className="hero-title">
          Làm chủ <span className="gradient-text">Tài chính</span><br/>
          Xây dựng Tương lai
        </h1>
        
        <p className="hero-subtitle">
          Theo dõi tiền điện tử, quản lý dòng tiền, kết nối cộng đồng và nhận thông tin chi tiết từ AI—tất cả trong một nền tảng mạnh mẽ.
        </p>
        
        <div className="hero-buttons">
          <button className="btn btn-hero">
            Dùng thử Miễn phí
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button className="btn btn-hero-outline">Xem Demo</button>
        </div>
        
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-value gradient-text">50K+</div>
            <div className="stat-label">Người dùng Tích cực</div>
          </div>
          <div className="stat">
            <div className="stat-value gradient-text">$2.5B</div>
            <div className="stat-label">Tài sản Theo dõi</div>
          </div>
          <div className="stat">
            <div className="stat-value gradient-text">99.9%</div>
            <div className="stat-label">Thời gian Hoạt động</div>
          </div>
        </div>
      </div>
    </section>
  );
}
