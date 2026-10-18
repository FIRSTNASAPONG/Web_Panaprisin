"use client";
import { useAccountData } from '@/lib/account';
import type { AccountOverview } from '@/types/api';
import { AccountState, OrderList, accountCard } from '@/components/AccountContent';
export default function AccountPage() {
  const state = useAccountData<AccountOverview>('/me');
  return <><h1 className="text-2xl font-bold text-[#1B4D3E] mb-6">บัญชีของฉัน</h1><AccountState {...state}/>{state.data && <><div className={`${accountCard} mb-6`}><h2 className="text-xl font-bold">{state.data.user.first_name} {state.data.user.last_name}</h2><p className="break-all">{state.data.user.email}</p></div><div className="grid sm:grid-cols-3 gap-4 mb-6">{[['คำสั่งซื้อทั้งหมด', state.data.total_orders], ['รอชำระเงิน', state.data.pending_payment], ['กำลังจัดส่ง', state.data.shipping_orders]].map(([label, count]) => <div key={label} className={accountCard}><p>{label}</p><strong className="text-3xl text-[#1B4D3E]">{count}</strong></div>)}</div><h2 className="text-xl font-bold mb-4">คำสั่งซื้อล่าสุด</h2><OrderList orders={state.data.recent_orders}/></>}</>;
}
