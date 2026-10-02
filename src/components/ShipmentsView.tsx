import React, { useState } from 'react';
import { Shipment, Vessel, Port, Client, RouteItem } from '../types/maritime';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Printer,
  CheckCircle2,
  Clock,
  Ship,
  Anchor,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { addShipment, updateShipment, deleteShipment } from '../services/maritimeService';

interface ShipmentsViewProps {
  shipments: Shipment[];
  vessels: Vessel[];
  ports: Port[];
  clients: Client[];
  routes: RouteItem[];
}

export const ShipmentsView: React.FC<ShipmentsViewProps> = ({
  shipments,
  vessels,
  ports,
  clients,
  routes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [previewShipment, setPreviewShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [blNumber, setBlNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [vesselName, setVesselName] = useState('');
  const [originPort, setOriginPort] = useState('');
  const [destinationPort, setDestinationPort] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [cargoWeightTon, setCargoWeightTon] = useState<number>(100);
  const [cargoVolumeTeu, setCargoVolumeTeu] = useState<number>(10);
  const [freightChargeRp, setFreightChargeRp] = useState<number>(50000000);
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'dp_paid' | 'paid'>('paid');
  const [status, setStatus] = useState<Shipment['status']>('booking');
  const [departureDate, setDepartureDate] = useState('');
  const [etaDate, setEtaDate] = useState('');

  const openCreateModal = () => {
    setEditingShipment(null);
    setBlNumber(`BL-NML/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
    setClientName(clients[0]?.companyName || 'PT Shipper Nasional');
    setVesselName(vessels[0]?.name || 'KM Nusantara Samudera 01');
    setOriginPort(ports[0]?.name || 'Pelabuhan Tanjung Priok');
    setDestinationPort(ports[1]?.name || 'Pelabuhan Tanjung Perak');
    setCargoType('Kontainer Muatan Umum (FMCG & Pangan)');
    setCargoWeightTon(250);
    setCargoVolumeTeu(20);
    setFreightChargeRp(120000000);
    setPaymentStatus('dp_paid');
    setStatus('booking');
    setDepartureDate(new Date().toISOString().split('T')[0]);
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setEtaDate(nextWeek);
    setModalOpen(true);
  };

  const openEditModal = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setBlNumber(shipment.blNumber);
    setClientName(shipment.clientName);
    setVesselName(shipment.vesselName);
    setOriginPort(shipment.originPort);
    setDestinationPort(shipment.destinationPort);
    setCargoType(shipment.cargoType);
    setCargoWeightTon(shipment.cargoWeightTon);
    setCargoVolumeTeu(shipment.cargoVolumeTeu);
    setFreightChargeRp(shipment.freightChargeRp);
    setPaymentStatus(shipment.paymentStatus);
    setStatus(shipment.status);
    setDepartureDate(shipment.departureDate);
    setEtaDate(shipment.etaDate);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        blNumber,
        clientName,
        vesselName,
        originPort,
        destinationPort,
        cargoType,
        cargoWeightTon: Number(cargoWeightTon),
        cargoVolumeTeu: Number(cargoVolumeTeu),
        freightChargeRp: Number(freightChargeRp),
        paymentStatus,
        status,
        departureDate,
        etaDate,
      };

      if (editingShipment) {
        await updateShipment(editingShipment.id, payload);
      } else {
        await addShipment(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan transaksi B/L');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus dokumen Bill of Lading ini?')) {
      try {
        await deleteShipment(id);
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus');
      }
    }
  };

  const handleQuickStatusChange = async (shipment: Shipment, nextStatus: Shipment['status']) => {
    try {
      await updateShipment(shipment.id, { status: nextStatus, blNumber: shipment.blNumber });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.blNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.destinationPort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Transaksi Muatan & Bill of Lading (B/L)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola surat perintah muat kargo, manifest pelayaran, status muat bongkar, dan invoice freight.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan B/L Kargo Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No B/L, Shipper, Kapal, Pelabuhan..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>
          {['all', 'booking', 'loading', 'in_transit', 'arrived', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Shipment Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">No. B/L & Shipper</th>
                <th className="py-3.5 px-4">Kapal & Rute</th>
                <th className="py-3.5 px-4">Jenis Muatan & Volume</th>
                <th className="py-3.5 px-4">Ongkos Angkut (Freight)</th>
                <th className="py-3.5 px-4">Jadwal (ETD / ETA)</th>
                <th className="py-3.5 px-4">Status Pengapalan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data pengapalan kargo.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((s) => {
                  const statusBadgeColor = {
                    booking: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    loading: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
                    in_transit: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                    arrived: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
                    unloading: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                  }[s.status] || 'bg-slate-800 text-slate-400';

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-cyan-400 font-bold">{s.blNumber}</div>
                        <div className="text-white font-medium mt-0.5">{s.clientName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-cyan-400" />
                          {s.vesselName}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.originPort} → {s.destinationPort}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{s.cargoType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {s.cargoVolumeTeu > 0 && `${s.cargoVolumeTeu} TEU`}
                          {s.cargoVolumeTeu > 0 && s.cargoWeightTon > 0 && ' • '}
                          {s.cargoWeightTon > 0 && `${s.cargoWeightTon} Ton`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-emerald-400">
                          {formatRupiah(s.freightChargeRp)}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-mono mt-0.5 ${
                            s.paymentStatus === 'paid'
                              ? 'text-emerald-400'
                              : s.paymentStatus === 'dp_paid'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {s.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px]">
                        <div>ETD: <span className="text-slate-300">{s.departureDate}</span></div>
                        <div>ETA: <span className="text-cyan-400 font-medium">{s.etaDate}</span></div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadgeColor}`}>
                          {s.status.toUpperCase().replace('_', ' ')}
                        </span>
                        {/* Quick Status Next Button */}
                        {s.status === 'booking' && (
                          <button
                            onClick={() => handleQuickStatusChange(s, 'loading')}
                            className="block mt-1 text-[10px] text-cyan-400 hover:underline"
                          >
                            → Mulai Loading
                          </button>
                        )}
                        {s.status === 'loading' && (
                          <button
                            onClick={() => handleQuickStatusChange(s, 'in_transit')}
                            className="block mt-1 text-[10px] text-cyan-400 hover:underline"
                          >
                            → Lepas Jangkar (Layar)
                          </button>
                        )}
                        {s.status === 'in_transit' && (
                          <button
                            onClick={() => handleQuickStatusChange(s, 'arrived')}
                            className="block mt-1 text-[10px] text-cyan-400 hover:underline"
                          >
                            → Kapal Tiba di Port
                          </button>
                        )}
                        {s.status === 'arrived' && (
                          <button
                            onClick={() => handleQuickStatusChange(s, 'delivered')}
                            className="block mt-1 text-[10px] text-emerald-400 hover:underline"
                          >
                            → Selesai Serah Terima
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewShipment(s)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-400 transition-colors"
                            title="Cetak & Lihat Bill of Lading"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit B/L */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingShipment ? 'Perbarui Surat Perintah Muat B/L' : 'Penerbitan Bill of Lading (B/L) Baru'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nomor Bill of Lading (B/L)</label>
                  <input
                    type="text"
                    required
                    value={blNumber}
                    onChange={(e) => setBlNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shipper / Pelanggan Pengirim</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nama Perusahaan Shipper"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kapal Pengangkut (Vessel)</label>
                  <select
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Pengapalan</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Shipment['status'])}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="booking">Booking Kargo</option>
                    <option value="loading">Loading di Pelabuhan</option>
                    <option value="in_transit">In Transit (Berlayar)</option>
                    <option value="arrived">Tiba di Pelabuhan Tujuan</option>
                    <option value="unloading">Unloading Kargo</option>
                    <option value="delivered">Delivered (Selesai)</option>
                    <option value="cancelled">Cancelled (Dibatalkan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pelabuhan Muat (Origin Port)</label>
                  <select
                    value={originPort}
                    onChange={(e) => setOriginPort(e.target.value)}
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
                  <label className="block text-slate-300 font-medium mb-1">Pelabuhan Bongkar (Destination Port)</label>
                  <select
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    {ports.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} ({p.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Deskripsi & Jenis Muatan</label>
                  <input
                    type="text"
                    required
                    value={cargoType}
                    onChange={(e) => setCargoType(e.target.value)}
                    placeholder="Contoh: Baja Tulangan, Kontainer 40ft Kering, CPO Minyak Nabati"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tonase Muatan (Ton)</label>
                  <input
                    type="number"
                    value={cargoWeightTon}
                    onChange={(e) => setCargoWeightTon(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Volume Kontainer (TEU)</label>
                  <input
                    type="number"
                    value={cargoVolumeTeu}
                    onChange={(e) => setCargoVolumeTeu(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tarif Freight / Ongkos Angkut (Rp)</label>
                  <input
                    type="number"
                    value={freightChargeRp}
                    onChange={(e) => setFreightChargeRp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="unpaid">Belum Dibayar (Unpaid)</option>
                    <option value="dp_paid">Uang Muka Terbayar (DP Paid)</option>
                    <option value="paid">Lunas (Paid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tanggal Keberangkatan (ETD)</label>
                  <input
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estimasi Tiba (ETA)</label>
                  <input
                    type="date"
                    required
                    value={etaDate}
                    onChange={(e) => setEtaDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Transaksi B/L'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill of Lading Printable Document Preview Modal */}
      {previewShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-6 border border-slate-200">
            {/* Document Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <div className="text-xl font-black tracking-tight text-blue-950">SAMUDERA LOGISTICS INDONESIA</div>
                <div className="text-[11px] text-slate-600">PT Pelayaran & Angkutan Laut Samudera Nusantara Tbk</div>
                <div className="text-[10px] text-slate-500">Izin Usaha Angkutan Laut (SIUPAL) No. 048/AL-DITJENHUB-2024</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">BILL OF LADING</div>
                <div className="text-base font-black font-mono text-blue-900">{previewShipment.blNumber}</div>
                <div className="text-[10px] text-slate-500">Original Non-Negotiable Copy</div>
              </div>
            </div>

            {/* Shipper & Consignee details */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-300 p-3 rounded">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Shipper / Pengirim:</span>
                <span className="font-semibold text-slate-900 text-sm">{previewShipment.clientName}</span>
                <p className="text-[11px] text-slate-600 mt-1">Kawasan Industri & Perdagangan Domestik</p>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Kapal Pengangkut & Voyage:</span>
                <span className="font-semibold text-slate-900 text-sm">{previewShipment.vesselName}</span>
                <p className="text-[11px] text-slate-600 mt-1">Status Pelayaran: {previewShipment.status.toUpperCase()}</p>
              </div>
            </div>

            {/* Ports */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <span className="font-bold text-slate-500 text-[10px] block uppercase">Pelabuhan Muat (Port of Loading):</span>
                <span className="font-bold text-slate-800">{previewShipment.originPort}</span>
                <span className="text-[10px] text-slate-500 block">ETD: {previewShipment.departureDate}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 text-[10px] block uppercase">Pelabuhan Bongkar (Port of Discharge):</span>
                <span className="font-bold text-slate-800">{previewShipment.destinationPort}</span>
                <span className="text-[10px] text-slate-500 block">ETA: {previewShipment.etaDate}</span>
              </div>
            </div>

            {/* Cargo description */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 text-left">Deskripsi Muatan (Description of Goods)</th>
                    <th className="py-2 px-3 text-center">Volume (TEU)</th>
                    <th className="py-2 px-3 text-right">Berat Kotor (Gross Ton)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 px-3">
                      <div className="font-bold">{previewShipment.cargoType}</div>
                      <div className="text-[10px] text-slate-500">Kargo aman sesuai regulasi IMO IMDG Code</div>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold">{previewShipment.cargoVolumeTeu} TEUs</td>
                    <td className="py-3 px-3 text-right font-semibold">{previewShipment.cargoWeightTon} Ton</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Freight Charge */}
            <div className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-200 text-xs">
              <div>
                <span className="font-bold text-blue-950 uppercase text-[10px] block">Total Biaya Freight:</span>
                <span className="text-base font-black text-blue-900">{formatRupiah(previewShipment.freightChargeRp)}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-950 uppercase text-[10px] block">Status Tagihan:</span>
                <span className="font-bold text-emerald-700 uppercase">{previewShipment.paymentStatus}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-4 text-xs text-center">
              <div>
                <p className="text-[11px] text-slate-600">Diserahkan oleh Shipper,</p>
                <div className="h-14"></div>
                <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( {previewShipment.clientName} )</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-600">Nakhoda / Agen Pelayaran Resmi,</p>
                <div className="h-14"></div>
                <p className="font-bold border-t border-slate-400 pt-1 text-slate-800">( Master / Agent of Vessel )</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => setPreviewShipment(null)}
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded bg-blue-900 hover:bg-blue-800 text-white text-xs font-medium flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Lembar Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
