export default function Trust() {
  return (
    <section className="trust-section">
      <div className="container">
        <div className="trust-badges">
          <div className="trust-badge">
            <div className="trust-icon">🛡️</div>
            <div className="trust-label">Bảo mật Cấp Ngân hàng</div>
            <div className="trust-desc">Mã hóa 256-bit</div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">🔒</div>
            <div className="trust-label">Quyền Riêng tư là Trên hết</div>
            <div className="trust-desc">Dữ liệu của bạn là của bạn</div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">🏆</div>
            <div className="trust-label">Chứng nhận SOC 2</div>
            <div className="trust-desc">Tuân thủ cấp doanh nghiệp</div>
          </div>
          <div className="trust-badge">
            <div className="trust-icon">👥</div>
            <div className="trust-label">50K+ Người dùng</div>
            <div className="trust-desc">Tin dùng nền tảng</div>
          </div>
        </div>

        <div className="partners">
          <p className="partners-title">Tích hợp tin cậy với các nền tảng hàng đầu</p>
          <div className="partners-list">
            <span>Coinbase</span>
            <span>Binance</span>
            <span>Stripe</span>
            <span>Plaid</span>
            <span>MetaMask</span>
            <span>Ledger</span>
          </div>
        </div>
      </div>
    </section>
  );
}
