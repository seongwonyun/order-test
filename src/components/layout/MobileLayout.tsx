"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiBell, FiShoppingCart, FiUser } from "react-icons/fi";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", icon: FiHome, label: "홈" },
    { href: "/notifications", icon: FiBell, label: "알림" },
    { href: "/orders", icon: FiShoppingCart, label: "상품 발주" },
    { href: "/manager", icon: FiUser, label: "담당자 정보" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto">{children}</main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
