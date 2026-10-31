"use client";
import { useState } from 'react';
import api from '@/lib/axios';
import { errorMessage } from '@/lib/account';

export default function WishlistButton({ productId }: { productId: number }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return <div className="my-3">
    <button disabled={busy} className="border border-[#1B4D3E] rounded px-4 py-2 text-[#1B4D3E] disabled:opacity-50" onClick={async () => {
      setBusy(true); setMessage('');
      try { await api.put(`/wishlist/${productId}`); setMessage('บันทึกในรายการโปรดแล้ว'); }
      catch (error) { setMessage(errorMessage(error)); }
      finally { setBusy(false); }
    }}>♡ บันทึกรายการโปรด</button>
    <p role="status" className="text-sm mt-2">{message}</p>
  </div>;
}
