/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ShipmentsView } from './components/ShipmentsView';
import { MasterVesselsView } from './components/MasterVesselsView';
import { MasterPortsView } from './components/MasterPortsView';
import { MasterClientsView } from './components/MasterClientsView';
import { MasterRoutesView } from './components/MasterRoutesView';
import { TrackingLogsView } from './components/TrackingLogsView';
import { OperationalExpensesView } from './components/OperationalExpensesView';
import { ReportsView } from './components/ReportsView';
import { testFirestoreConnection } from './lib/firebase';
import {
  subscribeVessels,
  subscribePorts,
  subscribeClients,
  subscribeRoutes,
  subscribeShipments,
  subscribeTrackingLogs,
  subscribeExpenses,
  subscribeNotifications,
} from './services/maritimeService';
import {
  Vessel,
  Port,
  Client,
  RouteItem,
  Shipment,
  TrackingLog,
  OperationalExpense,
  AppNotification,
} from './types/maritime';
import { Ship, Radio, Menu, X } from 'lucide-react';

const MaritimeApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real-time Database State (Instant Zero-Reload Synced via Firestore onSnapshot)
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trackingLogs, setTrackingLogs] = useState<TrackingLog[]>([]);
  const [expenses, setExpenses] = useState<OperationalExpense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Verify connection once on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Real-time Listeners attached when authenticated
  useEffect(() => {
    if (!user) return;

    const unsubVessels = subscribeVessels(setVessels);
    const unsubPorts = subscribePorts(setPorts);
    const unsubClients = subscribeClients(setClients);
    const unsubRoutes = subscribeRoutes(setRoutes);
    const unsubShipments = subscribeShipments(setShipments);
    const unsubTracking = subscribeTrackingLogs(setTrackingLogs);
    const unsubExpenses = subscribeExpenses(setExpenses);
    const unsubNotifs = subscribeNotifications(setNotifications);

    return () => {
      unsubVessels();
      unsubPorts();
      unsubClients();
      unsubRoutes();
      unsubShipments();
      unsubTracking();
      unsubExpenses();
      unsubNotifs();
    };
  }, [user]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-2 rounded-2xl border border-cyan-500/30 animate-ping pointer-events-none"></div>
        </div>
        <h2 className="text-base font-bold text-white tracking-wide">
          SAMUDERA LOGISTICS SYSTEM
        </h2>
        <p className="text-xs text-cyan-400 mt-1 flex items-center gap-1.5 font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Menghubungkan ke Realtime Cloud Database...
        </p>
      </div>
    );
  }

  // Gatekeeper: Mandatory Login Screen Before Entering The App
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar notifications={notifications} activeTab={activeTab} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            vesselsCount={vessels.length}
            shipmentsCount={shipments.length}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden bg-black/80 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-900 h-full p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <Ship className="w-5 h-5 text-cyan-400" />
                    <span className="font-bold text-white text-sm">SAMUDERA LOG</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <Sidebar
                  currentTab={activeTab}
                  onSelectTab={(tab) => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  vesselsCount={vessels.length}
                  shipmentsCount={shipments.length}
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Mobile menu button bar */}
          <div className="md:hidden mb-4 flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-cyan-400"
            >
              <Menu className="w-4 h-4" />
              <span>Menu Navigasi Maritim</span>
            </button>
            <span className="text-[11px] text-slate-400 capitalize">
              Modul: <strong>{activeTab}</strong>
            </span>
          </div>

          {activeTab === 'dashboard' && (
            <DashboardView
              vessels={vessels}
              shipments={shipments}
              trackingLogs={trackingLogs}
              expenses={expenses}
              ports={ports}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenShipmentModal={() => setActiveTab('shipments')}
              onOpenVesselModal={() => setActiveTab('vessels')}
            />
          )}

          {activeTab === 'shipments' && (
            <ShipmentsView
              shipments={shipments}
              vessels={vessels}
              ports={ports}
              clients={clients}
              routes={routes}
            />
          )}

          {activeTab === 'tracking' && (
            <TrackingLogsView logs={trackingLogs} vessels={vessels} />
          )}

          {activeTab === 'vessels' && (
            <MasterVesselsView vessels={vessels} ports={ports} />
          )}

          {activeTab === 'ports' && (
            <MasterPortsView ports={ports} />
          )}

          {activeTab === 'clients' && (
            <MasterClientsView clients={clients} />
          )}

          {activeTab === 'routes' && (
            <MasterRoutesView routes={routes} ports={ports} />
          )}

          {activeTab === 'expenses' && (
            <OperationalExpensesView expenses={expenses} vessels={vessels} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              shipments={shipments}
              expenses={expenses}
              vessels={vessels}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MaritimeApp />
    </AuthProvider>
  );
}
