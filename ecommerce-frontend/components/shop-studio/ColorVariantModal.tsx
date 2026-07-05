'use client';
import { useState, useEffect } from 'react';
import { FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import { ColorVariant } from '@/types/studio';

interface Props {
  color: string;
  colorName?: string;
  productName: string;
  productStock: number;
  productSizes: string[];
  existingVariant?: ColorVariant | null;
  onSave: (variant: ColorVariant, files: { image1?: File; image2?: File; image3?: File }) => Promise<void>;
  onClose: () => void;
}

const PREDEFINED_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];

export default function ColorVariantModal({
  color, colorName, productName, productStock, productSizes,
  existingVariant, onSave, onClose,
}: Props) {
  const [customName, setCustomName] = useState(existingVariant?.customName || '');
  const [stock, setStock] = useState(existingVariant?.stock ?? productStock);
  const [sizes, setSizes] = useState<string[]>(existingVariant?.sizes || productSizes);
  const [images, setImages] = useState<(string | null)[]>([
    existingVariant?.imageUrl1 || null,
    existingVariant?.imageUrl2 || null,
    existingVariant?.imageUrl3 || null,
  ]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [saving, setSaving] = useState(false);

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleFile = (idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    setImages(prev => prev.map((v, i) => (i === idx ? url : v)));
    setFiles(prev => prev.map((v, i) => (i === idx ? file : v)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        { color, customName: customName || null, stock, sizes,
          imageUrl1: images[0], imageUrl2: images[1], imageUrl3: images[2] },
        { image1: files[0] || undefined, image2: files[1] || undefined, image3: files[2] || undefined }
      );
      onClose();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl w-full max-w-md max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: color }} />
            <h3 className="text-white font-semibold">Variante — {colorName || color}</h3>
          </div>
          <button onClick={onClose}><FiX size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-white text-sm block mb-1">
              Nom spécifique <span className="text-gray-500">(optionnel — sinon "{productName}")</span>
            </label>
            <input type="text" value={customName} onChange={e => setCustomName(e.target.value)}
              placeholder={productName}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>

          <div>
            <label className="text-white text-sm block mb-1">Stock pour cette couleur</label>
            <input type="number" value={stock} onChange={e => setStock(parseInt(e.target.value) || 0)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white" />
          </div>

          <div>
            <label className="text-white text-sm block mb-2">Tailles disponibles</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_SIZES.map(s => (
                <button key={s} type="button" onClick={() => toggleSize(s)}
                  className={`px-3 py-1.5 rounded-md text-sm ${sizes.includes(s) ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white text-sm block mb-2">Images de cette couleur</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map(idx => (
                <div key={idx} className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  {images[idx] ? (
                    <>
                      <img src={images[idx]!} className="w-full h-full object-cover" />
                      <button onClick={() => { setImages(p => p.map((v,i)=>i===idx?null:v)); setFiles(p => p.map((v,i)=>i===idx?null:v)); }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full"><FiTrash2 size={10} /></button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-700">
                      <FiUpload size={16} />
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && handleFile(idx, e.target.files[0])} />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Laissez vide pour hériter des images générales du produit.
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button onClick={onClose} className="flex-1 py-2 bg-gray-700 text-white rounded-lg">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-primary text-white rounded-lg disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}