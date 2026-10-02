import React, { useState } from 'react';
import { Shipment, OperationalExpense, Vessel } from '../types/maritime';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  DollarSign,
  Ship,
  Layers,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface ReportsViewProps {
  shipments: Shipment[];
  expenses: OperationalExpense[];
  vessels: Vessel[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  shipments,
  expenses,
  vessels,
}) => {
  const [reportType, setReportType] = useState<'cargo' | 'finance' | 'fleet'>('finance');
  const [selectedVessel, setSelectedVessel] = useState<string>('all');

  const filteredShipments = shipments.filter(
    (s) => selectedVessel === 'all' || s.vesselName === selectedVessel
  );

  const filteredExpenses = expenses.filter(
    (e) => selectedVessel === 'all' || e.vesselName === selectedVessel
  );

  const totalRevenue = filteredShipments.reduce((sum, s) => sum + (s.freightChargeRp || 0), 0);
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (e.amountRp || 0), 0);
  const netProfit = totalRevenue - totalExpense;
  const totalTeu = filteredShipments.reduce((sum, s) => sum + (s.cargoVolumeTeu || 0), 0);
  const totalTon = filteredShipments.reduce((sum, s) => sum + (s.cargoWeightTon || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'finance') {
      csvContent += 'Tipe,Referensi / Kapal,Uraian,Pemasukan (Rp),Pengeluaran (Rp)\n';
      filteredShipments.forEach((s) => {
        csvContent += `Pemasukan B/L,"${s.blNumber} - ${s.vesselName}","${s.clientName} (${s.cargoType})",${s.freightChargeRp},0\n`;
      });
      filteredExpenses.forEach((e) => {
        csvContent += `Beban Operasional,"${e.vesselName}","${e.description}",0,${e.amountRp}\n`;
      });
    } else if (reportType === 'cargo') {
      csvContent += 'No B/L,Shipper,Kapal,Rute Asal,Rute Tujuan,Jenis Muatan,TEU,Ton,Status,Tarif (Rp)\n';
      filteredShipments.forEach((s) => {
        csvContent += `"${s.blNumber}","${s.clientName}","${s.vesselName}","${s.originPort}","${s.destinationPort}","${s.cargoType}",${s.cargoVolumeTeu},${s.cargoWeightTon},"${s.status}",${s.freightChargeRp}\n`;
      });
    } else {
      csvContent += 'Nama Kapal,IMO,Jenis,Status,Kapasitas DWT,Kapasitas TEU,Nakhoda,Sisa BBM (%)\n';
      vessels.forEach((v) => {
        csvContent += `"${v.name}","${v.code}","${v.type}","${v.status}",${v.capacityDwt},${v.capacityTeu},"${v.captainName}",${v.fuelLevelPercent}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Maritim_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Laporan Operasional & Analisis Finansial Maritim
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rekapitulasi berkala pendapatan freight, realisasi kargo angkutan, biaya pelayaran, dan produktivitas kapal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Report Type & Vessel Selector */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Jenis Laporan:
          </span>
          {[
            { id: 'finance', label: 'Keuangan & Laba Rugi' },
            { id: 'cargo', label: 'Realisasi Kargo B/L' },
            { id: 'fleet', label: 'Utilisasi Armada Kapal' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                reportType === r.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs text-slate-400 shrink-0">Filter Kapal:</label>
          <select
            value={selectedVessel}
            onChange={(e) => setSelectedVessel(e.target.value)}
            className="w-full md:w-56 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
          >
            <option value="all">Semua Armada Kapal</option>
            {vessels.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Pendapatan Navigasi (Freight)</span>
          <div className="text-xl font-bold text-emerald-400 mt-1">{formatRupiah(totalRevenue)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Dari {filteredShipments.length} muatan B/L</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Total Pengeluaran Operasional</span>
          <div className="text-xl font-bold text-rose-400 mt-1">{formatRupiah(totalExpense)}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">BBM, Pelindo, ABK, Docking</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Laba Bersih Operasional (Net Margin)</span>
          <div className="text-xl font-bold text-white mt-1">{formatRupiah(netProfit)}</div>
          <span className="text-[11px] text-cyan-400 mt-1 block font-semibold">
            {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}% Margin Bersih
          </span>
        </div>
      </div>

      {/* Data Table according to report type */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg p-5">
        <h3 className="text-sm font-bold text-white mb-3">
          {reportType === 'finance'
            ? 'Rincian Arus Kas & Analisis Beban Operasional Kapal'
            : reportType === 'cargo'
            ? 'Rincian Pengapalan & Manifes Muatan B/L'
            : 'Ringkasan Kesiapan & Efisiensi Armada Kapal'}
        </h3>

        {reportType === 'finance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Tipe Transaksi</th>
                  <th className="py-2.5 px-3">Armada Kapal</th>
                  <th className="py-2.5 px-3">Keterangan / Pelanggan</th>
                  <th className="py-2.5 px-3 text-right">Pemasukan Freight</th>
                  <th className="py-2.5 px-3 text-right">Beban Operasional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        Freight B/L
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{s.vesselName}</td>
                    <td className="py-2.5 px-3">{s.clientName} - {s.cargoType}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      {formatRupiah(s.freightChargeRp)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">-</td>
                  </tr>
                ))}
                {filteredExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium capitalize">
                        {e.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white">{e.vesselName}</td>
                    <td className="py-2.5 px-3">{e.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">-</td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                      {formatRupiah(e.amountRp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'cargo' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">No. B/L</th>
                  <th className="py-2.5 px-3">Shipper / Mitra</th>
                  <th className="py-2.5 px-3">Kapal Pengangkut</th>
                  <th className="py-2.5 px-3">Rute Pelayaran</th>
                  <th className="py-2.5 px-3">Kargo & Volume</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Nilai Freight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-cyan-400 font-bold">{s.blNumber}</td>
                    <td className="py-2.5 px-3 text-white font-medium">{s.clientName}</td>
                    <td className="py-2.5 px-3">{s.vesselName}</td>
                    <td className="py-2.5 px-3">{s.originPort} → {s.destinationPort}</td>
                    <td className="py-2.5 px-3">
                      {s.cargoType} ({s.cargoVolumeTeu} TEU / {s.cargoWeightTon} Ton)
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-cyan-300">{s.status}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      {formatRupiah(s.freightChargeRp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'fleet' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Kapal</th>
                  <th className="py-2.5 px-3">Kode IMO</th>
                  <th className="py-2.5 px-3">Jenis Kapal</th>
                  <th className="py-2.5 px-3">Kapasitas (DWT)</th>
                  <th className="py-2.5 px-3">Posisi Terkini</th>
                  <th className="py-2.5 px-3">Kecepatan</th>
                  <th className="py-2.5 px-3">Kondisi BBM</th>
                  <th className="py-2.5 px-3">Status Operasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {vessels.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-white">{v.name}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{v.code}</td>
                    <td className="py-2.5 px-3 capitalize">{v.type.replace('_', ' ')}</td>
                    <td className="py-2.5 px-3">{v.capacityDwt.toLocaleString()} DWT</td>
                    <td className="py-2.5 px-3">{v.currentPort}</td>
                    <td className="py-2.5 px-3 font-mono">{v.speedKnots} kts</td>
                    <td className="py-2.5 px-3 font-bold">{v.fuelLevelPercent}%</td>
                    <td className="py-2.5 px-3 uppercase font-semibold text-[10px] text-cyan-300">
                      {v.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
