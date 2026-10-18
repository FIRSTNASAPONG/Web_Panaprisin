"use client";
import { useParams } from 'next/navigation';
import BuyerOrderDetail from '@/components/BuyerOrderDetail';
export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  return <BuyerOrderDetail id={id}/>;
}
