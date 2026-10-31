import Link from 'next/link';
import SalesReport from '@/components/SalesReport';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export default function Page() { return <><Navbar /><main className="max-w-6xl mx-auto p-6 min-h-[70vh] bg-gray-50 text-gray-800"><Link href="/seller" className="block text-[#1B4D3E] mb-5">← Seller Centre</Link><SalesReport sellerScope /></main><Footer /></>; }
