"use client";
import { useState } from 'react';
import { useAccountData, errorMessage } from '@/lib/account';
import api from '@/lib/axios';

export default function ProductReviews({ productId }: { productId: number }) {
  const { data, error, loading, retry } = useAccountData<{ id: number; rating: number; comment: string | null; user: { first_name: string } }[]>(`/products/${productId}/reviews`);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <section className="mt-4 bg-white rounded p-6">
    <h2 className="text-xl font-bold text-[#1B4D3E]">รีวิวจากผู้ซื้อ</h2>
    {loading && <p>กำลังโหลดรีวิว...</p>}
    {error && <p role="alert">{error} <button onClick={retry}>ลองอีกครั้ง</button></p>}
    {data?.length === 0 && <p className="my-4">ยังไม่มีรีวิว</p>}
    {data?.map(review => <article key={review.id} className="border-b py-4"><p className="text-[#1B4D3E]">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} — {review.user?.first_name}</p><p className="whitespace-pre-wrap break-words">{review.comment}</p></article>)}
    <form className="mt-6 space-y-3" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage('');
      try { const response = await api.post(`/products/${productId}/reviews`, { rating: Number(rating), comment }); setMessage(response.data.message); setComment(''); setRating(''); }
      catch (err) { setMessage(errorMessage(err)); }
      finally { setBusy(false); }
    }}>
      <p className="text-sm text-gray-600">รีวิวได้เมื่อชำระเงินและคำสั่งซื้อสำเร็จแล้ว 1 รีวิวต่อสินค้า โดยรอ Admin ตรวจสอบก่อนเผยแพร่</p>
      <label className="block">คะแนน<select aria-label="คะแนน" required value={rating} onChange={e => setRating(e.target.value)} className="border rounded p-2 ml-3"><option value="">เลือกคะแนน</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ดาว</option>)}</select></label>
      <label className="block">ความคิดเห็น<textarea value={comment} maxLength={3000} onChange={e => setComment(e.target.value)} className="block w-full border rounded p-3 mt-2" /></label>
      <button disabled={busy} className="bg-[#1B4D3E] text-white rounded px-5 py-2 disabled:opacity-50">ส่งรีวิว</button>
      <p role="status">{message}</p>
    </form>
  </section>;
}
