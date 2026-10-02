import React, { useState } from 'react';
import { Vessel, VesselType, VesselStatus, Port } from '../types/maritime';
import {
  Ship,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  MapPin,
  Fuel,
  Users,
  Compass,
  AlertCircle
} from 'lucide-react';
import { addVessel, updateVessel, deleteVessel } from '../services/maritimeService';

interface MasterVesselsViewProps {
  vessels: Vessel[];
  ports: Port[];
  isModalOpen?: boolean;
  onCloseModal?: () => void;
}

export const MasterVesselsView: React.FC<MasterVesselsViewProps> = ({
  vessels,
  ports,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<VesselType>('container');
  const [capacityDwt, setCapacityDwt] = useState<number>(15000);
  const [capacityTeu, setCapacityTeu] = useState<number>(1200);
  const [builtYear, setBuiltYear] = useState<number>(2020);
  const [status, setStatus] = useState<VesselStatus>('docked');
  const [homeport, setHomeport] = useState('Pelabuhan Tanjung Priok');
  const [currentPort, setCurrentPort] = useState('Pelabuhan Tanjung Priok');
  const [currentLat, setCurrentLat] = useState<number>(-6.1018);
  const [currentLng, setCurrentLng] = useState<number>(106.8825);
  const [heading, setHeading] = useState<number>(0);
  const [speedKnots, setSpeedKnots] = useState<number>(0);
  const [captainName, setCaptainName] = useState('Capt. Andi Wijaya');
  const [crewCount, setCrewCount] = useState<number>(20);
  const [fuelLevelPercent, setFuelLevelPercent] = useState<number>(85);

  const openCreateModal = () => {
    setEditingVessel(null);
    setName('');
    setCode(`IMO-${Math.floor(9000000 + Math.random() * 999999)}`);
    setType('container');
    setCapacityDwt(15000);
    setCapacityTeu(1200);
    setBuiltYear(2021);
    setStatus('docked');
    setHomeport(ports[0]?.name || 'Tanjung Priok');
    setCurrentPort(ports[0]?.name || 'Tanjung Priok');
    setCurrentLat(-6.1018);
    setCurrentLng(106.8825);
    setHeading(0);
    setSpeedKnots(0);
    setCaptainName('Capt. Hendra Gunawan');
    setCrewCount(22);
    setFuelLevelPercent(80);
    setModalOpen(true);
  };

  const openEditModal = (v: Vessel) => {
    setEditingVessel(v);
    setName(v.name);
    setCode(v.code);
    setType(v.type);
    setCapacityDwt(v.capacityDwt);
    setCapacityTeu(v.capacityTeu);
    setBuiltYear(v.builtYear);
    setStatus(v.status);
    setHomeport(v.homeport);
    setCurrentPort(v.currentPort);
    setCurrentLat(v.currentLat);
    setCurrentLng(v.currentLng);
    setHeading(v.heading);
    setSpeedKnots(v.speedKnots);
    setCaptainName(v.captainName);
    setCrewCount(v.crewCount);
    setFuelLevelPercent(v.fuelLevelPercent);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Nama kapal wajib diisi');
    setLoading(true);

    try {
      const payload = {
        name,
        code,
        type,
        capacityDwt: Number(capacityDwt),
        capacityTeu: Number(capacityTeu),
        builtYear: Number(builtYear),
        status,
        homeport,
        currentPort,
        currentLat: Number(currentLat),
        currentLng: Number(currentLng),
        heading: Number(heading),
        speedKnots: Number(speedKnots),
        captainName,
        crewCount: Number(crewCount),
        fuelLevelPercent: Number(fuelLevelPercent),
      };

      if (editingVessel) {
        await updateVessel(editingVessel.id, payload);
      } else {
        await addVessel(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan armada kapal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Yakin ingin menghapus data kapal ini dari master armada?')) {
      try {
        await deleteVessel(id);
      } catch (err) {
        console.error(err);
        alert('Gagal menghapus');
      }
    }
  };

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.currentPort.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || v.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Master Data Armada Kapal (Fleet Management)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Database kapal laut milik perusahaan: spesifikasi teknis, sertifikasi IMO, kapasitas muat, dan kesiapan operasional.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kapal Baru</span>
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
            placeholder="Cari nama kapal, IMO, nakhoda, posisi..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Jenis Kapal:
          </span>
          {[
            { id: 'all', label: 'Semua Jenis' },
            { id: 'container', label: 'Kontainer' },
            { id: 'tanker', label: 'Tanker Curah Cair' },
            { id: 'bulk', label: 'Bulk Carrier' },
            { id: 'roro', label: 'Ro-Ro' },
            { id: 'tug_barge', label: 'Tug & Barge' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-all ${
                typeFilter === t.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vessels Table Grid */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Nama Kapal & IMO</th>
                <th className="py-3.5 px-4">Jenis & Tahun</th>
                <th className="py-3.5 px-4">Kapasitas (DWT / TEU)</th>
                <th className="py-3.5 px-4">Status & Kecepatan</th>
                <th className="py-3.5 px-4">Posisi Terkini</th>
                <th className="py-3.5 px-4">Nakhoda & ABK</th>
                <th className="py-3.5 px-4">BBM (%)</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredVessels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data armada kapal.
                  </td>
                </tr>
              ) : (
                filteredVessels.map((v) => {
                  const statusBadgeColor = {
                    sailing: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    docked: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                    loading: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
                    maintenance: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                    standby: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                  }[v.status] || 'bg-slate-800 text-slate-400';

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-cyan-400" />
                          {v.name}
                        </div>
                        <div className="font-mono text-cyan-400 text-[11px] mt-0.5">{v.code}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="capitalize text-slate-200 font-medium">{v.type.replace('_', ' ')}</div>
                        <div className="text-[11px] text-slate-500">Thn {v.builtYear}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{v.capacityDwt.toLocaleString()} DWT</div>
                        {v.capacityTeu > 0 && (
                          <div className="text-[11px] text-cyan-400">{v.capacityTeu} TEUs</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadgeColor}`}>
                          {v.status.toUpperCase()}
                        </span>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {v.speedKnots} Knot
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{v.currentPort}</div>
                        <div className="text-[10px] text-slate-500">Home: {v.homeport}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 font-medium">{v.captainName}</div>
                        <div className="text-[11px] text-slate-400">{v.crewCount} Awak Kapal</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-white">{v.fuelLevelPercent}%</span>
                        </div>
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                          <div
                            className={`h-full ${
                              v.fuelLevelPercent < 30 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${v.fuelLevelPercent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(v)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Data Kapal"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id)}
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

      {/* Modal Add / Edit Vessel */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {editingVessel ? 'Perbarui Data Armada Kapal' : 'Tambah Kapal Laut Baru ke Master Armada'}
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
                  <label className="block text-slate-300 font-medium mb-1">Nama Kapal (Vessel Name)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: KM Samudera Raya 05"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kode IMO / Callsign</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="IMO-9812345"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Jenis Kapal (Vessel Type)</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as VesselType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="container">Kapal Kontainer (Container Ship)</option>
                    <option value="tanker">Kapal Tanker (Liquid Bulk / CPO / BBM)</option>
                    <option value="bulk">Curah Kering (Bulk Carrier / Ore / Nikel)</option>
                    <option value="roro">Kapal Ro-Ro (Roll-on/Roll-off Kendaraan)</option>
                    <option value="tug_barge">Tugboat & Tongkang (Tug & Barge)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Operasional</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VesselStatus)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="sailing">Sedang Berlayar (Sailing)</option>
                    <option value="docked">Sandar di Pelabuhan (Docked)</option>
                    <option value="loading">Proses Muat / Bongkar (Loading/Unloading)</option>
                    <option value="maintenance">Perawatan Galangan (Maintenance)</option>
                    <option value="standby">Siaga (Standby)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kapasitas Deadweight (DWT)</label>
                  <input
                    type="number"
                    value={capacityDwt}
                    onChange={(e) => setCapacityDwt(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kapasitas Muat TEU (Bila Ada)</label>
                  <input
                    type="number"
                    value={capacityTeu}
                    onChange={(e) => setCapacityTeu(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tahun Pembuatan Kapal</label>
                  <input
                    type="number"
                    value={builtYear}
                    onChange={(e) => setBuiltYear(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pelabuhan Pangkalan (Homeport)</label>
                  <input
                    type="text"
                    value={homeport}
                    onChange={(e) => setHomeport(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Posisi / Pelabuhan Saat Ini</label>
                  <input
                    type="text"
                    value={currentPort}
                    onChange={(e) => setCurrentPort(e.target.value)}
                    placeholder="Contoh: Selat Makassar / Pelabuhan Priok"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kecepatan Terkini (Knot)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={speedKnots}
                    onChange={(e) => setSpeedKnots(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nama Nakhoda (Master/Captain)</label>
                  <input
                    type="text"
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Jumlah Awak Kapal (ABK)</label>
                  <input
                    type="number"
                    value={crewCount}
                    onChange={(e) => setCrewCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Kapasitas Sisa BBM (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={fuelLevelPercent}
                    onChange={(e) => setFuelLevelPercent(Number(e.target.value))}
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
                  {loading ? 'Menyimpan...' : 'Simpan Armada Kapal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
