"use client";
import { useState } from 'react';
import { useAccountData } from '@/lib/account';
import type { BuyerOrder, Paginated } from '@/types/api';
import { AccountState, OrderList, accountButton } from '@/components/AccountContent';
export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const state = useAccountData<Paginated<BuyerOrder>>(`/me/orders?page=${page}`);
  return <><h1 className="text-2xl font-bold text-[#1B4D3E] mb-6">คำสั่งซื้อของฉัน</h1><AccountState {...state}/>{state.data && <><OrderList orders={state.data.data}/><nav aria-label="หน้ารายการคำสั่งซื้อ" className="flex gap-4 items-center mt-6"><button className={accountButton} disabled={page <= 1} onClick={() => setPage(page - 1)}>ก่อนหน้า</button><span>{page} / {state.data.last_page}</span><button className={accountButton} disabled={page >= state.data.last_page} onClick={() => setPage(page + 1)}>ถัดไป</button></nav></>}</>;
}
