import React, { useState } from 'react';
import { RouteItem, Port } from '../types/maritime';
import { Compass, Plus, Search, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { addRoute, updateRoute, deleteRoute } from '../services/maritimeService';

interface MasterRoutesViewProps {
  routes: RouteItem[];
  ports: Port[];
}

export const MasterRoutesView: React.FC<MasterRoutesViewProps> = ({ routes, ports }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);
  const [loading, setLoading] = useState(false);

  const [originPortName, setOriginPortName] = useState('');
  const [destPortName, setDestPortName] = useState('');
  const [distanceNauticalMiles, setDistanceNauticalMiles] = useState<number>(600);
  const [estDays, setEstDays] = useState<number>(3);
  const [tariffPerTeu, setTariffPerTeu] = useState<number>(4500000);
  const [tariffPerTon, setTariffPerTon] = useState<number>(400000);
  const [status, setStatus] = useState<RouteItem['status']>('active');

  const openCreateModal = () => {
    setEditingRoute(null);
    setOriginPortName(ports[0]?.name || 'Pelabuhan Tanjung Priok');
    setDestPortName(ports[1]?.name || 'Pelabuhan Tanjung Perak');
    setDistanceNauticalMiles(500);
    setEstDays(2);
    setTariffPerTeu(4200000);
    setTariffPerTon(380000);
    setStatus('active');
    setModalOpen(true);
  };

  const openEditModal = (r: RouteItem) => {
    setEditingRoute(r);
    setOriginPortName(r.originPortName);
    setDestPortName(r.destPortName);
    setDistanceNauticalMiles(r.distanceNauticalMiles);
    setEstDays(r.estDays);
    setTariffPerTeu(r.tariffPerTeu);
    setTariffPerTon(r.tariffPerTon);
    setStatus(r.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        originPortName,
        destPortName,
        distanceNauticalMiles: Number(distanceNauticalMiles),
        estDays: Number(estDays),
        tariffPerTeu: Number(tariffPerTeu),
        tariffPerTon: Number(tariffPerTon),
        status,
      };
      if (editingRoute) {
        await updateRoute(editingRoute.id, payload);
      } else {
        await addRoute(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data rute');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus master rute pelayaran ini?')) {
      try {
        await deleteRoute(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredRoutes = routes.filter((r) =>
    r.originPortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.destPortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Rute & Tarif Pelayaran Laut (Shipping Corridors)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standar jarak nautical miles, estimasi waktu layar (sailing time), serta tarif dasar angkut kontainer dan curah.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rute Pelayaran</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari rute pelabuhan asal atau tujuan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredRoutes.length} Koridor Tol Laut</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <span>{r.originPortName}</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{r.destPortName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1 rounded text-slate-400 hover:text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">JARAK LAUT</span>
                  <span className="font-bold text-white font-mono">{r.distanceNauticalMiles} NM</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">ESTIMASI TEMPUH</span>
                  <span className="font-bold text-cyan-400">{r.estDays} Hari Layar</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">TARIF / TEU</span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">{formatRupiah(r.tariffPerTeu)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">TARIF / TON</span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">{formatRupiah(r.tariffPerTon)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Kategori Regulasi: ALKI Jalur Utama</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {editingRoute ? 'Edit Rute Pelayaran' : 'Tambah Rute & Tarif Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Pelabuhan Asal (Origin)</label>
                <select
                  value={originPortName}
                  onChange={(e) => setOriginPortName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {ports.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Pelabuhan Tujuan (Destination)</label>
                <select
                  value={destPortName}
                  onChange={(e) => setDestPortName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {ports.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.city})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Jarak (Nautical Miles)</label>
                  <input
                    type="number"
                    value={distanceNauticalMiles}
                    onChange={(e) => setDistanceNauticalMiles(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Estimasi Hari Tempuh</label>
                  <input
                    type="number"
                    value={estDays}
                    onChange={(e) => setEstDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Tarif Standar / TEU (Rp)</label>
                  <input
                    type="number"
                    value={tariffPerTeu}
                    onChange={(e) => setTariffPerTeu(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tarif Standar / Ton (Rp)</label>
                  <input
                    type="number"
                    value={tariffPerTon}
                    onChange={(e) => setTariffPerTon(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Status Rute</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  <option value="active">Aktif Normal (Active)</option>
                  <option value="restricted">Dibatasi Musiman (Restricted)</option>
                  <option value="seasonal">Musiman Gelombang (Seasonal)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Rute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
