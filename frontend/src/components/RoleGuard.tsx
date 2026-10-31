"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAccountData } from '@/lib/account';
import type { User } from '@/types/api';

export default function RoleGuard({ role, children }: { role: User['role']; children: ReactNode }) {
  const { data, error, loading, retry } = useAccountData<User>('/user');
  if (loading) return <p className="p-6">กำลังตรวจสอบสิทธิ์...</p>;
  if (error) return <div role="alert" className="p-6">{error} <Link href="/login">เข้าสู่ระบบ</Link> <button onClick={retry}>ลองอีกครั้ง</button></div>;
  if (data?.role !== role) return <p role="alert" className="p-6">บัญชีนี้ไม่มีสิทธิ์เข้าถึง <Link href="/">กลับหน้าร้าน</Link></p>;
  return <>{children}</>;
}
