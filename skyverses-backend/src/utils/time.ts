// utils/time.ts

/**
 * MongoDB luôn lưu datetime theo UTC.
 * Vì vậy mọi query nên dùng UTC để tránh sai lệch timezone.
 *
 * Bản này cực kỳ đơn giản và chính xác.
 */

/**
 * ⏳ Lấy thời điểm X giờ trước (UTC)
 * Dùng trực tiếp cho query Mongo.
 */
export function hoursAgoUTC(hours: number): Date {
  return new Date(Date.now() - hours * 3600 * 1000);
}

/**
 * 🕒 Lấy thời gian hiện tại ở Việt Nam (UTC+7)
 * Chỉ dùng để hiển thị cho user nếu cần.
 */
export function nowVN(): Date {
  return new Date(Date.now() + 7 * 3600 * 1000);
}

/**
 * 🔄 Convert 1 Date UTC sang giờ VN để debug/log
 */
export function toVN(date: Date): Date {
  return new Date(date.getTime() + 7 * 3600 * 1000);
}