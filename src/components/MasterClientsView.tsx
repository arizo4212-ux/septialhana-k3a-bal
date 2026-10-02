import React, { useState } from 'react';
import { Client } from '../types/maritime';
import { Users, Plus, Search, Trash2, Edit2, Phone, Mail, Building, FileCheck } from 'lucide-react';
import { addClient, updateClient, deleteClient } from '../services/maritimeService';

interface MasterClientsViewProps {
  clients: Client[];
}

export const MasterClientsView: React.FC<MasterClientsViewProps> = ({ clients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [picName, setPicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [industry, setIndustry] = useState('');
  const [contractType, setContractType] = useState<Client['contractType']>('kontrak_tahunan');

  const openCreateModal = () => {
    setEditingClient(null);
    setCompanyName('');
    setPicName('');
    setPhone('+62 ');
    setEmail('');
    setAddress('');
    setIndustry('Agrikultur & Kelapa Sawit (CPO)');
    setContractType('kontrak_tahunan');
    setModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setCompanyName(c.companyName);
    setPicName(c.picName);
    setPhone(c.phone);
    setEmail(c.email);
    setAddress(c.address);
    setIndustry(c.industry);
    setContractType(c.contractType);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !picName.trim()) return alert('Nama perusahaan dan PIC wajib diisi');
    setLoading(true);
    try {
      const payload = {
        companyName,
        picName,
        phone,
        email,
        address,
        industry,
        contractType,
      };
      if (editingClient) {
        await updateClient(editingClient.id, payload);
      } else {
        await addClient(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data klien');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data pelanggan shipper ini?')) {
      try {
        await deleteClient(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredClients = clients.filter((c) =>
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.picName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Data Shipper & Pelanggan (Clients)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data mitra pengirim barang, perusahaan logistik, kontrak tahunan, dan kontak penanggung jawab kargo.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Shipper Baru</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari perusahaan, PIC, industri..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400">{filteredClients.length} Mitra Kargo</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">{c.companyName}</h3>
                    <span className="text-xs text-cyan-400 font-medium">{c.industry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1 rounded text-slate-400 hover:text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">PIC:</span>
                  <span className="font-semibold text-white">{c.picName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" /> Kontak:
                  </span>
                  <span className="text-slate-200 font-mono">{c.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" /> Email:
                  </span>
                  <span className="text-slate-200">{c.email}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Tipe Kontrak:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 capitalize">
                    {c.contractType.replace('_', ' ')}
                  </span>
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
              {editingClient ? 'Edit Data Shipper' : 'Tambah Shipper / Pelanggan Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nama Perusahaan (Shipper)</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="PT..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nama PIC (Kontak)</label>
                  <input
                    type="text"
                    required
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Tipe Kontrak</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="kontrak_tahunan">Kontrak Tahunan (Annual)</option>
                    <option value="spot_charter">Spot Charter (Per Order)</option>
                    <option value="voyage_charter">Voyage Charter (Per Pelayaran)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Sektor Industri Kargo</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Contoh: FMCG / Manufaktur / Smelter Nikel"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Alamat Kantor / Pergudangan</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
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
