"use client";
import { AdminList, actionClass } from '@/components/admin/AdminList';
import api from '@/lib/axios';
import type { BuyerOrder } from '@/types/api';
export default function OrdersPage() {
  return <AdminList<BuyerOrder> path="/admin/orders" title="จัดการคำสั่งซื้อ" render={(order, run, busy) => <>
    <h2 className="font-bold">คำสั่งซื้อ #{order.id} — {order.order_status}</h2><p>{order.user?.first_name} — ฿{Number(order.total_amount).toLocaleString()} — Payment: {order.payment?.payment_status || 'ไม่มี'}</p><p className="whitespace-pre-wrap">{order.shipping_address}</p>
    <ul className="my-2">{order.items.map((item, index) => <li key={index}>{item.product_name || item.product?.name} × {item.quantity} — ฿{item.subtotal}</li>)}</ul>
    {order.order_status === 'pending' && <><form className="my-3 space-y-2" onSubmit={e => { e.preventDefault(); const form = new FormData(e.currentTarget); void run(() => api.post(`/admin/orders/${order.id}/confirm-payment`, { confirmed: form.get('confirmed') === 'on', reference: form.get('reference') })); }}>
      <label className="block">หลักฐานอ้างอิงการรับเงิน<input name="reference" required maxLength={255} className="border rounded p-2 ml-2" /></label>
      <label className="block"><input type="checkbox" name="confirmed" required /> ตรวจสอบกับบัญชีธนาคารแล้วว่าได้รับเงินครบจริง</label>
      <button disabled={busy} className={actionClass}>ยืนยันรับชำระเงิน</button>
    </form><button disabled={busy} className={actionClass} onClick={() => { if (confirm('ยกเลิกออเดอร์และคืนสต็อก?')) void run(() => api.put(`/admin/orders/${order.id}/status`, { order_status: 'cancelled' })); }}>ยกเลิกคำสั่งซื้อ</button></>}
    {['paid','shipped'].includes(order.order_status) && <button disabled={busy} className={actionClass} onClick={() => void run(() => api.put(`/admin/orders/${order.id}/status`, { order_status: order.order_status === 'paid' ? 'shipped' : 'completed' }))}>{order.order_status === 'paid' ? 'บันทึกจัดส่งแล้ว' : 'บันทึกคำสั่งซื้อสำเร็จ'}</button>}
  </>} />;
}
