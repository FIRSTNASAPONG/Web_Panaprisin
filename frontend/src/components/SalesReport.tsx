"use client";
import { useState } from 'react';
import { useAccountData } from '@/lib/account';
import type { Decimal } from '@/types/api';
type Report = { role_view: string; total_revenue: Decimal; total_orders: number; top_selling_products: { product_id: number; total_sold: number; revenue: Decimal; product: { name: string } | null }[] };
export default function SalesReport() {
  const [query, setQuery] = useState('');
  const { data, error, loading, retry } = useAccountData<Report>(`/reports/sales${query}`);
  return <section><h1 className="text-2xl font-bold text-[#1B4D3E] mb-4">รายงานยอดขาย</h1>
    <p className="text-gray-600 mb-4">นับยอดรับชำระครบของออเดอร์ paid, shipped และ completed ตามวันที่รับเงิน (เวลาไทย) ผู้ขายเห็นเฉพาะร้านตนเอง</p>
    <form className="flex flex-wrap gap-3 mb-5" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); const params = new URLSearchParams(); for (const key of ['from','to']) { const value = String(form.get(key) || ''); if (value) params.set(key,value); } setQuery(`?${params}`); }}>
      <label>ตั้งแต่ <input type="date" name="from" className="border p-2 rounded" /></label><label>ถึง <input type="date" name="to" className="border p-2 rounded" /></label><button className="bg-[#1B4D3E] text-white px-4 rounded">แสดงรายงาน</button>
    </form>
    {loading && <p>กำลังโหลด...</p>}{error && <p role="alert">{error} <button onClick={retry}>ลองอีกครั้ง</button></p>}
    {data && <><div className="grid sm:grid-cols-2 gap-4 mb-5"><div className="bg-white p-6 border rounded">ยอดขายรับชำระ<strong data-testid="sales-revenue" className="block text-3xl text-[#1B4D3E]">฿{Number(data.total_revenue).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong></div><div className="bg-white p-6 border rounded">คำสั่งซื้อ<strong className="block text-3xl">{data.total_orders}</strong></div></div>
    <h2 className="text-xl font-bold mb-3">สินค้าขายดี 5 อันดับ</h2>{data.top_selling_products.length === 0 ? <p>ยังไม่มียอดขายที่รับชำระในช่วงนี้</p> : <div className="overflow-x-auto bg-white"><table className="w-full text-left"><thead><tr><th className="p-3">สินค้า</th><th className="p-3">จำนวนขาย</th><th className="p-3">ยอดขาย</th></tr></thead><tbody>{data.top_selling_products.map(item => <tr key={item.product_id} className="border-t"><td className="p-3">{item.product?.name || `สินค้า #${item.product_id}`}</td><td className="p-3">{item.total_sold}</td><td className="p-3">฿{Number(item.revenue).toLocaleString()}</td></tr>)}</tbody></table></div>}</>}
  </section>;
}
