"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import api from './axios';
import type { ApiError } from '@/types/api';

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiError>(error)) {
    if (error.response?.status === 401) return 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ';
    if (error.response?.status === 403) return 'บัญชีนี้ไม่มีสิทธิ์เข้าถึง';
    if (error.response?.status === 404) return 'ไม่พบคำสั่งซื้อ หรือคุณไม่มีสิทธิ์เข้าถึง';
    const errors = error.response?.data.errors;
    return errors ? Object.values(errors).flat().join('\n') : error.response?.data.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองอีกครั้ง';
  }
  return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
}

export function useAccountData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setData(null);
    api.get<T>(path, { signal: controller.signal }).then(response => setData(response.data))
      .catch((err: unknown) => { if (!controller.signal.aborted) setError(errorMessage(err)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, attempt]);
  return { data, error, loading, retry: () => setAttempt(value => value + 1) };
}
