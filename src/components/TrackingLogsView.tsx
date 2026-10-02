import React, { useState } from 'react';
import { TrackingLog, Vessel } from '../types/maritime';
import { Navigation, Plus, Search, MapPin, Clock, Ship, Trash2, Radio } from 'lucide-react';
import { addTrackingLog, deleteTrackingLog, updateVessel } from '../services/maritimeService';

interface TrackingLogsViewProps {
  logs: TrackingLog[];
  vessels: Vessel[];
}

export const TrackingLogsView: React.FC<TrackingLogsViewProps> = ({ logs, vessels }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'KM Nusantara Samudera 01');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number>(-2.312);
  const [lng, setLng] = useState<number>(118.245);
  const [status, setStatus] = useState('Pelayaran Normal (Cruising)');
  const [speedKnots, setSpeedKnots] = useState<number>(14.5);
  const [notes, setNotes] = useState('');
  const [reportedBy, setReportedBy] = useState('Nakhoda / Mualim 1');

  const openCreateModal = () => {
    setVesselName(vessels[0]?.name || 'KM Nusantara Samudera 01');
    setLocationName('Selat Makassar Waypoint Delta-2');
    setLat(-3.125);
    setLng(118.85);
    setStatus('Pelayaran Normal (Cruising)');
    setSpeedKnots(15.0);
    setNotes('Kondisi navigasi aman, ombak 1.0m, arah haluan 085 derajat.');
    setReportedBy('Capt. Hendra Gunawan');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !status.trim()) return alert('Lokasi dan status wajib diisi');
    setLoading(true);

    try {
      const selectedV = vessels.find((v) => v.name === vesselName);
      await addTrackingLog({
        vesselId: selectedV?.id,
        vesselName,
        timestamp: new Date().toISOString(),
        lat: Number(lat),
        lng: Number(lng),
        locationName,
        status,
        speedKnots: Number(speedKnots),
        notes,
        reportedBy,
        createdAt: new Date().toISOString(),
      });

      // Also optionally update the vessel's current position and speed
      if (selectedV) {
        await updateVessel(selectedV.id, {
          currentPort: locationName,
          currentLat: Number(lat),
          currentLng: Number(lng),
          speedKnots: Number(speedKnots),
        });
      }

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal mencatat log pelacakan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus histori pelacakan ini?')) {
      try {
        await deleteTrackingLog(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Histori Pelacakan & Log Posisi Armada (Vessel Tracking Logs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rekam jejak navigasi, pelaporan posisi laut kapal, kondisi cuaca rute, dan audit trail pergerakan armada.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Checkpoint Posisi Baru</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kapal, lokasi selat, atau status log..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          {filteredLogs.length} Catatan Log Masuk
        </span>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            Belum ada catatan histori pelacakan kapal.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={log.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 relative overflow-hidden"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-cyan-400" />
                      {log.vesselName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {log.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.speedKnots} Knot
                    </span>
                  </div>

                  <div className="text-xs text-cyan-400 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{log.locationName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({log.lat?.toFixed(4)}, {log.lng?.toFixed(4)})
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 pt-1 leading-relaxed max-w-3xl">
                    {log.notes}
                  </p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </span>
                    <span>Pelapor: {log.reportedBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-start">
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                  title="Hapus Log"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add Log */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Catat Posisi Checkpoint Kapal Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Pilih Kapal Armada</label>
                <select
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {vessels.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} ({v.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nama Lokasi Perairan / Checkpoint</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Contoh: Selat Sunda Waypoint Zulu / Teluk Balikpapan"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Garis Lintang (Latitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Garis Bujur (Longitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Status Navigasi</label>
                  <input
                    type="text"
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="Pelayaran Normal / Menunggu Pandu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Kecepatan Kapal (Knot)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Catatan Nakhoda / Kondisi Pelayaran</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kondisi cuaca, tinggi gelombang, status permesinan..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nama Pelapor (Officer on Watch)</label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
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
                  {loading ? 'Menyimpan...' : 'Simpan Log Posisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
