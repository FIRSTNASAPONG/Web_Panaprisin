"use client";
import { AdminList, actionClass } from '@/components/admin/AdminList';
import api from '@/lib/axios';
type Review = { id: number; rating: number; comment: string | null; status: string; user: { first_name: string }; product: { name: string } };
export default function ReviewsPage() {
  return <AdminList<Review> path="/admin/reviews" title="ตรวจสอบรีวิว" render={(review, run, busy) => <>
    <p className="font-bold">#{review.id} {review.product?.name} — {review.user?.first_name}</p><p>{review.rating} / 5 ★ — {review.status}</p><p className="whitespace-pre-wrap">{review.comment}</p>
    <button disabled={busy || review.status === 'approved'} className={actionClass} onClick={() => void run(() => api.patch(`/admin/reviews/${review.id}`, { status: 'approved' }))}>อนุมัติ</button>
    <button disabled={busy || review.status === 'rejected'} className={actionClass} onClick={() => void run(() => api.patch(`/admin/reviews/${review.id}`, { status: 'rejected' }))}>ปฏิเสธ / ซ่อน</button>
  </>} />;
}
