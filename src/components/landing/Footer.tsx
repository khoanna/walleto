import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <div className="logo-icon">W</div>
              <span className="logo-text">Walleto</span>
            </div>
            <p className="footer-tagline">Làm chủ tài chính, xây dựng tương lai với thông tin chi tiết từ AI.</p>
            <div className="social-links">
              <Link href="#">𝕏</Link>
              <Link href="#">in</Link>
              <Link href="#">▶</Link>
            </div>
          </div>

          <div className="footer-links">
            <h4>Sản phẩm</h4>
            <Link href="#">Tính năng</Link>
            <Link href="#">Bảng giá</Link>
            <Link href="#">Bảo mật</Link>
            <Link href="#">Tích hợp</Link>
          </div>

          <div className="footer-links">
            <h4>Công ty</h4>
            <Link href="#">Giới thiệu</Link>
            <Link href="#">Blog</Link>
            <Link href="#">Tuyển dụng</Link>
            <Link href="#">Báo chí</Link>
          </div>

          <div className="footer-links">
            <h4>Tài nguyên</h4>
            <Link href="#">Tài liệu</Link>
            <Link href="#">Trung tâm Hỗ trợ</Link>
            <Link href="#">Cộng đồng</Link>
            <Link href="#">Liên hệ</Link>
          </div>

          <div className="footer-links">
            <h4>Pháp lý</h4>
            <Link href="#">Quyền riêng tư</Link>
            <Link href="#">Điều khoản</Link>
            <Link href="#">Cookies</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Walleto. Đã đăng ký Bản quyền.</p>
        </div>
      </div>
    </footer>
  );
}
