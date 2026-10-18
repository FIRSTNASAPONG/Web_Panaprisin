"use client";

import Link from 'next/link';
import type { BuyerOrder } from '@/types/api';

export const money = (value: string | number) => Number(value).toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
export const accountButton = 'inline-block rounded-sm bg-[#1B4D3E] px-4 py-2 text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50';
export const accountCard = 'bg-white rounded-sm border border-gray-200 shadow-sm p-4 sm:p-6';
export function AccountState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <p role="status" className={`${accountCard} animate-pulse`}>กำลังโหลดข้อมูล...</p>;
  if (error) return <div className={accountCard}><p role="alert" className="text-red-700 whitespace-pre-line">{error}</p><div className="flex gap-4 mt-4"><button className={accountButton} onClick={retry}>ลองอีกครั้ง</button><Link href="/login" className="underline">เข้าสู่ระบบ</Link></div></div>;
  return null;
}
export function OrderBadge({ status, payment = false }: { status?: string; payment?: boolean }) {
  const labels: Record<string, string> = payment
    ? { pending: 'รอชำระเงิน', completed: 'ชำระเงินแล้ว', failed: 'ชำระเงินไม่สำเร็จ' }
    : { pending: 'รอดำเนินการ', paid: 'เตรียมจัดส่ง', shipped: 'จัดส่งแล้ว', completed: 'สำเร็จ', cancelled: 'ยกเลิก' };
  return <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-[#1B4D3E]">{labels[status || ''] || 'ไม่มีข้อมูล'}</span>;
}
export function OrderList({ orders }: { orders: BuyerOrder[] }) {
  if (!orders.length) return <p className={accountCard}>ยังไม่มีคำสั่งซื้อ <Link href="/" className="text-[#1B4D3E] underline">เลือกซื้อสินค้า</Link></p>;
  return <div className="space-y-3">{orders.map(order => <Link key={order.id} href={`/account/orders/${order.id}`} className={`${accountCard} flex flex-wrap gap-3 items-center justify-between hover:border-[#1B4D3E] focus-visible:outline-2`}><div><strong>คำสั่งซื้อ #{order.id}</strong><p className="text-sm text-gray-500">{order.created_at ? new Date(order.created_at).toLocaleString('th-TH') : '-'}</p></div><strong>{money(order.total_amount)}</strong><OrderBadge status={order.order_status}/><OrderBadge payment status={order.payment?.payment_status}/></Link>)}</div>;
}
