"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiClock, FiAlertCircle } from "react-icons/fi";
import {
  getTimeUntilDeadline,
  isDeadlineApproaching,
  formatRelativeTime,
} from "@/lib/utils";
import { useOrderStore } from "@/store/useOrderStore";

export default function HomePage() {
  const [deadline, setDeadline] = useState(getTimeUntilDeadline());
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const orderCount = useOrderStore((state) => state.getItemCount());

  // 마감 시간 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setDeadline(getTimeUntilDeadline());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 최근 발주 내역 로드
  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        // 임시 userId - 실제로는 인증 시스템에서 가져옴
        const userId = "temp-user-id";
        const response = await fetch(`/api/orders?userId=${userId}&limit=5`);
        const data = await response.json();

        if (data.success) {
          setRecentOrders(data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load recent orders:", error);
      }
    };

    loadRecentOrders();
  }, []);

  const isApproaching = isDeadlineApproaching();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">씨</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">씨알상사</h1>
          </div>
          <Link
            href="/orders/cart"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiShoppingCart className="w-6 h-6 text-gray-700" />
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {orderCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 마감 시간 배너 */}
      <div
        className={`${
          isApproaching
            ? "bg-red-50 border-red-200"
            : "bg-pink-50 border-pink-200"
        } border-b px-4 py-4`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              isApproaching ? "bg-red-100" : "bg-pink-100"
            }`}
          >
            {isApproaching ? (
              <FiAlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <FiClock className="w-5 h-5 text-pink-600" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {deadline.isExpired
                ? "오늘 발주 마감되었습니다"
                : "매일 발주 마감 시간은 00시 00분까지입니다."}
            </p>
            {!deadline.isExpired && (
              <p
                className={`text-lg font-bold ${
                  isApproaching ? "text-red-600" : "text-pink-600"
                }`}
              >
                남은 시간: {deadline.displayText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="p-4 space-y-6">
        {/* 빠른 주문 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/orders"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                <FiShoppingCart className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-semibold text-gray-900">상품 발주</p>
              <p className="text-xs text-gray-500 mt-1">새로운 주문하기</p>
            </div>
          </Link>

          <Link
            href="/orders/cart"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <FiClock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-semibold text-gray-900">임시 발주</p>
              <p className="text-xs text-gray-500 mt-1">
                {orderCount > 0 ? `${orderCount}개 상품` : "저장된 항목 없음"}
              </p>
            </div>
          </Link>
        </div>

        {/* 최근 발주 내역 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900">최근 발주 내역</h2>
            {/* <Link
              href="/orders/history"
              className="text-sm text-red-600 font-medium hover:underline"
            >
              전체보기
            </Link> */}
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-gray-500">최근 발주 내역이 없습니다</p>
              <Link
                href="/orders"
                className="inline-block mt-3 text-red-600 font-medium hover:underline"
              >
                첫 발주 시작하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  // href={`/orders/${order.id}`}
                  href={`/`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "SUBMITTED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "DRAFT"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status === "SUBMITTED"
                        ? "확정"
                        : order.status === "DRAFT"
                        ? "임시저장"
                        : "확인완료"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    총 {order.items.length}개 상품
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatRelativeTime(order.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
