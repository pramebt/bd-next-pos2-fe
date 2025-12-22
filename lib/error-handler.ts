import { AxiosError } from "axios";

type ErrorResponse = { message?: string };

/**
 * ดึงข้อความ error จาก AxiosError
 */
export function getErrorMessage(error: unknown): string {
  const e = error as AxiosError<ErrorResponse>;
  return e.response?.data?.message || e.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}

/**
 * ตรวจสอบว่า error เป็น 401 Unauthorized หรือไม่
 */
export function isUnauthorizedError(error: unknown): boolean {
  const e = error as AxiosError;
  return e.response?.status === 401;
}
