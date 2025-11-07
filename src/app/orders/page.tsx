"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSearch, FiShoppingCart, FiChevronLeft } from "react-icons/fi";
import { useOrderStore } from "@/store/useOrderStore";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  origin: string;
  memo?: string;
  category: {
    id: string;
    name: string;
  };
  variants: Array<{
    id: string;
    size: string;
    packaging: string;
    unit: string;
    unitCount: number;
  }>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const orderCount = useOrderStore((state) => state.getItemCount());

  // 상품 로드
  const loadProducts = useCallback(
    async (reset = false) => {
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "20",
        });

        if (selectedCategory) {
          params.append("category", selectedCategory);
        }
        if (searchQuery) {
          params.append("search", searchQuery);
        }

        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();

        if (data.success) {
          if (reset) {
            setProducts(data.data);
            setPage(1);
          } else {
            setProducts((prev) => [...prev, ...data.data]);
          }

          setHasMore(data.pagination.page < data.pagination.totalPages);
          if (!reset) {
            setPage((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    },
    [page, selectedCategory, searchQuery]
  );

  // 카테고리 로드
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };

    loadCategories();
  }, []);

  // 초기 상품 로드
  useEffect(() => {
    loadProducts(true);
  }, [selectedCategory, searchQuery]);

  // 무한 스크롤
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        if (hasMore && !loading) {
          loadProducts();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, loadProducts]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold">상품 발주</h1>
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

        {/* 검색바 */}
        <div className="px-4 pb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="상품 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="px-4 pb-4 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  selectedCategory === ""
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 상품 리스트 */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          총 {products.length}개의 상품
        </p>

        <div className="space-y-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/orders/product/${product.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex space-x-4">
                {/* 상품 이미지 */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    규격: {product.variants.map((v) => v.size).join(", ")}
                  </p>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                      {product.variants[0]?.packaging || "파렛트"}
                    </span>
                    <span className="text-gray-500">
                      원산지: {product.origin}
                    </span>
                  </div>
                  {product.memo && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {product.memo}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {loading && (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
