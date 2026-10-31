"use client";
import { useState, type ReactNode } from 'react';
import { useAccountData, errorMessage } from '@/lib/account';
import type { Paginated } from '@/types/api';

export function AdminList<T extends { id: number }>({ path, title, render }: { path: string; title: string; render: (item: T, run: (action: () => Promise<unknown>) => Promise<void>, busy: boolean) => ReactNode }) {
  const [page, setPage] = useState(1);
  const { data, error, loading, retry } = useAccountData<Paginated<T>>(`${path}?page=${page}`);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setMessage('');
    try { await action(); setMessage('บันทึกสำเร็จ'); retry(); }
    catch (err) { setMessage(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <section><h1 className="text-2xl font-bold text-[#1B4D3E] mb-4">{title}</h1>
    <p role="status" className="my-3">{message}</p>
    {error && <p role="alert">{error} <button onClick={retry}>ลองอีกครั้ง</button></p>}
    {loading && <p>กำลังโหลด...</p>}
    {data?.data.length === 0 && <p>ยังไม่มีข้อมูล</p>}
    <div className="space-y-4">{data?.data.map(item => <article key={item.id} className="bg-white border rounded p-5 break-words">{render(item, run, busy)}</article>)}</div>
    {data && <div className="flex gap-4 my-5"><button disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>ก่อนหน้า</button><span>{data.current_page} / {data.last_page} ({data.total} รายการ)</span><button disabled={page >= data.last_page || loading} onClick={() => setPage(page + 1)}>ถัดไป</button></div>}
  </section>;
}
export const actionClass = 'border border-[#1B4D3E] text-[#1B4D3E] rounded px-3 py-2 m-1 disabled:opacity-40';
