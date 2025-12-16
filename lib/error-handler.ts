import { AxiosError } from "axios";

/**
 * Helper function to safely cast error to AxiosError
 * @param error - The error caught in catch block
 * @returns AxiosError with typed response data
 */
export function getAxiosError<T = { message?: string }>(
  error: unknown
): AxiosError<T> {
  return error as AxiosError<T>;
}

/**
 * Get error message from AxiosError
 * @param error - The error caught in catch block
 * @returns Error message string
 */
export function getErrorMessage(error: unknown): string {
  const e = getAxiosError<{ message?: string }>(error);
  return (
    e.response?.data?.message ||
    e.message ||
    "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
  );
}

/**
 * Check if error is 401 Unauthorized
 * @param error - The error caught in catch block
 * @returns true if status is 401
 */
export function isUnauthorizedError(error: unknown): boolean {
  const e = getAxiosError(error);
  return e.response?.status === 401;
}

