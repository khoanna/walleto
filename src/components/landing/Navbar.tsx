"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo">
          <Link href="/">
            <Image src="/logo.png" alt="Walleto Logo" width={32} height={32} />
          </Link>
          <span className="logo-text">Walleto</span>
        </div>
        <div className={`nav-links ${isOpen ? 'show' : ''}`}>
          <Link href="#features">Tính năng</Link>
          <Link href="#about">Giới thiệu</Link>
          <Link href="#community">Cộng đồng</Link>
        </div>
        <div className={`nav-cta ${isOpen ? 'show' : ''}`}>
          <Link href="/auth" className="btn btn-primary">Bắt đầu ngay</Link>
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
