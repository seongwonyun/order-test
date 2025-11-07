// src/app/api/products/[id]/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params; // ⬅️ params는 Promise이므로 await

    if (!id) {
      return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
    }

    // 1) id가 고유키라면 findUnique만 사용하고,
    // 2) 활성 여부는 후처리로 판별(또는 findFirst로 통합 필터)
    const product = await prisma.product.findUnique({
      where: { id }, // ⬅️ findUnique에는 고유 필드만
      include: {
        category: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (e) {
    console.error("Product fetch error:", e);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
