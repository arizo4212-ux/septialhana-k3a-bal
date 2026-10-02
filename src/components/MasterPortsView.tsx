import React, { useState } from 'react';
import { Port } from '../types/maritime';
import { Anchor, Plus, Search, Trash2, Edit2, MapPin } from 'lucide-react';
import { addPort, updatePort, deletePort } from '../services/maritimeService';

interface MasterPortsViewProps {
  ports: Port[];
}

export const MasterPortsView: React.FC<MasterPortsViewProps> = ({ ports }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [lat, setLat] = useState<number>(-6.1018);
  const [lng, setLng] = useState<number>(106.8825);
  const [activeDocks, setActiveDocks] = useState<number>(8);
  const [capacityTeu, setCapacityTeu] = useState<number>(1500000);

  const openCreateModal = () => {
    setEditingPort(null);
    setCode(`ID-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);
    setName('');
    setCity('');
    setProvince('');
    setLat(-6.0);
    setLng(106.8);
    setActiveDocks(6);
    setCapacityTeu(1000000);
    setModalOpen(true);
  };

  const openEditModal = (p: Port) => {
    setEditingPort(p);
    setCode(p.code);
    setName(p.name);
    setCity(p.city);
    setProvince(p.province);
    setLat(p.lat);
    setLng(p.lng);
    setActiveDocks(p.activeDocks);
    setCapacityTeu(p.capacityTeu);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return alert('Kode dan nama pelabuhan wajib diisi');
    setLoading(true);
    try {
      const payload = {
        code,
        name,
        city,
        province,
        lat: Number(lat),
        lng: Number(lng),
        activeDocks: Number(activeDocks),
        capacityTeu: Number(capacityTeu),
      };
      if (editingPort) {
        await updatePort(editingPort.id, payload);
      } else {
        await addPort(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pelabuhan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data pelabuhan ini?')) {
      try {
        await deletePort(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredPorts = ports.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Data Pelabuhan Laut (Port Terminals)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Daftar pelabuhan singgah, terminal peti kemas, dermaga aktif, dan koordinat navigasi perairan Indonesia.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelabuhan Baru</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode atau nama pelabuhan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredPorts.length} Pelabuhan Terdaftar</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPorts.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <span className="font-mono text-cyan-400 text-xs">{p.code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1 rounded text-slate-400 hover:text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{p.city}, {p.province}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Dermaga Aktif:</span>
                  <span className="font-semibold text-white">{p.activeDocks} Dermaga</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kapasitas TEUs:</span>
                  <span className="font-semibold text-cyan-400">{p.capacityTeu.toLocaleString()} TEU/thn</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Koordinat:</span>
                  <span>{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {editingPort ? 'Edit Data Pelabuhan' : 'Tambah Pelabuhan Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Kode Pelabuhan (Port Code)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Nama Pelabuhan Resmi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pelabuhan Tanjung Priok"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Kota / Kabupaten</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Dermaga Aktif</label>
                  <input
                    type="number"
                    value={activeDocks}
                    onChange={(e) => setActiveDocks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Kapasitas TEU / Tahun</label>
                  <input
                    type="number"
                    value={capacityTeu}
                    onChange={(e) => setCapacityTeu(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
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
                  {loading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
