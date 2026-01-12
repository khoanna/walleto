export default function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-glow"></div>
      <div className="container">
        <div className="cta-card">
          <h2 className="cta-title">
            Sẵn sàng Kiểm soát <span className="gradient-text">Tài chính?</span>
          </h2>
          <p className="cta-subtitle">
            Tham gia cùng hàng ngàn người dùng đang xây dựng sự thịnh vượng với Walleto. Bắt đầu dùng thử miễn phí ngay hôm nay—không cần thẻ tín dụng.
          </p>
          <div className="cta-buttons">
            <button className="btn btn-hero">
              Bắt đầu Miễn phí
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn btn-hero-outline">Liên hệ Kinh doanh</button>
          </div>
          <div className="cta-trust">
            <span>✓ Dùng thử miễn phí 14 ngày</span>
            <span>✓ Không cần thẻ tín dụng</span>
            <span>✓ Hủy bất cứ lúc nào</span>
          </div>
        </div>
      </div>
    </section>
  );
}
