import React from 'react';
import {
  LayoutDashboard,
  Ship,
  Anchor,
  Users,
  Compass,
  FileText,
  Navigation,
  DollarSign,
  BarChart3,
  Waves
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'shipments'
  | 'tracking'
  | 'vessels'
  | 'ports'
  | 'clients'
  | 'routes'
  | 'expenses'
  | 'reports';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  vesselsCount: number;
  shipmentsCount: number;
}

interface MenuItem {
  id: NavTab;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  count?: number;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  vesselsCount,
  shipmentsCount,
}) => {
  const menuItems: MenuGroup[] = [
    {
      group: 'Utama & Analitik',
      items: [
        {
          id: 'dashboard' as NavTab,
          label: 'Dashboard & Radar',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        },
        {
          id: 'reports' as NavTab,
          label: 'Laporan Operasional',
          icon: BarChart3,
        },
      ],
    },
    {
      group: 'Transaksi Pelayaran',
      items: [
        {
          id: 'shipments' as NavTab,
          label: 'Kargo & Bill of Lading (B/L)',
          icon: FileText,
          count: shipmentsCount,
        },
        {
          id: 'tracking' as NavTab,
          label: 'Histori Pelacakan & Log',
          icon: Navigation,
        },
        {
          id: 'expenses' as NavTab,
          label: 'Biaya Operasional Kapal',
          icon: DollarSign,
        },
      ],
    },
    {
      group: 'Master Data Maritim',
      items: [
        {
          id: 'vessels' as NavTab,
          label: 'Master Armada Kapal',
          icon: Ship,
          count: vesselsCount,
        },
        {
          id: 'ports' as NavTab,
          label: 'Master Pelabuhan',
          icon: Anchor,
        },
        {
          id: 'clients' as NavTab,
          label: 'Master Shipper / Klien',
          icon: Users,
        },
        {
          id: 'routes' as NavTab,
          label: 'Master Rute & Tarif',
          icon: Compass,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-full">
      <div className="p-4 space-y-6 overflow-y-auto">
        {menuItems.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/40 text-cyan-300 border border-cyan-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fleet quick status footer */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-[11px] mb-1">
          <Waves className="w-3.5 h-3.5" />
          <span>Info Alur Laut</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Pemantauan AIS & koordinat navigasi perairan Nusantara aktif 24/7.
        </p>
      </div>
    </aside>
  );
};
