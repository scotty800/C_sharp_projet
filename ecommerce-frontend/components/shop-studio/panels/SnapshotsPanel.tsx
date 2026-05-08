'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiRefreshCw, FiTrash2, FiClock } from 'react-icons/fi';
import { shopCustomizationService } from '@/services/api/shopCustomization';
import toast from 'react-hot-toast';

interface Props {
  shopId: number;
  onRestore: () => void;
}

export default function SnapshotsPanel({ shopId, onRestore }: Props) {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  const loadSnapshots = async () => {
    try {
      setLoading(true);
      const data = await shopCustomizationService.getSnapshots(shopId);
      setSnapshots(data);
    } catch (error) {
      console.error('Erreur chargement snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshots();
  }, [shopId]);

  const handleSaveSnapshot = async () => {
    if (!snapshotName.trim()) {
      toast.error('Donnez un nom à cette version');
      return;
    }

    try {
      setSaving(true);
      await shopCustomizationService.saveSnapshot(shopId, snapshotName);
      toast.success('Version sauvegardée !');
      setSnapshotName('');
      loadSnapshots();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (name: string) => {
    if (confirm(`Restaurer la version "${name}" ? Les modifications non sauvegardées seront perdues.`)) {
      try {
        await shopCustomizationService.restoreSnapshot(shopId, name);
        toast.success('Version restaurée !');
        onRestore();
      } catch (error) {
        toast.error('Erreur lors de la restauration');
      }
    }
  };

  const handleDelete = async (name: string) => {
    if (confirm(`Supprimer la version "${name}" ?`)) {
      try {
        await shopCustomizationService.deleteSnapshot(shopId, name);
        toast.success('Version supprimée');
        loadSnapshots();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Sauvegarder une nouvelle version */}
      <div>
        <h3 className="text-white font-semibold mb-3">Sauvegarder cette version</h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nom de la version (ex: V1 - Design été)"
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
          <button
            onClick={handleSaveSnapshot}
            disabled={saving || !snapshotName.trim()}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiSave size={16} />
          </button>
        </div>
      </div>

      {/* Liste des versions */}
      <div>
        <h3 className="text-white font-semibold mb-3">Versions sauvegardées</h3>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : snapshots.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Aucune version sauvegardée
          </p>
        ) : (
          <div className="space-y-2">
            {snapshots.map(snapshot => (
              <div
                key={snapshot.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FiClock className="text-gray-500" />
                  <div>
                    <div className="text-white text-sm font-medium">{snapshot.name}</div>
                    <div className="text-gray-500 text-xs">
                      {new Date(snapshot.createdAt).toLocaleDateString()} à{' '}
                      {new Date(snapshot.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(snapshot.name)}
                    className="text-blue-400 hover:text-blue-300"
                    title="Restaurer"
                  >
                    <FiRefreshCw size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(snapshot.name)}
                    className="text-red-400 hover:text-red-300"
                    title="Supprimer"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}