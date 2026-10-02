import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Anchor,
  Compass,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Radio,
  ArrowRight,
  Sparkles,
  Waves,
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginDemo } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'operator'>('admin');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Nama lengkap wajib diisi');
        await registerWithEmail(email, password, name, role);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan otentikasi. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demoRole: 'admin' | 'operator') => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginDemo(demoRole);
    } catch (err: any) {
      setErrorMsg('Gagal masuk demo: ' + (err.message || 'Silakan coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg('Gagal login Google: ' + (err.message || 'Popup dibatalkan.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Sea & Grid Backdrop */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Decorative Ocean Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-4xl grid md:grid-cols-12 gap-0 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl">
        
        {/* Left Maritime Brand Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>Realtime Marine System Online</span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Ship className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">SAMUDERA LOG</h1>
                  <p className="text-xs text-cyan-300 font-medium tracking-wider uppercase">Maritime Fleet & Cargo OS</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                Platform terpadu angkutan laut nasional: Master armada kapal, pelacakan rute kargo bill of lading real-time, dan analitik performa logistik maritim.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Terhubung Real Database Firebase (No-Reload Sync)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Pelacakan Alur Laut & Waypoint Selat Nusantara</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Otomatisasi Peringatan Cuaca & Status Kargo B/L</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Firestore Cloud
            </span>
            <span className="flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-blue-400" /> ALKI I, II & III
            </span>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="md:col-span-7 p-8 bg-slate-900/95 flex flex-col justify-center">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isRegister ? 'Pendaftaran Akun Baru' : 'Masuk ke Portal Operasional'}
              </h2>
              <span className="text-xs text-cyan-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Portal Aman
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isRegister
                ? 'Lengkapi identitas untuk mendaftarkan akun operator atau admin'
                : 'Silakan masuk dengan email dan password untuk mengakses sistem'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Logins for Fast Verification */}
          <div className="mb-5 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Akses Cepat Pengujian (1-Klik):</span>
              <span className="text-cyan-400 font-mono text-[10px]">Semua Pengguna Bisa Masuk</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-sky-950/70 hover:bg-sky-900/90 border border-sky-600/40 text-sky-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Masuk Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('operator')}
                disabled={loading}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600/50 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Anchor className="w-3.5 h-3.5 text-blue-400" />
                <span>Masuk Staf Ops</span>
              </button>
            </div>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-medium">atau masuk akun manual</span>
            </div>
          </div>

          {/* Form Credentials */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap & Gelar</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Capt. Adi Nugroho / Rina Sari"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@samudera-log.com atau email Anda"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Peran Akses</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      role === 'admin'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Administrator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      role === 'operator'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Staf Operasional
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegister ? 'Daftar Akun & Masuk' : 'Masuk ke Aplikasi'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mt-3 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>

          {/* Toggle Register / Login */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg(null);
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              {isRegister
                ? 'Sudah punya akun? Masuk di sini'
                : 'Belum punya akun? Buat akun baru di sini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
