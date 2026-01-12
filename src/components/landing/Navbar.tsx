"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo">
          <div className="logo-icon">W</div>
          <span className="logo-text">Walleto</span>
        </div>
        <div className={`nav-links ${isOpen ? 'show' : ''}`}>
          <Link href="#features">Tính năng</Link>
          <Link href="#about">Giới thiệu</Link>
          <Link href="#community">Cộng đồng</Link>
        </div>
        <div className={`nav-cta ${isOpen ? 'show' : ''}`}>
          <button className="btn btn-ghost">Đăng nhập</button>
          <button className="btn btn-primary">Bắt đầu ngay</button>
        </div>
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </nav>
  );
}
