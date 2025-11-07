"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiBell, FiCheck, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "SYSTEM" | "DEADLINE" | "ORDER" | "MANAGER";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // 임시 userId
      const userId = "temp-user-id";
      const params = new URLSearchParams({
        userId,
        ...(filter === "unread" && { unreadOnly: "true" }),
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const userId = "temp-user-id";
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          notificationIds,
        }),
      });

      if (response.ok) {
        loadNotifications();
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);

    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  const getNotificationIcon = (type: Notification["type"], isRead: boolean) => {
    const iconClass = isRead ? "text-gray-400" : "text-blue-600";

    switch (type) {
      case "DEADLINE":
        return (
          <FiAlertCircle
            className={`w-6 h-6 ${isRead ? "text-gray-400" : "text-red-600"}`}
          />
        );
      case "ORDER":
        return (
          <FiCheckCircle
            className={`w-6 h-6 ${isRead ? "text-gray-400" : "text-green-600"}`}
          />
        );
      case "MANAGER":
        return (
          <FiBell
            className={`w-6 h-6 ${
              isRead ? "text-gray-400" : "text-purple-600"
            }`}
          />
        );
      default:
        return <FiBell className={`w-6 h-6 ${iconClass}`} />;
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">알림</h1>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-red-600 font-medium hover:underline"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 필터 */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              전체 ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "unread"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              읽지 않음 ({unreadCount})
            </button>
          </div>
        </div>
      </header>

      {/* 알림 목록 */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FiBell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              {filter === "unread"
                ? "읽지 않은 알림이 없습니다"
                : "알림이 없습니다"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead([notification.id]);
                  }
                  if (notification.link) {
                    window.location.href = notification.link;
                  }
                }}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  notification.isRead
                    ? "border-gray-200"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex space-x-3">
                  {/* 아이콘 */}
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(
                      notification.type,
                      notification.isRead
                    )}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3
                        className={`font-semibold ${
                          notification.isRead
                            ? "text-gray-700"
                            : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full ml-2 mt-2"></span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        notification.isRead ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
