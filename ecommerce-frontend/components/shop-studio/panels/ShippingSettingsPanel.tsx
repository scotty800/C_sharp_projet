'use client';

import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { shippingService } from '@/services/api/shipping';
import { ShippingMethod, UpsertShippingMethodDto } from '@/types/shipping';

export default function ShippingSettingsPanel({ shopId }: { shopId: number }) {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await shippingService.getShopMethods(shopId);
    setMethods(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [shopId]);

  const addMethod = async () => {
    setSaving(true);
    await shippingService.upsertMethod(shopId, {
      name: 'Nouvelle méthode',
      price: 4.99,
      freeThreshold: null,
      minDays: 3,
      maxDays: 5,
      isDefault: methods.length === 0,
      isActive: true,
    });
    await load();
    setSaving(false);
  };

  const updateField = (id: number, field: keyof UpsertShippingMethodDto, value: any) => {
    setMethods(prev => prev.map(m => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const saveMethod = async (m: ShippingMethod) => {
    setSaving(true);
    await shippingService.upsertMethod(shopId, {
      id: m.id,
      name: m.name,
      price: m.price,
      freeThreshold: m.freeThreshold,
      minDays: m.minDays,
      maxDays: m.maxDays,
      isDefault: m.isDefault,
      isActive: m.isActive,
    });
    await load();
    setSaving(false);
  };

  const removeMethod = async (id: number) => {
    await shippingService.deleteMethod(shopId, id);
    await load();
  };

  if (loading) return <div className="text-gray-400 text-sm p-4">Chargement…</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Méthodes de livraison</h3>
        <button
          onClick={addMethod}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs hover:bg-primary/30 transition-colors"
        >
          <FiPlus size={12} /> Ajouter
        </button>
      </div>

      {methods.length === 0 && (
        <div className="text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          ⚠️ Aucune méthode configurée. Les clients ne pourront pas commander vos produits
          tant qu'au moins une méthode de livraison n'est pas définie.
        </div>
      )}

      <div className="space-y-3">
        {methods.map(m => (
          <div key={m.id} className="bg-gray-800/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={m.name}
                onChange={e => updateField(m.id, 'name', e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
              />
              <button
                onClick={() => removeMethod(m.id)}
                className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
              >
                <FiTrash2 size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Prix (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={m.price}
                  onChange={e => updateField(m.id, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Gratuit dès (€, optionnel)</label>
                <input
                  type="number"
                  step="0.01"
                  value={m.freeThreshold ?? ''}
                  onChange={e => updateField(m.id, 'freeThreshold', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Jamais"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Délai min (jours)</label>
                <input
                  type="number"
                  value={m.minDays}
                  onChange={e => updateField(m.id, 'minDays', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Délai max (jours)</label>
                <input
                  type="number"
                  value={m.maxDays}
                  onChange={e => updateField(m.id, 'maxDays', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={m.isDefault}
                  onChange={e => updateField(m.id, 'isDefault', e.target.checked)}
                />
                Méthode par défaut
              </label>
              <button
                onClick={() => saveMethod(m)}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <FiCheck size={12} /> Enregistrer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}