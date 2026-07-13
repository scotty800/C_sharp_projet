'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ShopPageRenderer from '@/components/shop-studio/ShopPageRenderer';
import { ShopRenderData } from '@/services/api/shopRender';

export default function StudioPreviewPage() {
  const { shopId } = useParams();
  const [data, setData] = useState<ShopRenderData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`studio_preview:${shopId}`);
      if (!raw) { setNotFound(true); return; }
      const parsed = JSON.parse(raw);
      // Reconstruction des Map (non sérialisables directement)
      parsed.blocksByPage = new Map(Object.entries(parsed.blocksByPage));
      parsed.globalProductCustomizations = new Map(
        Object.entries(parsed.globalProductCustomizations).map(([k, v]: any) => [Number(k), v])
      );
      setData(parsed);
    } catch {
      setNotFound(true);
    }
  }, [shopId]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Aucun aperçu disponible. Ouvre l'aperçu depuis le Studio.</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: data.customization?.backgroundColor || '#f3f4f6' }}>
      <div className="sticky top-0 z-[9999] bg-amber-500 text-black text-center text-xs font-semibold py-1">
        MODE APERÇU — modifications non publiées
      </div>
      <ShopPageRenderer data={data} onAddToCart={() => {}} />
    </div>
  );
}