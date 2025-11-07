// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// // 발주 목록 조회
// export async function GET(request: NextRequest) {
//   try {
//     const searchParams = request.nextUrl.searchParams;
//     const userId = searchParams.get("userId");
//     const status = searchParams.get("status");

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, error: "User ID is required" },
//         { status: 400 }
//       );
//     }

//     const where: any = { userId };
//     if (status) {
//       where.status = status;
//     }

//     const orders = await prisma.order.findMany({
//       where,
//       include: {
//         items: {
//           include: {
//             product: true,
//             variant: true,
//           },
//         },
//       },
//       orderBy: { updatedAt: "desc" },
//       take: 50,
//     });

//     return NextResponse.json({
//       success: true,
//       data: orders,
//     });
//   } catch (error) {
//     console.error("Orders fetch error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }

// // 발주 생성/수정
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { userId, items, status, memo, orderId } = body;

//     if (!userId || !items || items.length === 0) {
//       return NextResponse.json(
//         { success: false, error: "Invalid request data" },
//         { status: 400 }
//       );
//     }

//     // 마감 시간 체크
//     const now = new Date();
//     const deadlineHour = parseInt(
//       process.env.NEXT_PUBLIC_ORDER_DEADLINE_HOUR || "0"
//     );
//     const deadline = new Date(now);
//     deadline.setHours(deadlineHour, 0, 0, 0);

//     if (now > deadline) {
//       deadline.setDate(deadline.getDate() + 1);
//     }

//     // 마감 시간이 지났는지 확인
//     if (
//       status === "SUBMITTED" &&
//       now.getHours() >= deadlineHour &&
//       now.getMinutes() > 0
//     ) {
//       return NextResponse.json(
//         { success: false, error: "Order deadline has passed" },
//         { status: 400 }
//       );
//     }

//     let order;

//     if (orderId) {
//       // 기존 발주 수정
//       order = await prisma.order.update({
//         where: { id: orderId },
//         data: {
//           status: status || "DRAFT",
//           memo,
//           submittedAt: status === "SUBMITTED" ? new Date() : undefined,
//           items: {
//             deleteMany: {},
//             create: items.map((item: any) => ({
//               productId: item.productId,
//               variantId: item.variantId,
//               quantity: item.quantity,
//               memo: item.memo,
//             })),
//           },
//         },
//         include: {
//           items: {
//             include: {
//               product: true,
//               variant: true,
//             },
//           },
//         },
//       });
//     } else {
//       // 새 발주 생성
//       const orderNumber = `ORD-${Date.now()}-${Math.random()
//         .toString(36)
//         .substr(2, 9)
//         .toUpperCase()}`;

//       order = await prisma.order.create({
//         data: {
//           orderNumber,
//           userId,
//           status: status || "DRAFT",
//           memo,
//           deadlineDate: deadline,
//           submittedAt: status === "SUBMITTED" ? new Date() : undefined,
//           items: {
//             create: items.map((item: any) => ({
//               productId: item.productId,
//               variantId: item.variantId,
//               quantity: item.quantity,
//               memo: item.memo,
//             })),
//           },
//         },
//         include: {
//           items: {
//             include: {
//               product: true,
//               variant: true,
//             },
//           },
//         },
//       });

//       // 발주 확정 시 알림 생성
//       if (status === "SUBMITTED") {
//         await prisma.notification.create({
//           data: {
//             userId,
//             title: "발주가 확정되었습니다",
//             message: `주문번호: ${orderNumber}`,
//             type: "ORDER",
//             link: `/orders/${order.id}`,
//           },
//         });
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       data: order,
//     });
//   } catch (error) {
//     console.error("Order creation error:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to create order" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 공통 유틸: KST now, 오늘(또는 내일 00:00)의 마감시각 계산
function getNowKST() {
  const now = new Date();
  return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}
function getTodayDeadlineKST(nowKST: Date, deadlineHour: number) {
  const d = new Date(nowKST);
  if (deadlineHour === 24) {
    // 오늘 24:00 == 내일 00:00
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
  } else {
    d.setHours(deadlineHour, 0, 0, 0);
  }
  return d;
}

// 발주 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const where: any = { userId };
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true, variant: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// 발주 생성/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, status, memo, orderId } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    // 1) 환경변수: 서버 전용 (0~24 허용), 기본=24(자정)
    const raw = process.env.ORDER_DEADLINE_HOUR ?? "24";
    let deadlineHour = Number(raw);
    if (Number.isNaN(deadlineHour) || deadlineHour < 0 || deadlineHour > 24) {
      return NextResponse.json(
        { success: false, error: "Invalid ORDER_DEADLINE_HOUR" },
        { status: 500 }
      );
    }

    // 2) 시간 계산: KST 기준
    const nowKST = getNowKST();
    const todayDeadlineKST = getTodayDeadlineKST(nowKST, deadlineHour);

    // 3) 제출 차단: 한 줄 비교만 사용
    if (status === "SUBMITTED" && nowKST > todayDeadlineKST) {
      return NextResponse.json(
        { success: false, error: "Order deadline has passed" },
        { status: 400 }
      );
    }

    // DB에 저장할 deadlineDate(다음 마감일 개념)
    // - now <= todayDeadlineKST: todayDeadlineKST를 그대로 저장
    // - now > todayDeadlineKST: 위에서 차단되어 이 지점에 오지 않음
    const deadlineDate = new Date(todayDeadlineKST);

    let order;
    if (orderId) {
      // 기존 발주 수정
      order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status || "DRAFT",
          memo,
          submittedAt: status === "SUBMITTED" ? nowKST : undefined,
          deadlineDate,
          items: {
            deleteMany: {}, // 전부 삭제 후 재생성 (간단 안정)
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              memo: item.memo,
            })),
          },
        },
        include: { items: { include: { product: true, variant: true } } },
      });
    } else {
      // 새 발주 생성
      const orderNumber = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)
        .toUpperCase()}`;

      order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          status: status || "DRAFT",
          memo,
          deadlineDate,
          submittedAt: status === "SUBMITTED" ? nowKST : undefined,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              memo: item.memo,
            })),
          },
        },
        include: { items: { include: { product: true, variant: true } } },
      });

      if (status === "SUBMITTED") {
        await prisma.notification.create({
          data: {
            userId,
            title: "발주가 확정되었습니다",
            message: `주문번호: ${orderNumber}`,
            type: "ORDER",
            link: `/orders/${order.id}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
