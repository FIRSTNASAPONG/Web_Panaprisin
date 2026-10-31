import type { ReactNode } from 'react';
import RoleGuard from '@/components/RoleGuard';
export default function SellerLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="seller">{children}</RoleGuard>;
}
