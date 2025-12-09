"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  Wallet2,
  LogOut,
  Bot,
  Newspaper,
  Share2,
  Menu,
  X,
  Star,
  Crown,
  Shield,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import useAuth from "@/services/useAuth";
import { useUserContext } from "@/context";
import { getToken } from "@/services/Token";
import { decodeJWT } from "@/services/JwtDecoder";
import NotificationBell from "./NotificationBell";

// Interface riêng cho Context (chỉ cần 3 field)
interface ContextUser {
  idUser: string;
  name: string;
  email: string;
}

type Item = { label: string; href: string; icon: React.ReactNode };

const NAV: Item[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    label: "Danh mục đầu tư",
    href: "/dashboard/portfolio",
    icon: <Search className="size-5" />,
  },
  {
    label: "Quản lý tài chính",
    href: "/dashboard/wallet",
    icon: <Wallet2 className="size-5" />,
  },

  {
    label: "Báo chí",
    href: "/dashboard/news",
    icon: <Newspaper className="size-5 " />,
  },
  {
    label: "Chatbot",
    href: "/dashboard/chatbot",
    icon: <Bot className="size-5 text-yellow-400" />,
  },
  {
    label: "Mạng xã hội",
    href: "/dashboard/social",
    icon: <Share2 className="size-5 text-yellow-400" />,
  },
  {
    label: "Admin",
    href: "/admin",
    icon: <Shield className="size-5 text-red-400" />,
  },
  { label: "Đăng xuất", href: "", icon: <LogOut className="size-5" /> },
];

const WIDTH = 260;
const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ADMIN_ROLE = "ADMIN";

export default function Sidebar() {
  const activePath = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const context = useUserContext();
  const userInfo = context?.user; // ← Kiểu: ContextUser | undefined
  const permissions = context?.permissions; // ← Lấy permissions từ context

  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  // Check admin role
  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJWT(token);
      const role = decoded?.[ROLE_KEY];
      setIsAdmin(role === ADMIN_ROLE);
    }
  }, []);

  const { logout } = useAuth();

  // Lọc NAV items dựa trên permissions
  const filteredNAV = NAV.filter((item) => {
    // Nếu là Chatbot, kiểm tra quyền AI_CHATTING
    if (item.label === "Chatbot") {
      return permissions?.includes("AI_CHATTING") ?? false;
    }
    // Nếu là Mạng xã hội, kiểm tra quyền SOCIAL_NETWORK
    if (item.label === "Mạng xã hội") {
      return permissions?.includes("SOCIAL_NETWORK") ?? false;
    }
    // Nếu là Admin, kiểm tra role
    if (item.label === "Admin") {
      return isAdmin;
    }
    // Items khác luôn hiển thị
    return true;
  });

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const handleOpenProfile = () => router.push("/dashboard/profile");

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[#0B162C]/95 dark:bg-[#0A1226]/95 backdrop-blur-md border border-white/10 shadow-lg text-slate-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="size-6" />
        ) : (
          <Menu className="size-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        style={{ ["--sbw" as string]: `${WIDTH}px` }}
        className={[
          "h-[100dvh] w-[var(--sbw)]",
          "bg-[#0B162C]/95 dark:bg-[#0A1226]/95 text-slate-200",
          "backdrop-blur-md border-r border-white/10",
          "shadow-[inset_-1px_0_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.35)]",
          "px-3 pt-5 pb-6 overflow-y-auto",
          "lg:sticky lg:top-0",
          "fixed top-0 z-40",
          "transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          "rounded-r-3xl",
        ].join(" ")}
        aria-label="Sidebar"
      >
        {/* Brand + Theme + Notification */}
        <div className="flex text-xl sm:text-2xl mb-6 sm:mb-8 items-center justify-center gap-3 sm:gap-4 pt-12 lg:pt-0">
          <div className="font-semibold tracking-wide">Walleto</div>
          
          {/* Notification Bell */}
          {userInfo?.idUser && (
            <NotificationBell idUser={userInfo.idUser} />
          )}
          
          {mounted ? (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="group relative h-6 w-12 sm:w-14 rounded-full cursor-pointer ring-1 ring-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 dark:from-blue-500/25 dark:via-blue-400/20 dark:to-blue-500/25 before:absolute before:inset-0 before:rounded-full before:blur-md before:bg-white/10 dark:before:bg-blue-500/20 overflow-hidden backdrop-blur-sm transition-[background,box-shadow] duration-300 hover:ring-white/25 hover:shadow-[0_10px_30px_rgba(0,0,0,0.28)] active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute -inset-x-10 inset-y-0 bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.12),transparent)] translate-x-[-60%] group-hover:translate-x-[60%] transition-transform duration-700 ease-out" />
              <span
                className={[
                  "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full grid place-items-center bg-white/95 shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-1 ring-white/60 transition-transform duration-300 group-active:scale-95",
                  isDark ? "translate-x-7 sm:translate-x-8" : "translate-x-1",
                  "before:absolute before:inset-[-1px] before:rounded-full before:content-[''] before:bg-[conic-gradient(from_220deg_at_50%_50%,rgba(255,255,255,0.65),rgba(255,255,255,0)_60%)]",
                ].join(" ")}
              >
                {isDark ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-600">
                    <path
                      fill="currentColor"
                      d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-500">
                    <path
                      fill="currentColor"
                      d="M6.76 4.84 5.34 3.42 3.92 4.84 5.34 6.26 6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10v-2h-3v2h3zm-2.76 7.16 1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42zM13 1h-2v3h2V1zm6.24 3.84-1.42 1.42 1.42 1.42 1.42-1.42-1.42-1.42zM4.84 17.24 3.42 18.66l1.42 1.42 1.42-1.42-1.42-1.42zM12 6a6 6 0 1 0 .001 12.001A6 6 0 0 0 12 6z"
                    />
                  </svg>
                )}
              </span>
            </button>
          ) : (
            <div className="h-6 w-12 sm:w-14 rounded-full bg-white/10 ring-1 ring-white/10" />
          )}
        </div>

        {/* Nav */}
        <nav>
          <ul className="flex flex-col gap-1.5">
            {filteredNAV.map((it) => {
              const active = activePath === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={(e) => {
                      if (it.label === "Đăng xuất") {
                        e.preventDefault();
                        handleLogout();
                      }
                      closeMobileMenu();
                    }}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors ${
                      active
                        ? "bg-white/10 ring-1 ring-white/10 text-white"
                        : "hover:bg-white/6 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="shrink-0 grid place-items-center size-9 rounded-xl border border-white/10 bg-white/6 transition-transform motion-safe:group-hover:scale-[1.03]">
                      {it.icon}
                    </span>
                    <span className="text-[13px] font-medium tracking-wide">
                      {it.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info */}
        <div className="absolute inset-x-0 bottom-5 px-4">
          <div
            onClick={handleOpenProfile}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 cursor-pointer hover:bg-white/[0.08] transition"
          >
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div>
                    <div className="text-base font-semibold leading-tight overflow-hidden text-ellipsis truncate max-w-[150px]">
                      {userInfo?.name || "Người dùng"}
                    </div>
                    <div className="text-[11px] text-slate-400 overflow-hidden text-ellipsis truncate max-w-[150px]">
                      {userInfo?.email || "Chưa có email"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {(() => {
                  const perms = context?.permissions;
                  const hasPremium = !!(
                    perms?.includes("AI_CHATTING") ||
                    perms?.includes("SOCIAL_NETWORK")
                  );
                  return hasPremium ? (
                    <Crown className="h-5 w-5 text-yellow-400" />
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
