"use client";
import { AdminList, actionClass } from '@/components/admin/AdminList';
import api from '@/lib/axios';
import type { User } from '@/types/api';
export default function UsersPage() {
  return <AdminList<User> path="/admin/users" title="จัดการผู้ใช้" render={(user, run, busy) => <>
    <p className="font-bold">#{user.id} {user.first_name} {user.last_name} — {user.role}</p><p>{user.email}</p>
    <form className="flex flex-wrap gap-2 my-3" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => api.patch(`/admin/users/${user.id}`, { first_name: form.get('first_name'), last_name: form.get('last_name') })); }}>
      <input aria-label="ชื่อ" name="first_name" defaultValue={user.first_name} required maxLength={255} className="border p-2 rounded" /><input aria-label="นามสกุล" name="last_name" defaultValue={user.last_name} required maxLength={255} className="border p-2 rounded" /><button disabled={busy} className={actionClass}>บันทึกชื่อ</button>
    </form>
    {user.role !== 'admin' && <><button disabled={busy} className={actionClass} onClick={() => { if (confirm('เปลี่ยน Role? บัญชีที่มีธุรกรรมจะเปลี่ยนไม่ได้')) void run(() => api.patch(`/admin/users/${user.id}`, { role: user.role === 'buyer' ? 'seller' : 'buyer' })); }}>เปลี่ยนเป็น {user.role === 'buyer' ? 'seller' : 'buyer'}</button>
    <button disabled={busy} className={actionClass} onClick={() => { if (confirm('ลบบัญชีนี้? บัญชีที่มีธุรกรรมจะลบไม่ได้')) void run(() => api.delete(`/admin/users/${user.id}`)); }}>ลบผู้ใช้</button></>}
  </>} />;
}
