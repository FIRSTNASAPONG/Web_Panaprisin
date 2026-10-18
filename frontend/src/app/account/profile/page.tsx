"use client";
import { useState } from 'react';
import api from '@/lib/axios';
import { errorMessage, useAccountData } from '@/lib/account';
import type { User } from '@/types/api';
import { AccountState, accountButton, accountCard } from '@/components/AccountContent';
function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState({ first_name: user.first_name, last_name: user.last_name, phone: user.phone || '', address: user.address || '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    if (form.phone && !/^[0-9+() .-]+$/.test(form.phone)) { setError('กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง'); return; }
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await api.patch<User>('/user', form);
      localStorage.setItem('user', JSON.stringify(response.data));
      window.dispatchEvent(new Event('user-updated'));
      setMessage('บันทึกข้อมูลสำเร็จ');
    } catch (err: unknown) { setError(errorMessage(err)); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={`${accountCard} max-w-2xl space-y-4`}><label className="block">อีเมล (อ่านอย่างเดียว)<input type="email" value={user.email} readOnly className="block w-full bg-gray-100 border rounded-sm p-2"/></label>{(['first_name', 'last_name', 'phone', 'address'] as const).map(field => <label key={field} className="block">{{ first_name: 'ชื่อ', last_name: 'นามสกุล', phone: 'เบอร์โทรศัพท์', address: 'ที่อยู่' }[field]}<input type={field === 'phone' ? 'tel' : 'text'} required={field === 'first_name' || field === 'last_name'} maxLength={field === 'address' ? 2000 : field === 'phone' ? 30 : 255} value={form[field]} onChange={event => setForm({ ...form, [field]: event.target.value })} className="block w-full border border-gray-300 rounded-sm p-2 focus:outline-[#1B4D3E]"/></label>)}{error && <p role="alert" className="text-red-700 whitespace-pre-line">{error}</p>}{message && <p role="status" className="text-[#1B4D3E]">{message}</p>}<button disabled={busy} className={accountButton}>{busy ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</button></form>;
}
export default function ProfilePage() {
  const state = useAccountData<User>('/user');
  return <><h1 className="text-2xl font-bold text-[#1B4D3E] mb-6">ข้อมูลส่วนตัว</h1><AccountState {...state}/>{state.data && <ProfileForm user={state.data}/>}</>;
}
