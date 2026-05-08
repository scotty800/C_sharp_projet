'use client';

import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs SSR avec drag & drop
const StudioLayout = dynamic(
  () => import('@/components/shop-studio/StudioLayout'),
  { ssr: false }
);

export default function StudioPage() {
  return <StudioLayout />;
}