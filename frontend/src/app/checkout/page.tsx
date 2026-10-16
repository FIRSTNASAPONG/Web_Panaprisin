"use client";

import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getProductImageUrl } from "@/lib/image";

export default function CheckoutPage() {
  const { cart, clearCart, fetchCartFromDB } = useCart();
  const router = useRouter();

  const [email, setEmail] = useState('somchai@example.com'); 
  const [phone, setPhone] = useState('080-000-0000');
  const [fullName, setFullName] = useState('สมชาย ใจดี');
  const [address, setAddress] = useState('99/9 หมู่ 2');
  const [subDistrict, setSubDistrict] = useState('หนองแก๋ว');
  const [district, setDistrict] = useState('หางดง');
  const [province, setProvince] = useState('เชียงใหม่');
  const [zipcode, setZipcode] = useState('50230');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'promptpay'>('bank_transfer');
  
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.email) setEmail(user.email);
        if (user.name) setFullName(user.name);
        else if (user.first_name) setFullName(`${user.first_name} ${user.last_name || ''}`.trim());
      } catch (e) {
        console.warn(e);
      }
    }
    fetchCartFromDB();
  }, [fetchCartFromDB]);

  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shippingFee = 0;
  const discount = 0;
  const grandTotal = totalPrice + shippingFee - discount;

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    if (cart.length === 0) {
      alert('ไม่มีสินค้าในตะกร้า');
      return;
    }
    
    if (!isTermsAccepted) {
      alert('กรุณายืนยันความถูกต้องของข้อมูลก่อนสั่งซื้อ');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อครับ');
      router.push('/login');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      const fullAddress = `${fullName} (${phone}) ${address} ต.${subDistrict} อ.${district} จ.${province} ${zipcode}`;
      
      formData.append('shipping_address', fullAddress);
      formData.append('payment_method', paymentMethod);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('customer_name', fullName);
      if (slipImage) {
        formData.append('slip_image', slipImage);
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
      const res = await fetch(`${apiUrl}/checkout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        clearCart();
        router.push('/checkout/success');
      } else {
        alert(data.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
      }
    } catch (error) {
      console.warn('Order Error:', error);
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f6] font-sans flex flex-col">
      <Navbar />

      <div className="bg-[#f5f6f6] pt-8 pb-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center text-sm font-medium mb-6 text-gray-500">
            <span onClick={() => router.push('/')} className="hover:text-[#1B4D3E] cursor-pointer">พณาไพรสิน</span>
            <span className="mx-2">›</span>
            <span onClick={() => router.push('/cart')} className="hover:text-[#1B4D3E] cursor-pointer">ตะกร้าสินค้า</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900">ชำระเงิน</span>
          </div>
          
          <h1 className="text-2xl font-bold text-[#1B4D3E] mb-6">ชำระเงินและแจ้งโอน</h1>

          <div className="flex rounded-md overflow-hidden bg-white/60 mb-4 font-bold text-sm shadow-sm">
            <div className="flex-1 py-3 text-center text-gray-500 bg-gray-200">1 ตะกร้าสินค้า</div>
            <div className="flex-1 py-3 text-center text-white bg-[#1B4D3E]">2 ชำระเงิน & แนบสลิป</div>
            <div className="flex-1 py-3 text-center text-gray-500 bg-gray-200">3 ยืนยันคำสั่งซื้อ</div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-6xl flex-grow pb-16">
        {cart.length === 0 ? (
           <div className="bg-white rounded-md shadow-sm p-12 text-center border border-gray-100">
             <h2 className="text-xl font-bold text-gray-800 mb-4">ไม่มีสินค้าให้ชำระเงิน</h2>
             <button onClick={() => router.push('/')} className="bg-[#1B4D3E] text-white px-8 py-2 rounded-md font-bold">กลับไปหน้าหลัก</button>
           </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
            
            <div className="w-full lg:w-2/3 space-y-6">
              <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">ข้อมูลติดต่อ</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">อีเมล</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                    <input 
                      type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">ที่อยู่จัดส่ง</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อ-นามสกุลผู้รับ</label>
                    <input 
                      type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">บ้านเลขที่ / หมู่ / ถนน</label>
                    <input 
                      type="text" value={address} onChange={(e) => setAddress(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">ตำบล / แขวง</label>
                      <input 
                        type="text" value={subDistrict} onChange={(e) => setSubDistrict(e.target.value)} required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">อำเภอ / เขต</label>
                      <input 
                        type="text" value={district} onChange={(e) => setDistrict(e.target.value)} required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">จังหวัด</label>
                      <select 
                        value={province} onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                      >
                        <option value="เชียงใหม่">เชียงใหม่</option>
                        <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">รหัสไปรษณีย์</label>
                      <input 
                        type="text" value={zipcode} onChange={(e) => setZipcode(e.target.value)} required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#1B4D3E] text-sm text-gray-800 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">ช่องทางชำระเงินและแจ้งโอน</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className={`border rounded-md p-4 flex items-center cursor-pointer ${paymentMethod === 'bank_transfer' ? 'border-[#1B4D3E] bg-green-50/50' : 'border-gray-200'}`}>
                    <input
                      type="radio" name="payment_method" value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                    />
                    <span className="ml-2 text-sm font-bold text-gray-800">โอนเงินผ่านธนาคาร</span>
                  </label>
                  <label className={`border rounded-md p-4 flex items-center cursor-pointer ${paymentMethod === 'promptpay' ? 'border-[#1B4D3E] bg-green-50/50' : 'border-gray-200'}`}>
                    <input
                      type="radio" name="payment_method" value="promptpay"
                      checked={paymentMethod === 'promptpay'}
                      onChange={() => setPaymentMethod('promptpay')}
                      className="text-[#1B4D3E] focus:ring-[#1B4D3E]"
                    />
                    <span className="ml-2 text-sm font-bold text-gray-800">สแกน QR พร้อมเพย์</span>
                  </label>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-md p-6 mb-6 text-center">
                  <p className="text-sm text-gray-600 mb-2 font-medium">โอนเงินเข้าบัญชี (พร้อมเพย์)</p>
                  <div className="w-32 h-32 bg-white mx-auto mb-3 flex items-center justify-center border border-gray-300 shadow-sm">
                    <span className="text-gray-400 text-xs">รูป QR Code</span>
                  </div>
                  <p className="font-bold text-gray-900">ธนาคารกสิกรไทย</p>
                  <p className="text-xl font-mono text-[#1B4D3E] font-bold tracking-widest my-1">012-3-45678-9</p>
                  <p className="text-sm text-gray-600">ชื่อบัญชี: ร้านพณาไพรสิน</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">แนบหลักฐานการโอนเงิน (สลิป)</label>
                  {slipPreview && (
                    <div className="mb-4 w-48 h-auto border-2 border-gray-200 rounded-md overflow-hidden mx-auto shadow-sm">
                      <Image unoptimized loading="eager" width={96} height={96} src={slipPreview} alt="Slip" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer bg-white border-2 border-dashed border-[#1B4D3E] text-[#1B4D3E] px-4 py-4 rounded-md font-bold hover:bg-green-50 transition text-sm flex flex-col justify-center items-center">
                    คลิกเพื่ออัปโหลดสลิปโอนเงิน (JPG, PNG)
                    <input type="file" className="hidden" accept="image/*" onChange={handleSlipChange} />
                  </label>
                </div>
              </div>

              <button type="button" onClick={() => router.push('/cart')} className="flex items-center gap-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 w-max shadow-sm">
                <span>←</span> กลับไปตรวจสอบตะกร้าสินค้า
              </button>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-md shadow-sm border border-gray-100 p-8 sticky top-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-3">ตรวจสอบคำสั่งซื้อ</h2>
                
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-24 bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 border border-gray-200 rounded-sm">
                        {item.image ? (
                          <Image unoptimized loading="eager" width={80} height={96} src={getProductImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover rounded-sm" onError={(e) => { e.currentTarget.src = '/image_289eb4.jpg'; }} />
                        ) : (
                          <span className="text-xs font-bold">ไม่มีรูป</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col pt-1">
                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-sm font-bold text-[#1B4D3E] mt-1">฿{item.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-auto font-medium">จำนวน {item.quantity} ชิ้น</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>ยอดรวมสินค้า ({cart.length} ชิ้น)</span>
                    <span className="text-gray-900">฿{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>ค่าจัดส่ง</span>
                    <span className="text-gray-900">ฟรี</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-5 mt-5 flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-900 text-lg">ยอดชำระสุทธิ</span>
                  <span className="text-2xl font-bold text-[#1B4D3E]">฿{grandTotal.toLocaleString()}</span>
                </div>

                <label className="flex items-start mb-6 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="mt-1 form-checkbox text-[#1B4D3E] rounded-sm w-4 h-4 border-gray-400 focus:ring-[#1B4D3E]" 
                  />
                  <span className="ml-3 text-sm font-bold text-gray-700 leading-snug">ฉันได้ตรวจสอบข้อมูลและยอมรับเงื่อนไขการสั่งซื้อแล้ว</span>
                </label>

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-md font-bold shadow-md transition uppercase tracking-wide text-sm ${
                    isProcessing
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-[#1B4D3E] text-white hover:bg-[#143a2f]'
                  }`}
                >
                  {isProcessing ? 'กำลังส่งข้อมูล...' : 'ยืนยันคำสั่งซื้อ'}
                </button>
              </div>
            </div>

          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}