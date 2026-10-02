import React, { useState } from 'react';
import {
  Vessel,
  Shipment,
  TrackingLog,
  OperationalExpense,
  Port,
} from '../types/maritime';
import {
  Ship,
  Navigation,
  Anchor,
  TrendingUp,
  DollarSign,
  Fuel,
  Users,
  Compass,
  ArrowUpRight,
  Layers,
  MapPin,
  Clock,
  Radio,
  FileText,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  vessels: Vessel[];
  shipments: Shipment[];
  trackingLogs: TrackingLog[];
  expenses: OperationalExpense[];
  ports: Port[];
  onNavigate: (tab: any) => void;
  onOpenShipmentModal: () => void;
  onOpenVesselModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vessels,
  shipments,
  trackingLogs,
  expenses,
  ports,
  onNavigate,
  onOpenShipmentModal,
  onOpenVesselModal,
}) => {
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);

  // Analytics Calculations
  const sailingCount = vessels.filter((v) => v.status === 'sailing').length;
  const dockedCount = vessels.filter((v) => v.status === 'docked' || v.status === 'loading').length;
  const maintenanceCount = vessels.filter((v) => v.status === 'maintenance').length;

  const activeShipments = shipments.filter((s) => s.status === 'in_transit' || s.status === 'loading');
  const totalTeu = shipments.reduce((sum, s) => sum + (s.cargoVolumeTeu || 0), 0);
  const totalTon = shipments.reduce((sum, s) => sum + (s.cargoWeightTon || 0), 0);

  const totalRevenue = shipments.reduce((sum, s) => sum + (s.freightChargeRp || 0), 0);
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + (e.amountRp || 0), 0);
  const netMargin = totalRevenue - totalExpenseAmount;
  const marginPercentage = totalRevenue > 0 ? ((netMargin / totalRevenue) * 100).toFixed(1) : '0';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dashboard Operasional Kapal & Kargo Laut
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau pergerakan armada, jadwal tol laut, volume muatan, dan kesehatan finansial pelayaran secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenShipmentModal}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Buat B/L Baru</span>
          </button>
          <button
            onClick={onOpenVesselModal}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <Ship className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Tambah Kapal</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Armada Berlayar / Total</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{sailingCount}</span>
            <span className="text-xs text-slate-400">/ {vessels.length} Kapal Aktif</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {sailingCount} Layar
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> {dockedCount} Sandar
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> {maintenanceCount} Dock
            </span>
          </div>
        </div>

        {/* Cargo Volume Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Volume Kargo Muatan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{totalTeu.toLocaleString('id-ID')}</span>
            <span className="text-xs text-cyan-400 font-semibold">TEUs</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Curah / Liquid:</span>
            <span className="font-semibold text-slate-200">{totalTon.toLocaleString('id-ID')} Ton</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Freight Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-emerald-400">{formatRupiah(totalRevenue)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>{shipments.length} Bill of Lading aktif</span>
            <span className="text-emerald-400 font-medium">100% Realtime</span>
          </div>
        </div>

        {/* Operational Expense & Margin Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Biaya Operasional & Margin</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-white">{formatRupiah(netMargin)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Biaya: {formatRupiah(totalExpenseAmount)}</span>
            <span className="text-cyan-400 font-semibold">{marginPercentage}% Net</span>
          </div>
        </div>
      </div>

      {/* Maritime Visual Sea Radar & Route Map */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Peta Radar & Alur Pelayaran Nusantara (Live AIS)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Posisi koordinat armada di koridor Tol Laut, Selat Malaka, Laut Jawa, dan Selat Makassar
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              Sinyal Transponder Kapal Aktif
            </span>
          </div>
        </div>

        {/* Stylized Visual Chart */}
        <div className="relative bg-slate-950 p-6 min-h-[380px] overflow-hidden flex flex-col justify-between">
          {/* Subtle Grid and Nautical Rings */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-cyan-500/10 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-cyan-500/15 pointer-events-none"></div>

          {/* Interactive Sea Lanes & Waypoints */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            {/* Top corridor: Belawan - Jakarta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ports.map((port) => (
                <div
                  key={port.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <Anchor className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{port.name}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{port.code} • {port.city}</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {port.activeDocks} Dermaga
                    </span>
                  </div>

                  {/* Ships currently at/near this port */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1">
                    {vessels
                      .filter((v) => v.currentPort.toLowerCase().includes(port.name.toLowerCase().split(' ')[1] || 'xyz') || v.homeport.includes(port.city))
                      .slice(0, 2)
                      .map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVessel(v)}
                          className="w-full text-left flex items-center justify-between text-[11px] p-1.5 rounded bg-slate-950/60 hover:bg-slate-800 text-slate-300 transition-colors"
                        >
                          <span className="flex items-center gap-1.5 font-medium truncate max-w-[140px]">
                            <Ship className="w-3 h-3 text-cyan-400 shrink-0" />
                            {v.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {v.speedKnots > 0 ? `${v.speedKnots} kts` : 'Sandar'}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Radar Coordinates Panel */}
            <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Navigation className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Alur Pelayaran Terpadu (ALKI II & III)</div>
                  <div className="text-[11px] text-slate-400">
                    Semua koordinat kapal dipantau real-time dengan update otomatis saat transponder mengirim ping AIS.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">KECEPATAN RATA-RATA</span>
                  <span className="text-cyan-400 font-bold">14.8 Knot</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">ON-TIME RATE</span>
                  <span className="text-emerald-400 font-bold">96.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Live Status Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Status Operasional Armada Kapal</h2>
            <p className="text-xs text-slate-400">Daftar kapal aktif, nakhoda, posisi terakhir, dan kondisi bahan bakar</p>
          </div>
          <button
            onClick={() => onNavigate('vessels')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>Buka Master Armada</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vessels.map((vessel) => {
            const statusColor =
              vessel.status === 'sailing'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : vessel.status === 'loading'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : vessel.status === 'docked'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            const statusText = {
              sailing: 'Sedang Berlayar',
              docked: 'Sandar di Pelabuhan',
              loading: 'Proses Muat / Bongkar',
              maintenance: 'Perawatan Galangan (Docking)',
              standby: 'Siaga di Pangkalan',
            }[vessel.status] || vessel.status;

            return (
              <div
                key={vessel.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-white">{vessel.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <span className="font-mono text-cyan-400">{vessel.code}</span>
                        <span>•</span>
                        <span className="capitalize">{vessel.type}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor}`}>
                      {statusText}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> Posisi Terakhir
                      </span>
                      <span className="font-medium text-slate-200 truncate max-w-[150px]">
                        {vessel.currentPort}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" /> Nakhoda & Kru
                      </span>
                      <span className="font-medium text-slate-200">
                        {vessel.captainName} ({vessel.crewCount} ABK)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-slate-500" /> Kecepatan AIS
                      </span>
                      <span className="font-mono text-cyan-400 font-semibold">
                        {vessel.speedKnots} Knot
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fuel Level Bar */}
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Fuel className="w-3 h-3 text-amber-400" /> Kapasitas Bunker BBM
                    </span>
                    <span className="font-bold text-slate-200">{vessel.fuelLevelPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        vessel.fuelLevelPercent < 30
                          ? 'bg-rose-500'
                          : vessel.fuelLevelPercent < 60
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${vessel.fuelLevelPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Live Cargo Shipments & Recent Tracking Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Shipments */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Pengapalan Kargo Berjalan (Active B/L)</h3>
            </div>
            <button
              onClick={() => onNavigate('shipments')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Lihat Semua ({shipments.length})
            </button>
          </div>

          <div className="space-y-3">
            {shipments.slice(0, 4).map((shipment) => (
              <div
                key={shipment.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-cyan-400 font-bold">{shipment.blNumber}</div>
                    <div className="text-white font-medium mt-0.5">{shipment.clientName}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      shipment.status === 'delivered'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : shipment.status === 'in_transit'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {shipment.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 text-[11px]">
                  <span>Kapal: <strong className="text-slate-200">{shipment.vesselName}</strong></span>
                  <span>Rute: <strong className="text-slate-200">{shipment.originPort} → {shipment.destinationPort}</strong></span>
                  <span>Muatan: <strong className="text-slate-200">{shipment.cargoType}</strong></span>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Ongkos Angkut: <strong className="text-emerald-400">{formatRupiah(shipment.freightChargeRp)}</strong></span>
                  <span className="text-slate-500">ETA: {shipment.etaDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Tracking Audit Trail */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Histori Pelacakan Terkini</h3>
            </div>
            <button
              onClick={() => onNavigate('tracking')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Log Lengkap
            </button>
          </div>

          <div className="space-y-3">
            {trackingLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-cyan-400" />
                    {log.vesselName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-cyan-300 font-medium text-[11px]">
                  {log.locationName}
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {log.notes}
                </p>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span>Pelapor: {log.reportedBy}</span>
                  <span>{log.speedKnots} Knot</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vessel Detail Quick Modal */}
      {selectedVessel && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedVessel.name}</h3>
                <p className="text-xs text-cyan-400 font-mono">{selectedVessel.code}</p>
              </div>
              <button
                onClick={() => setSelectedVessel(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block">Jenis Kapal:</span>
                <span className="text-white font-medium capitalize">{selectedVessel.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Kapasitas DWT:</span>
                <span className="text-white font-medium">{selectedVessel.capacityDwt.toLocaleString()} DWT</span>
              </div>
              <div>
                <span className="text-slate-400 block">Kapasitas TEU:</span>
                <span className="text-white font-medium">{selectedVessel.capacityTeu} TEUs</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tahun Buat:</span>
                <span className="text-white font-medium">{selectedVessel.builtYear}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pelabuhan Pangkalan:</span>
                <span className="text-white font-medium">{selectedVessel.homeport}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nakhoda:</span>
                <span className="text-white font-medium">{selectedVessel.captainName}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedVessel(null)}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
