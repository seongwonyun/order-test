"use client";

import { useState, useEffect } from "react";
import { FiPhone, FiMail, FiMessageSquare, FiUser } from "react-icons/fi";

interface Manager {
  id: string;
  name: string;
  phone: string;
  email?: string;
  department?: string;
}

export default function ManagerPage() {
  const [manager, setManager] = useState<Manager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadManager();
  }, []);

  const loadManager = async () => {
    try {
      // 임시 userId
      const userId = "temp-user-id";
      const response = await fetch(`/api/manager?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setManager(data.data);
      }
    } catch (error) {
      console.error("Failed to load manager:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (manager?.phone) {
      window.location.href = `tel:${manager.phone}`;
    }
  };

  const handleSMS = () => {
    if (manager?.phone) {
      window.location.href = `sms:${manager.phone}`;
    }
  };

  const handleEmail = () => {
    if (manager?.email) {
      window.location.href = `mailto:${manager.email}`;
    }
  };

  // 임시 데이터 (API가 없을 경우)
  const defaultManager: Manager = {
    id: "1",
    name: "김담당",
    phone: "010-1234-5678",
    email: "manager@ssial.com",
    department: "영업팀",
  };

  const displayManager = manager || defaultManager;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold">담당자 정보</h1>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* 담당자 카드 */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FiUser className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{displayManager.name}</h2>
                  {displayManager.department && (
                    <p className="text-red-100 mt-1">
                      {displayManager.department}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 연락처 정보 */}
            <div className="p-6 space-y-4">
              {/* 전화번호 */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiPhone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">전화번호</p>
                    <p className="font-semibold text-gray-900">
                      {displayManager.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* 이메일 */}
              {displayManager.email && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FiMail className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">이메일</p>
                      <p className="font-semibold text-gray-900">
                        {displayManager.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 빠른 연락 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCall}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <FiPhone className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">전화하기</p>
                <p className="text-xs text-gray-500 mt-1">바로 연결</p>
              </div>
            </button>

            <button
              onClick={handleSMS}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <FiMessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">문자하기</p>
                <p className="text-xs text-gray-500 mt-1">SMS 전송</p>
              </div>
            </button>
          </div>

          {/* 안내 메시지 */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">💡</span>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">문의 안내</h3>
                <p className="text-sm text-blue-700">
                  발주 관련 문의사항이 있으시면 담당자에게 직접 연락해주세요.
                  빠르고 정확한 답변을 드리겠습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 근무 시간 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">근무 시간</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">평일</span>
                <span className="font-medium text-gray-900">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">토요일</span>
                <span className="font-medium text-gray-900">09:00 - 13:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">일요일/공휴일</span>
                <span className="font-medium text-red-600">휴무</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
