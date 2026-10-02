import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Bell,
  LogOut,
  Radio,
  Clock,
  Shield,
  User,
  Check,
  AlertTriangle,
  Info,
  X,
  Database
} from 'lucide-react';
import { AppNotification } from '../types/maritime';
import { markNotificationAsRead } from '../services/maritimeService';

interface NavbarProps {
  notifications: AppNotification[];
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({ notifications }) => {
  const { profile, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Realtime Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Ship className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">SAMUDERA LOGISTICS</span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Real-Time Cloud
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block">
              Sistem Angkutan Laut & Manajemen Kargo Maritim
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Sync status, Notifications, User info, Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Instant Sync Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>Sinkronisasi Otomatis Tanpa Reload</span>
        </div>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-colors"
            title="Pemberitahuan Otomatis"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Notifikasi & Peringatan Kapal</span>
                </div>
                <button
                  onClick={() => setShowNotifs(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs transition-colors ${
                        notif.isRead ? 'bg-slate-900 text-slate-400' : 'bg-slate-800/40 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          {notif.type === 'danger' || notif.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-semibold text-slate-200">{notif.title}</div>
                            <p className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              {new Date(notif.timestamp).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleRead(notif.id)}
                            className="p-1 rounded hover:bg-slate-700 text-cyan-400"
                            title="Tandai sudah dibaca"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold text-xs">
            {profile?.displayName?.[0] || 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
              {profile?.displayName || 'Pengguna'}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium capitalize">
              <Shield className="w-3 h-3" />
              <span>{profile?.role || 'Staf Ops'}</span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 ml-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Keluar dari Akun"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
