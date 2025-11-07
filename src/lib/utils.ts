import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import { ko } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 마감 시간까지 남은 시간 계산
export function getTimeUntilDeadline(): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  displayText: string;
} {
  const now = new Date();
  const deadlineHour = parseInt(
    process.env.NEXT_PUBLIC_ORDER_DEADLINE_HOUR || "0"
  );
  const deadlineMinute = parseInt(
    process.env.NEXT_PUBLIC_ORDER_DEADLINE_MINUTE || "0"
  );

  const deadline = new Date(now);
  deadline.setHours(deadlineHour, deadlineMinute, 0, 0);

  // 이미 오늘 마감 시간이 지났으면 내일 마감
  if (now > deadline) {
    deadline.setDate(deadline.getDate() + 1);
  }

  const diff = deadline.getTime() - now.getTime();
  const isExpired = diff <= 0;

  if (isExpired) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      displayText: "마감되었습니다",
    };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
    displayText: `${hours}시간 ${minutes}분 ${seconds}초`,
  };
}

// 30분 이내 마감 임박 체크
export function isDeadlineApproaching(): boolean {
  const { isExpired, hours, minutes } = getTimeUntilDeadline();
  if (isExpired) return false;
  return hours === 0 && minutes <= 30;
}

// 날짜 포맷팅
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd HH:mm", { locale: ko });
}

// 상대 시간 (예: "2시간 전")
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ko });
}

// 주문 번호 포맷팅
export function formatOrderNumber(orderNumber: string): string {
  return orderNumber;
}

// 가격 포맷팅 (필요시)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(price);
}
