"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiChevronLeft, FiTrash2, FiEdit2, FiCheck } from "react-icons/fi";
import { useOrderStore } from "@/store/useOrderStore";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearItems } = useOrderStore();
  const [submitting, setSubmitting] = useState(false);

  const handleRemoveItem = (productId: string, variantId: string) => {
    removeItem(productId, variantId);
    toast.success("항목이 삭제되었습니다");
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error("발주할 상품이 없습니다");
      return;
    }

    setSubmitting(true);

    try {
      // 임시 userId - 실제로는 인증 시스템에서 가져옴
      const userId = "temp-user-id";

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            memo: item.memo,
          })),
          status: "SUBMITTED",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("발주가 확정되었습니다! 🎉");
        clearItems();

        // 2초 후 홈으로 이동
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        throw new Error(data.error || "발주 처리 중 오류가 발생했습니다");
      }
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast.error(error.message || "발주 확정에 실패했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (items.length === 0) {
      toast.error("저장할 상품이 없습니다");
      return;
    }

    try {
      const userId = "temp-user-id";

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            memo: item.memo,
          })),
          status: "DRAFT",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("임시 저장되었습니다");
      }
    } catch (error) {
      console.error("Draft save error:", error);
      toast.error("임시 저장에 실패했습니다");
    }
  };

  // 최근 추가된 항목이 위에 오도록 정렬
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">발주 상품 담기</h1>
          <button
            onClick={() => {
              if (confirm("장바구니를 비우시겠습니까?")) {
                clearItems();
                toast.success("장바구니가 비워졌습니다");
              }
            }}
            className="text-sm text-red-600 font-medium hover:underline"
          >
            전체삭제
          </button>
        </div>
      </header>

      {/* 상품 목록 */}
      <div className="p-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다</p>
            <button
              onClick={() => router.push("/orders")}
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              상품 둘러보기
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <p className="text-sm text-gray-600">
                총 {items.length}개의 상품
              </p>
            </div>

            <div className="space-y-3">
              {sortedItems.map((item, index) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex space-x-4">
                    {/* 상품 이미지 */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      {item.productImage ? (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🥬</span>
                        </div>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {item.variantSize} / {item.variantPackaging}
                      </p>
                      <p className="text-sm font-semibold text-red-600">
                        {item.quantity}
                        {item.variantUnit}
                      </p>
                      {item.memo && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          📝 {item.memo}
                        </p>
                      )}

                      {/* 최근 추가 뱃지 */}
                      {index === 0 && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          방금 추가됨
                        </span>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() =>
                          router.push(`/orders/product/${item.productId}`)
                        }
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="수정"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveItem(item.productId, item.variantId)
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      {items.length > 0 && (
        <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-inset-bottom">
          <div className="max-w-md mx-auto space-y-2">
            <button
              onClick={handleSaveDraft}
              className="w-full bg-gray-100 text-gray-900 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              임시 저장
            </button>
            <button
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>확정 처리중...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>발주 확정</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
