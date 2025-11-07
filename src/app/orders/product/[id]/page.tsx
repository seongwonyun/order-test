// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { FiChevronLeft, FiMinus, FiPlus, FiCheck } from "react-icons/fi";
// import { useOrderStore } from "@/store/useOrderStore";
// import toast from "react-hot-toast";

// interface ProductVariant {
//   id: string;
//   size: string;
//   packaging: string;
//   unit: string;
//   unitCount: number;
// }

// interface Product {
//   id: string;
//   name: string;
//   imageUrl?: string;
//   origin: string;
//   description?: string;
//   memo?: string;
//   variants: ProductVariant[];
// }

// export default function ProductDetailPage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   const router = useRouter();
//   const addItem = useOrderStore((state) => state.addItem);

//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);

//   // 선택된 옵션
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
//     null
//   );
//   const [selectedOrigin, setSelectedOrigin] = useState("국내산");
//   const [selectedSize, setSelectedSize] = useState("");
//   const [selectedPackaging, setSelectedPackaging] = useState<
//     "팔레트" | "박스/망"
//   >("팔레트");

//   // 수량
//   const [palletQuantity, setPalletQuantity] = useState(1);
//   const [boxQuantity, setBoxQuantity] = useState(80);

//   // 메모
//   const [memo, setMemo] = useState("");

//   // 상품 정보 로드
//   useEffect(() => {
//     const loadProduct = async () => {
//       try {
//         const response = await fetch(`/api/products/${params.id}`);
//         const data = await response.json();

//         if (data.success) {
//           setProduct(data.data);

//           // 기본값 설정
//           if (data.data.variants.length > 0) {
//             const firstVariant = data.data.variants[0];
//             setSelectedVariant(firstVariant);
//             setSelectedSize(firstVariant.size);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to load product:", error);
//         toast.error("상품 정보를 불러올 수 없습니다");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProduct();
//   }, [params.id]);

//   // 규격 선택 시 variant 업데이트
//   useEffect(() => {
//     if (product && selectedSize) {
//       const variant = product.variants.find((v) => v.size === selectedSize);
//       if (variant) {
//         setSelectedVariant(variant);
//         setBoxQuantity(variant.unitCount);
//       }
//     }
//   }, [selectedSize, product]);

//   const handleAddToCart = () => {
//     if (!product || !selectedVariant) {
//       toast.error("옵션을 선택해주세요");
//       return;
//     }

//     const finalQuantity =
//       selectedPackaging === "팔레트" ? palletQuantity : boxQuantity;

//     addItem({
//       productId: product.id,
//       productName: product.name,
//       productImage: product.imageUrl,
//       variantId: selectedVariant.id,
//       variantSize: selectedSize,
//       variantPackaging: selectedPackaging,
//       variantUnit: selectedPackaging === "팔레트" ? "P" : "박스",
//       quantity: finalQuantity,
//       memo,
//     });

//     toast.success("장바구니에 추가되었습니다", {
//       icon: "🛒",
//     });

//     // 1초 후 목록으로 이동
//     setTimeout(() => {
//       router.push("/orders");
//     }, 1000);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-500 mb-4">상품을 찾을 수 없습니다</p>
//           <button
//             onClick={() => router.back()}
//             className="text-red-600 font-medium hover:underline"
//           >
//             돌아가기
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // 사용 가능한 규격 목록
//   const availableSizes = [...new Set(product.variants.map((v) => v.size))];

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">
//       {/* 헤더 */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="px-4 py-4 flex items-center justify-between">
//           <button
//             onClick={() => router.back()}
//             className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <FiChevronLeft className="w-6 h-6" />
//           </button>
//           <h1 className="text-lg font-bold">발주 상품 담기</h1>
//           <div className="w-10"></div>
//         </div>
//       </header>

//       {/* 상품 이미지 */}
//       <div className="bg-white">
//         <div className="w-full h-64 bg-gray-100">
//           {product.imageUrl ? (
//             <Image
//               src={product.imageUrl}
//               alt={product.name}
//               width={500}
//               height={300}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center">
//               <span className="text-4xl">🥬</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 상품 정보 */}
//       <div className="bg-white px-4 py-6 border-b border-gray-200">
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">
//           {product.name}
//         </h2>
//         {product.description && (
//           <p className="text-gray-600 mb-3">{product.description}</p>
//         )}
//         <div className="flex items-center space-x-2">
//           <span className="text-sm text-gray-600">원산지:</span>
//           <span className="text-sm font-medium text-gray-900">
//             {product.origin}
//           </span>
//         </div>
//         {product.memo && (
//           <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
//             <p className="text-sm text-gray-700">💡 {product.memo}</p>
//           </div>
//         )}
//       </div>

//       {/* 옵션 선택 */}
//       <div className="p-4 space-y-6">
//         {/* 원산지 선택 */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-3">
//             원산지 선택
//           </label>
//           <div className="grid grid-cols-2 gap-2">
//             {["국내산", "중국산"].map((origin) => (
//               <button
//                 key={origin}
//                 onClick={() => setSelectedOrigin(origin)}
//                 className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
//                   selectedOrigin === origin
//                     ? "border-red-600 bg-red-50 text-red-600"
//                     : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {origin}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* 포장선택 */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-3">
//             포장선택
//           </label>
//           <div className="grid grid-cols-2 gap-2">
//             <button
//               onClick={() => setSelectedPackaging("팔레트")}
//               className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
//                 selectedPackaging === "팔레트"
//                   ? "border-red-600 bg-red-50 text-red-600"
//                   : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               팔레트
//             </button>
//             <button
//               onClick={() => setSelectedPackaging("박스/망")}
//               className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
//                 selectedPackaging === "박스/망"
//                   ? "border-red-600 bg-red-50 text-red-600"
//                   : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
//               }`}
//             >
//               박스/망
//             </button>
//           </div>
//         </div>

//         {/* 규격선택 */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-3">
//             규격선택
//           </label>
//           <div className="grid grid-cols-3 gap-2">
//             {availableSizes.map((size) => (
//               <button
//                 key={size}
//                 onClick={() => setSelectedSize(size)}
//                 className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
//                   selectedSize === size
//                     ? "border-red-600 bg-red-50 text-red-600"
//                     : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
//                 }`}
//               >
//                 {size}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* 발주수량입력 */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-3">
//             발주수량입력
//           </label>

//           {selectedPackaging === "팔레트" ? (
//             <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-gray-700 font-medium">팔레트</span>
//                 <div className="flex items-center space-x-3">
//                   <button
//                     onClick={() =>
//                       setPalletQuantity(Math.max(1, palletQuantity - 1))
//                     }
//                     className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//                   >
//                     <FiMinus className="w-5 h-5" />
//                   </button>
//                   <input
//                     type="number"
//                     value={palletQuantity}
//                     onChange={(e) =>
//                       setPalletQuantity(
//                         Math.max(1, parseInt(e.target.value) || 1)
//                       )
//                     }
//                     className="w-16 text-center text-xl font-bold border-none focus:outline-none"
//                   />
//                   <button
//                     onClick={() => setPalletQuantity(palletQuantity + 1)}
//                     className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
//                   >
//                     <FiPlus className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 text-right">
//                 {palletQuantity}P
//               </p>
//             </div>
//           ) : (
//             <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-gray-700 font-medium">박스/망</span>
//                 <div className="flex items-center space-x-3">
//                   <button
//                     onClick={() => setBoxQuantity(Math.max(1, boxQuantity - 1))}
//                     className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//                   >
//                     <FiMinus className="w-5 h-5" />
//                   </button>
//                   <input
//                     type="number"
//                     value={boxQuantity}
//                     onChange={(e) =>
//                       setBoxQuantity(Math.max(1, parseInt(e.target.value) || 1))
//                     }
//                     className="w-20 text-center text-xl font-bold border-none focus:outline-none"
//                   />
//                   <button
//                     onClick={() => setBoxQuantity(boxQuantity + 1)}
//                     className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
//                   >
//                     <FiPlus className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 text-right">
//                 {boxQuantity}박스
//               </p>
//             </div>
//           )}
//         </div>

//         {/* 메모 */}
//         <div>
//           <label className="block text-sm font-semibold text-gray-900 mb-3">
//             메모 (선택)
//           </label>
//           <textarea
//             value={memo}
//             onChange={(e) => setMemo(e.target.value)}
//             placeholder="추가 요청사항을 입력하세요..."
//             rows={3}
//             className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
//           />
//         </div>
//       </div>

//       {/* 하단 버튼 */}
//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-inset-bottom">
//         <button
//           onClick={handleAddToCart}
//           className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
//         >
//           <FiCheck className="w-5 h-5" />
//           <span>장바구니에 담기</span>
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { FiChevronLeft, FiMinus, FiPlus, FiCheck } from "react-icons/fi";
import { useOrderStore } from "@/store/useOrderStore";
import toast from "react-hot-toast";

interface ProductVariant {
  id: string;
  size: string;
  packaging: string;
  unit: string;
  unitCount: number;
}

interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  origin: string;
  description?: string;
  memo?: string;
  variants: ProductVariant[];
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const addItem = useOrderStore((state) => state.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // 선택된 옵션
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedOrigin, setSelectedOrigin] = useState("국내산");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPackaging, setSelectedPackaging] = useState<
    "팔레트" | "박스/망"
  >("팔레트");

  // 수량
  const [palletQuantity, setPalletQuantity] = useState(1);
  const [boxQuantity, setBoxQuantity] = useState(80);

  // 메모
  const [memo, setMemo] = useState("");

  // 상품 정보 로드
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const body = await res.json();
        const productData: Product | null = body?.data ?? body ?? null;

        if (!productData || !productData.id) {
          setProduct(null);
          toast.error("상품을 찾을 수 없습니다");
          return;
        }

        setProduct(productData);

        // 기본 규격 선택 + 박스 수량 기본값 설정
        if (
          Array.isArray(productData.variants) &&
          productData.variants.length > 0
        ) {
          const first = productData.variants[0];
          setSelectedVariant(first);
          setSelectedSize(first.size);
          if (first.unitCount && Number.isFinite(first.unitCount)) {
            setBoxQuantity(first.unitCount);
          }
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        toast.error("상품 정보를 불러올 수 없습니다");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // 규격 선택 시 variant/박스수량 업데이트
  useEffect(() => {
    if (!product || !selectedSize) return;
    const variant =
      product.variants?.find((v) => v.size === selectedSize) ?? null;
    setSelectedVariant(variant);
    if (variant?.unitCount && Number.isFinite(variant.unitCount)) {
      setBoxQuantity(variant.unitCount);
    }
  }, [selectedSize, product]);

  // ✅ Hook 순서 에러 방지: 조기 return 위에서 항상 호출
  const availableSizes = useMemo(() => {
    const sizes = (product?.variants ?? []).map((v) => v.size).filter(Boolean);
    return Array.from(new Set(sizes));
  }, [product]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) {
      toast.error("옵션을 선택해주세요");
      return;
    }

    const finalQuantity =
      selectedPackaging === "팔레트" ? palletQuantity : boxQuantity;
    const safeQuantity = Math.max(1, Number(finalQuantity) || 1);

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl,
      variantId: selectedVariant.id,
      variantSize: selectedSize,
      variantPackaging: selectedPackaging,
      variantUnit: selectedPackaging === "팔레트" ? "P" : "박스",
      quantity: safeQuantity,
      memo,
      // 필요하다면 origin도 담기: selectedOrigin
    });

    toast.success("장바구니에 추가되었습니다", { icon: "🛒" });

    setTimeout(() => {
      router.push("/orders");
    }, 1000);
  };

  // 조기 return (useMemo 위로 옮겼으므로 Hook 순서 안전)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">상품을 찾을 수 없습니다</p>
          <button
            onClick={() => router.back()}
            className="text-red-600 font-medium hover:underline"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
          <div className="w-10" />
        </div>
      </header>

      {/* 상품 이미지 */}
      <div className="bg-white">
        <div className="w-full h-64 bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={500}
              height={300}
              className="w-full h-full object-cover"
              // 외부 도메인이면 next.config.js 의 images.domains 필요
              // 임시 확인용: unoptimized
              // unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl">🥬</span>
            </div>
          )}
        </div>
      </div>

      {/* 상품 정보 */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {product.name}
        </h2>
        {product.description && (
          <p className="text-gray-600 mb-3">{product.description}</p>
        )}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">원산지:</span>
          <span className="text-sm font-medium text-gray-900">
            {product.origin}
          </span>
        </div>
        {product.memo && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">💡 {product.memo}</p>
          </div>
        )}
      </div>

      {/* 옵션 선택 */}
      <div className="p-4 space-y-6">
        {/* 원산지 선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            원산지 선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["국내산", "중국산"].map((origin) => (
              <button
                key={origin}
                onClick={() => setSelectedOrigin(origin)}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  selectedOrigin === origin
                    ? "border-red-600 bg-red-50 text-red-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {origin}
              </button>
            ))}
          </div>
        </div>

        {/* 포장선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            포장선택
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedPackaging("팔레트")}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                selectedPackaging === "팔레트"
                  ? "border-red-600 bg-red-50 text-red-600"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              팔레트
            </button>
            <button
              onClick={() => setSelectedPackaging("박스/망")}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                selectedPackaging === "박스/망"
                  ? "border-red-600 bg-red-50 text-red-600"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              박스/망
            </button>
          </div>
        </div>

        {/* 규격선택 */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            규격선택
          </label>
          <div className="grid grid-cols-3 gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  selectedSize === size
                    ? "border-red-600 bg-red-50 text-red-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 발주수량입력 */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            발주수량입력
          </label>

          {selectedPackaging === "팔레트" ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">팔레트</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setPalletQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={palletQuantity}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setPalletQuantity(
                        Math.max(1, Number.isFinite(v) ? v : 1)
                      );
                    }}
                    className="w-16 text-center text-xl font-bold border-none focus:outline-none"
                  />
                  <button
                    onClick={() => setPalletQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-right">
                {palletQuantity}P
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">박스/망</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setBoxQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    value={boxQuantity}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBoxQuantity(Math.max(1, Number.isFinite(v) ? v : 1));
                    }}
                    className="w-20 text-center text-xl font-bold border-none focus:outline-none"
                  />
                  <button
                    onClick={() => setBoxQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-right">
                {boxQuantity}박스
              </p>
            </div>
          )}
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            메모 (선택)
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="추가 요청사항을 입력하세요..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-inset-bottom">
        <button
          onClick={handleAddToCart}
          className="w-full bg-red-600 text-white py-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
        >
          <FiCheck className="w-5 h-5" />
          <span>장바구니에 담기</span>
        </button>
      </div>
    </div>
  );
}
