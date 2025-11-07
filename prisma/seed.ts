import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 데이터 시딩 시작...");

  // 1. 카테고리 생성
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-vegetables" },
      update: {},
      create: {
        id: "cat-vegetables",
        name: "채소류",
        icon: "🥬",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-fruits" },
      update: {},
      create: {
        id: "cat-fruits",
        name: "과일류",
        icon: "🍎",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-roots" },
      update: {},
      create: {
        id: "cat-roots",
        name: "근채류",
        icon: "🥕",
        sortOrder: 3,
      },
    }),
  ]);

  console.log("✅ 카테고리 생성 완료");

  // 2. 담당자 생성
  const manager = await prisma.manager.upsert({
    where: { id: "manager-1" },
    update: {},
    create: {
      id: "manager-1",
      name: "김담당",
      phone: "010-1234-5678",
      email: "manager@ssial.com",
      department: "영업팀",
    },
  });

  console.log("✅ 담당자 생성 완료");

  // 3. 사용자 생성
  const user = await prisma.user.upsert({
    where: { id: "temp-user-id" },
    update: {},
    create: {
      id: "temp-user-id",
      email: "test@example.com",
      name: "테스트 바이어",
      phone: "010-9876-5432",
      managerId: manager.id,
    },
  });

  console.log("✅ 사용자 생성 완료");

  // 4. 상품 생성
  const products = [
    {
      id: "prod-danhopark",
      name: "단호박",
      origin: "국내산",
      memo: "호호호",
      categoryId: categories[0].id,
      imageUrl: "/images/danhopark.jpg",
      variants: [
        { size: "5과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "6과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "7과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "8과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "9과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "11과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "12과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "13과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "14과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "15과", packaging: "팔레트", unit: "P", unitCount: 80 },
        { size: "16과", packaging: "팔레트", unit: "P", unitCount: 80 },
      ],
    },
    {
      id: "prod-onion",
      name: "중국산 양파",
      origin: "중국산",
      categoryId: categories[0].id,
      variants: [
        { size: "15kg망", packaging: "팔레트", unit: "P", unitCount: 65 },
      ],
    },
    {
      id: "prod-carrot",
      name: "당근",
      origin: "중국산",
      memo: "햇당근이 시작되었습니다.",
      categoryId: categories[2].id,
      variants: [
        { size: "2L", packaging: "팔레트", unit: "P", unitCount: 100 },
        { size: "3L", packaging: "팔레트", unit: "P", unitCount: 100 },
      ],
    },
    {
      id: "prod-broccoli",
      name: "브로콜리",
      origin: "국내산",
      categoryId: categories[0].id,
      variants: [
        { size: "대", packaging: "박스", unit: "박스", unitCount: 50 },
        { size: "중", packaging: "박스", unit: "박스", unitCount: 50 },
      ],
    },
  ];

  for (const productData of products) {
    const { variants, ...productInfo } = productData;

    const product = await prisma.product.upsert({
      where: { id: productData.id },
      update: {},
      create: productInfo,
    });

    // 옵션 생성
    for (let i = 0; i < variants.length; i++) {
      await prisma.productVariant.upsert({
        where: { id: `${product.id}-variant-${i}` },
        update: {},
        create: {
          id: `${product.id}-variant-${i}`,
          productId: product.id,
          ...variants[i],
          sortOrder: i,
        },
      });
    }
  }

  console.log("✅ 상품 생성 완료");

  // 5. 공지사항 생성
  await prisma.notice.upsert({
    where: { id: "notice-1" },
    update: {},
    create: {
      id: "notice-1",
      title: "매일 발주 마감 시간 안내",
      content:
        "매일 발주 마감 시간은 00시 00분까지입니다. 기한 내 발주 부탁드립니다.",
      isPinned: true,
      managerId: manager.id,
    },
  });

  console.log("✅ 공지사항 생성 완료");

  // 6. 샘플 알림 생성
  await prisma.notification.create({
    data: {
      userId: user.id,
      title: "환영합니다!",
      message: "씨알상사 주문 시스템에 오신 것을 환영합니다.",
      type: "SYSTEM",
    },
  });

  console.log("✅ 알림 생성 완료");

  console.log("🎉 데이터 시딩 완료!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ 시딩 에러:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
