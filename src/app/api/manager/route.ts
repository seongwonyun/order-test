import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // 사용자의 담당자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        manager: true,
      },
    });

    if (!user?.manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.manager,
    });
  } catch (error) {
    console.error("Manager fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch manager" },
      { status: 500 }
    );
  }
}
