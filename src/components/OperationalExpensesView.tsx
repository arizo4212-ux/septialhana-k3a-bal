import React, { useState } from 'react';
import { OperationalExpense, ExpenseCategory, Vessel } from '../types/maritime';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Fuel,
  Anchor,
  Users,
  Wrench,
  Package,
  ShieldCheck
} from 'lucide-react';
import { addExpense, updateExpense, deleteExpense } from '../services/maritimeService';

interface OperationalExpensesViewProps {
  expenses: OperationalExpense[];
  vessels: Vessel[];
}

export const OperationalExpensesView: React.FC<OperationalExpensesViewProps> = ({
  expenses,
  vessels,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<OperationalExpense | null>(null);
  const [loading, setLoading] = useState(false);

  const [vesselName, setVesselName] = useState(vessels[0]?.name || 'KM Nusantara Samudera 01');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('fuel');
  const [description, setDescription] = useState('');
  const [amountRp, setAmountRp] = useState<number>(25000000);
  const [receiptRef, setReceiptRef] = useState('');

  const openCreateModal = () => {
    setEditingExpense(null);
    setVesselName(vessels[0]?.name || 'KM Nusantara Samudera 01');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setCategory('fuel');
    setDescription('Pengisian Bahan Bakar MFO / HSD');
    setAmountRp(45000000);
    setReceiptRef(`INV-OPS/${Math.floor(1000 + Math.random() * 9000)}`);
    setModalOpen(true);
  };

  const openEditModal = (exp: OperationalExpense) => {
    setEditingExpense(exp);
    setVesselName(exp.vesselName);
    setExpenseDate(exp.expenseDate);
    setCategory(exp.category);
    setDescription(exp.description);
    setAmountRp(exp.amountRp);
    setReceiptRef(exp.receiptRef);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return alert('Deskripsi pengeluaran wajib diisi');
    setLoading(true);
    try {
      const selectedV = vessels.find((v) => v.name === vesselName);
      const payload = {
        vesselId: selectedV?.id,
        vesselName,
        expenseDate,
        category,
        description,
        amountRp: Number(amountRp),
        receiptRef,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await addExpense(payload);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan biaya operasional');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus catatan pengeluaran biaya ini?')) {
      try {
        await deleteExpense(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.receiptRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + (e.amountRp || 0), 0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCategoryInfo = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'fuel':
        return { label: 'Bahan Bakar (Bunker)', icon: Fuel, color: 'text-amber-400' };
      case 'port_dues':
        return { label: 'Jasa Pelabuhan & Pandu', icon: Anchor, color: 'text-sky-400' };
      case 'crew_payroll':
        return { label: 'Gaji & Premi ABK', icon: Users, color: 'text-indigo-400' };
      case 'maintenance':
        return { label: 'Maintenance & Docking', icon: Wrench, color: 'text-rose-400' };
      case 'provisions':
        return { label: 'Perbekalan & Ransum', icon: Package, color: 'text-emerald-400' };
      case 'insurance':
        return { label: 'Asuransi Laut & P&I', icon: ShieldCheck, color: 'text-purple-400' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Biaya Operasional Kapal & Pengeluaran Pelayaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pencatatan biaya bunker BBM, jasa labuh pandu Pelindo, premi layar awak kapal, docking, dan logistik perbekalan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Biaya Baru</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400">Total Pengeluaran Terfilter:</span>
          <div className="text-2xl font-bold text-rose-400 mt-0.5">{formatRupiah(totalExpense)}</div>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          {filteredExpenses.length} Transaksi Biaya
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kapal, deskripsi, no invoice..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'fuel', label: 'Bahan Bakar' },
            { id: 'port_dues', label: 'Jasa Port' },
            { id: 'crew_payroll', label: 'Gaji ABK' },
            { id: 'maintenance', label: 'Maintenance' },
            { id: 'provisions', label: 'Perbekalan' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-all ${
                categoryFilter === c.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Tanggal & Kapal</th>
                <th className="py-3.5 px-4">Kategori Biaya</th>
                <th className="py-3.5 px-4">Uraian / Deskripsi Pengeluaran</th>
                <th className="py-3.5 px-4">No. Bukti / Invoice</th>
                <th className="py-3.5 px-4 text-right">Jumlah (Rupiah)</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ditemukan data pengeluaran operasional.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const catInfo = getCategoryInfo(exp.category);
                  const Icon = catInfo.icon;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="text-white font-bold">{exp.vesselName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{exp.expenseDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-950 border border-slate-800">
                          <Icon className={`w-3.5 h-3.5 ${catInfo.color}`} />
                          <span className="text-slate-200">{catInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-200 font-medium max-w-sm">
                        {exp.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-cyan-400 text-[11px]">
                        {exp.receiptRef || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                        {formatRupiah(exp.amountRp)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
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

      {/* Modal Add / Edit Expense */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              {editingExpense ? 'Edit Pengeluaran Operasional' : 'Catat Biaya Operasional Kapal Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Armada Kapal</label>
                <select
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                >
                  {vessels.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Kategori Biaya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="fuel">Bahan Bakar Minyak (Bunker MFO/HSD)</option>
                    <option value="port_dues">Jasa Labuh, Pandu & Tunda Pelabuhan</option>
                    <option value="crew_payroll">Gaji, Premi & Konsumsi ABK</option>
                    <option value="maintenance">Suku Cadang & Docking Perbaikan</option>
                    <option value="provisions">Perbekalan Air Tawar & Ransum</option>
                    <option value="insurance">Asuransi Kapal & Muatan (P&I)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Rincian Pengeluaran</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Bunkering 30.000 liter Solar di Dermaga Priok"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Nominal Biaya (Rp)</label>
                  <input
                    type="number"
                    required
                    value={amountRp}
                    onChange={(e) => setAmountRp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">No. Bukti / Invoice</label>
                  <input
                    type="text"
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    placeholder="INV-..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
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
                  {loading ? 'Menyimpan...' : 'Simpan Biaya'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
