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
  Shield,
  Bitcoin,
  Crown,
} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import useAuth from "@/services/useAuth";
import {useUserContext} from "@/context";
import {getToken} from "@/services/Token";
import {decodeJWT} from "@/services/JwtDecoder";
import NotificationBell from "./NotificationBell";

// Interface riêng cho Context (chỉ cần 3 field)
interface ContextUser {
  idUser: string;
  name: string;
  email: string;
}

type Item = {label: string; href: string; icon: React.ReactNode};

const NAV: Item[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    label: "Danh mục đầu tư",
    href: "/dashboard/portfolio",
    icon: <Bitcoin className="size-5" />,
  },
  {
    label: "Quản lý tài chính",
    href: "/dashboard/wallet",
    icon: <Wallet2 className="size-5" />,
  },
  {
    label: "Thống kê",
    href: "/dashboard/compare",
    icon: <Search className="size-5" />,
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
  {label: "Đăng xuất", href: "", icon: <LogOut className="size-5" />},
];

const WIDTH = 260;
const ROLE_KEY = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const ADMIN_ROLE = "ADMIN";

export default function Sidebar() {
  const activePath = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const context = useUserContext();
  const userInfo = context?.user; // ← Kiểu: ContextUser | undefined
  const permissions = context?.permissions; // ← Lấy permissions từ context

  // Check admin role
  useEffect(() => {
    const token = getToken();
    if (token) {
      const decoded = decodeJWT(token);
      const role = decoded?.[ROLE_KEY];
      setIsAdmin(role === ADMIN_ROLE);
    }
  }, []);

  const {logout} = useAuth();

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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-lg text-text"
        aria-label="Toggle menu">
        {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
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
        style={{["--sbw" as string]: `${WIDTH}px`}}
        className={[
          "h-[100dvh] w-[var(--sbw)]",
          "bg-background text-text",
          "backdrop-blur-md border-r border-border",
          "shadow-[inset_-1px_0_0_rgba(255,255,255,0.06),0_16px_40px_rgba(0,0,0,0.35)]",
          "px-3 pt-5 pb-6 overflow-y-auto",
          "lg:sticky lg:top-0",
          "fixed top-0 z-40",
          "transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "rounded-r-3xl",
        ].join(" ")}
        aria-label="Sidebar">
        {/* Brand + Theme + Notification */}
        <div className="flex text-xl sm:text-2xl mb-6 sm:mb-8 items-center justify-center gap-3 sm:gap-4 pt-12 lg:pt-0">
          <div className="font-semibold tracking-wide">Walleto</div>

          {/* Notification Bell - only show if user has SOCIAL_NETWORK permission */}
          {userInfo?.idUser && permissions?.includes("SOCIAL_NETWORK") && (
            <NotificationBell idUser={userInfo.idUser} />
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
                        ? "bg-muted ring-1 ring-border text-text"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-text"
                    }`}>
                    <span className="shrink-0 grid place-items-center size-9 rounded-xl border border-border bg-muted/50 transition-transform motion-safe:group-hover:scale-[1.03]">
                      {it.icon}
                    </span>
                    <span className="text-[13px] font-medium tracking-wide">{it.label}</span>
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
            className="rounded-3xl border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/40 transition">
            <div className="flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <div>
                    <div className="text-base font-semibold leading-tight overflow-hidden text-ellipsis truncate max-w-[150px]">
                      {userInfo?.name || "Người dùng"}
                    </div>
                    <div className="text-[11px] text-muted-foreground overflow-hidden text-ellipsis truncate max-w-[150px]">
                      {userInfo?.email || "Chưa có email"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                {(() => {
                  const perms = context?.permissions;
                  const hasPremium = !!(
                    perms?.includes("AI_CHATTING") || perms?.includes("SOCIAL_NETWORK")
                  );
                  return hasPremium ? <Crown className="h-5 w-5 text-yellow-400" /> : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

