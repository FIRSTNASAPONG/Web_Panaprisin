"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BuyerOrderDetail from '@/components/BuyerOrderDetail';
function Confirmation() {
  const params = useSearchParams();
  return <BuyerOrderDetail id={params.get('order_id') || ''} confirmation/>;
}
export default function SuccessPage() {
  return <div className="min-h-screen bg-[#f5f5f5] flex flex-col text-gray-800"><Navbar/><main className="container mx-auto max-w-4xl px-4 py-8 flex-grow"><Suspense fallback={<p role="status">กำลังโหลด...</p>}><Confirmation/></Suspense></main><Footer/></div>;
}
