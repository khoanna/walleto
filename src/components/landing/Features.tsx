export default function Features() {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Tất cả Những gì Bạn cần để <span className="gradient-text">Thành công</span>
          </h2>
          <p className="section-subtitle">
            Các công cụ mạnh mẽ được thiết kế để giúp bạn kiểm soát hoàn toàn hành trình tài chính của mình
          </p>
        </div>

        <div className="bento-grid">
          {/* <!-- Crypto Portfolio - Large --> */}
          <div className="bento-card bento-large">
            <div className="bento-glow bento-glow-orange"></div>
            <div className="bento-content">
              <div className="bento-header">
                <div>
                  <h3 className="bento-title">Danh mục Crypto</h3>
                  <p className="bento-desc">Theo dõi tất cả tài sản tiền điện tử của bạn trong thời gian thực. Xem hiệu suất trên các sàn giao dịch, phân tích xu hướng với biểu đồ nâng cao và đưa ra quyết định sáng suốt.</p>
                </div>
                <div className="bento-icon bento-icon-orange">₿</div>
              </div>
              <div className="mini-chart">
                <div className="bar" style={{height: '40%'}}></div>
                <div className="bar" style={{height: '65%'}}></div>
                <div className="bar" style={{height: '45%'}}></div>
                <div className="bar" style={{height: '80%'}}></div>
                <div className="bar" style={{height: '55%'}}></div>
                <div className="bar" style={{height: '90%'}}></div>
                <div className="bar" style={{height: '70%'}}></div>
                <div className="bar" style={{height: '85%'}}></div>
                <div className="bar" style={{height: '60%'}}></div>
                <div className="bar" style={{height: '95%'}}></div>
                <div className="bar" style={{height: '75%'}}></div>
                <div className="bar" style={{height: '88%'}}></div>
              </div>
            </div>
          </div>

          {/* <!-- Money Flow --> */}
          <div className="bento-card">
            <div className="bento-glow bento-glow-primary"></div>
            <div className="bento-content">
              <div className="bento-icons-row">
                <div className="bento-icon-small">💰</div>
                <div className="bento-icon-small">📊</div>
              </div>
              <h3 className="bento-title">Dòng tiền</h3>
              <p className="bento-desc-sm">Trực quan hóa thu nhập & chi tiêu. Thiết lập ngân sách và theo dõi thói quen chi tiêu.</p>
              <div className="progress-ring-container">
                <svg className="progress-ring" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" className="progress-bg"/>
                  <circle cx="32" cy="32" r="28" className="progress-fill"/>
                </svg>
                <span className="progress-text">75%</span>
              </div>
              <div className="budget-info">
                <div className="budget-label">Ngân sách Đã dùng</div>
                <div className="budget-amount">$3,750 / $5,000</div>
              </div>
            </div>
          </div>

          {/* <!-- Social Hub --> */}
          <div className="bento-card">
            <div className="bento-glow bento-glow-blue"></div>
            <div className="bento-content">
              <div className="bento-icon-small blue">💬</div>
              <h3 className="bento-title">Trung tâm Xã hội</h3>
              <p className="bento-desc-sm">Kết nối với các nhà đầu tư khác. Chia sẻ thông tin chi tiết và học hỏi từ cộng đồng.</p>
              <div className="chat-bubbles">
                <div className="chat-row">
                  <div className="avatar"></div>
                  <div className="chat-bubble left">BTC hôm nay có vẻ tăng! 📈</div>
                </div>
                <div className="chat-row right">
                  <div className="chat-bubble right">Đồng ý! Vừa mua thêm 🚀</div>
                  <div className="avatar primary"></div>
                </div>
              </div>
            </div>
          </div>

          {/* <!-- AI Agent - Large --> */}
          <div className="bento-card bento-large">
            <div className="bento-glow bento-glow-violet"></div>
            <div className="bento-content ai-card">
              <div className="ai-header">
                <div className="bento-icon-small violet">🤖</div>
                <div className="ai-badge">
                  <span className="pulse-dot"></span>
                  Hỗ trợ bởi AI
                </div>
              </div>
              <h3 className="bento-title">Trợ lý AI Thông minh</h3>
              <p className="bento-desc">Nhận tư vấn tài chính cá nhân hóa được hỗ trợ bởi AI. Tự động hóa các tác vụ, nhận đề xuất thông minh và đi trước thị trường với phân tích dự đoán.</p>
              <div className="ai-capabilities">
                <div className="capability">🛡️ Phân tích Rủi ro</div>
                <div className="capability">📊 Thông tin Chi tiết</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
