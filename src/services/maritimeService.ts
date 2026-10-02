import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';
import {
  Vessel,
  Port,
  Client,
  RouteItem,
  Shipment,
  TrackingLog,
  OperationalExpense,
  AppNotification,
} from '../types/maritime';

// Real-time Subscriptions
export function subscribeVessels(
  callback: (vessels: Vessel[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'vessels';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: Vessel[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Vessel, 'id'>),
      }));
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribePorts(
  callback: (ports: Port[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'ports';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: Port[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Port, 'id'>),
      }));
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeClients(
  callback: (clients: Client[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'clients';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: Client[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Client, 'id'>),
      }));
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeRoutes(
  callback: (routes: RouteItem[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'routes';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: RouteItem[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<RouteItem, 'id'>),
      }));
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeShipments(
  callback: (shipments: Shipment[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'shipments';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: Shipment[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Shipment, 'id'>),
      }));
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeTrackingLogs(
  callback: (logs: TrackingLog[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'tracking_logs';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: TrackingLog[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<TrackingLog, 'id'>),
      }));
      // Sort newest first
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeExpenses(
  callback: (expenses: OperationalExpense[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'operational_expenses';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: OperationalExpense[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<OperationalExpense, 'id'>),
      }));
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeNotifications(
  callback: (notifications: AppNotification[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'notifications';
  const q = collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const data: AppNotification[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<AppNotification, 'id'>),
      }));
      data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(data);
    },
    (err) => {
      onError?.(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// ================= CRUD: VESSELS =================
export async function addVessel(vessel: Omit<Vessel, 'id'>): Promise<string> {
  const path = 'vessels';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...vessel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateVessel(id: string, updates: Partial<Vessel>): Promise<void> {
  const path = `vessels/${id}`;
  try {
    const docRef = doc(db, 'vessels', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteVessel(id: string): Promise<void> {
  const path = `vessels/${id}`;
  try {
    await deleteDoc(doc(db, 'vessels', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= CRUD: PORTS =================
export async function addPort(port: Omit<Port, 'id'>): Promise<string> {
  const path = 'ports';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...port,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updatePort(id: string, updates: Partial<Port>): Promise<void> {
  const path = `ports/${id}`;
  try {
    await updateDoc(doc(db, 'ports', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePort(id: string): Promise<void> {
  const path = `ports/${id}`;
  try {
    await deleteDoc(doc(db, 'ports', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= CRUD: CLIENTS =================
export async function addClient(client: Omit<Client, 'id'>): Promise<string> {
  const path = 'clients';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...client,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<void> {
  const path = `clients/${id}`;
  try {
    await updateDoc(doc(db, 'clients', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteClient(id: string): Promise<void> {
  const path = `clients/${id}`;
  try {
    await deleteDoc(doc(db, 'clients', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= CRUD: ROUTES =================
export async function addRoute(route: Omit<RouteItem, 'id'>): Promise<string> {
  const path = 'routes';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...route,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateRoute(id: string, updates: Partial<RouteItem>): Promise<void> {
  const path = `routes/${id}`;
  try {
    await updateDoc(doc(db, 'routes', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteRoute(id: string): Promise<void> {
  const path = `routes/${id}`;
  try {
    await deleteDoc(doc(db, 'routes', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= CRUD: SHIPMENTS (CARGO & BL) =================
export async function addShipment(shipment: Omit<Shipment, 'id'>): Promise<string> {
  const path = 'shipments';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...shipment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Auto-create tracking log event
    await addTrackingLog({
      shipmentId: docRef.id,
      vesselId: shipment.vesselId,
      vesselName: shipment.vesselName,
      timestamp: new Date().toISOString(),
      lat: -6.1018,
      lng: 106.8825,
      locationName: shipment.originPort,
      status: `Penerbitan B/L #${shipment.blNumber} & Booking Kargo Disetujui`,
      speedKnots: 0,
      notes: `Muatan ${shipment.cargoType} (${shipment.cargoVolumeTeu} TEU / ${shipment.cargoWeightTon} Ton) dijadwalkan berlayar menuju ${shipment.destinationPort}.`,
      reportedBy: 'Sistem Operasional Otomatis',
      createdAt: new Date().toISOString(),
    });

    // Auto notification
    await addNotification({
      title: `Booking Baru: ${shipment.blNumber}`,
      message: `Pengapalan untuk ${shipment.clientName} dengan kapal ${shipment.vesselName} rute ${shipment.originPort} ke ${shipment.destinationPort} berhasil dibuat.`,
      type: 'info',
      category: 'cargo',
      timestamp: new Date().toISOString(),
      isRead: false,
      relatedId: docRef.id,
      createdAt: new Date().toISOString(),
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateShipment(id: string, updates: Partial<Shipment>): Promise<void> {
  const path = `shipments/${id}`;
  try {
    await updateDoc(doc(db, 'shipments', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    // If status changed, create tracking log and notification
    if (updates.status) {
      const statusLabels: Record<string, string> = {
        booking: 'Booking Kargo Terjadwal',
        loading: 'Proses Pemuatan Kargo di Dermaga (Loading)',
        in_transit: 'Kapal Lepas Jangkar & Sedang Berlayar (In Transit)',
        arrived: 'Kapal Tiba di Pelabuhan Tujuan (Arrived)',
        unloading: 'Proses Pembongkaran Kargo di Dermaga (Unloading)',
        delivered: 'Kargo Berhasil Diterima Shipper / Consignee (Delivered)',
        cancelled: 'Pengapalan Dibatalkan (Cancelled)',
      };

      await addNotification({
        title: `Status B/L Diperbarui: ${updates.blNumber || id}`,
        message: `Status pengapalan kini berubah menjadi: ${statusLabels[updates.status] || updates.status}`,
        type: updates.status === 'delivered' ? 'success' : updates.status === 'cancelled' ? 'danger' : 'info',
        category: 'cargo',
        timestamp: new Date().toISOString(),
        isRead: false,
        relatedId: id,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteShipment(id: string): Promise<void> {
  const path = `shipments/${id}`;
  try {
    await deleteDoc(doc(db, 'shipments', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= TRACKING LOGS =================
export async function addTrackingLog(log: Omit<TrackingLog, 'id'>): Promise<string> {
  const path = 'tracking_logs';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...log,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function deleteTrackingLog(id: string): Promise<void> {
  const path = `tracking_logs/${id}`;
  try {
    await deleteDoc(doc(db, 'tracking_logs', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= CRUD: OPERATIONAL EXPENSES =================
export async function addExpense(expense: Omit<OperationalExpense, 'id'>): Promise<string> {
  const path = 'operational_expenses';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...expense,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateExpense(id: string, updates: Partial<OperationalExpense>): Promise<void> {
  const path = `operational_expenses/${id}`;
  try {
    await updateDoc(doc(db, 'operational_expenses', id), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const path = `operational_expenses/${id}`;
  try {
    await deleteDoc(doc(db, 'operational_expenses', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ================= NOTIFICATIONS =================
export async function addNotification(notification: Omit<AppNotification, 'id'>): Promise<string> {
  const path = 'notifications';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...notification,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

// ================= INITIAL SEEDING HELPER =================
// Seeds realistic maritime business data if database is fresh
export async function checkAndSeedInitialData(): Promise<void> {
  try {
    const vesselSnap = await getDocs(collection(db, 'vessels'));
    if (!vesselSnap.empty) {
      return; // Already populated
    }

    console.log('Populating initial maritime master and transaction data...');

    // 1. Ports
    const initialPorts: Omit<Port, 'id'>[] = [
      {
        code: 'ID-TPP',
        name: 'Pelabuhan Tanjung Priok',
        city: 'Jakarta Utara',
        province: 'DKI Jakarta',
        lat: -6.1018,
        lng: 106.8825,
        activeDocks: 18,
        capacityTeu: 7500000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        code: 'ID-SUB',
        name: 'Pelabuhan Tanjung Perak',
        city: 'Surabaya',
        province: 'Jawa Timur',
        lat: -7.1982,
        lng: 112.7326,
        activeDocks: 14,
        capacityTeu: 3900000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        code: 'ID-MAK',
        name: 'Pelabuhan Makassar (Soekarno-Hatta)',
        city: 'Makassar',
        province: 'Sulawesi Selatan',
        lat: -5.1228,
        lng: 119.4057,
        activeDocks: 9,
        capacityTeu: 1500000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        code: 'ID-BLW',
        name: 'Pelabuhan Belawan',
        city: 'Medan',
        province: 'Sumatera Utara',
        lat: 3.7842,
        lng: 98.6946,
        activeDocks: 10,
        capacityTeu: 1800000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        code: 'ID-BPN',
        name: 'Pelabuhan Semayang',
        city: 'Balikpapan',
        province: 'Kalimantan Timur (IKN Gateway)',
        lat: -1.2789,
        lng: 116.8186,
        activeDocks: 7,
        capacityTeu: 850000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        code: 'ID-SOQ',
        name: 'Pelabuhan Sorong',
        city: 'Sorong',
        province: 'Papua Barat Daya',
        lat: -0.8762,
        lng: 131.2558,
        activeDocks: 5,
        capacityTeu: 450000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const p of initialPorts) {
      await addDoc(collection(db, 'ports'), p);
    }

    // 2. Vessels
    const initialVessels: Omit<Vessel, 'id'>[] = [
      {
        name: 'KM Nusantara Samudera 01',
        code: 'IMO-9481203',
        type: 'container',
        capacityDwt: 18500,
        capacityTeu: 1450,
        builtYear: 2019,
        status: 'sailing',
        homeport: 'Tanjung Priok, Jakarta',
        currentPort: 'Selat Makassar',
        currentLat: -2.312,
        currentLng: 118.245,
        heading: 75,
        speedKnots: 15.2,
        captainName: 'Capt. Hendra Gunawan, M.Mar',
        crewCount: 22,
        fuelLevelPercent: 78,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'MV Bahari Pioneer Express',
        code: 'IMO-9723841',
        type: 'container',
        capacityDwt: 24000,
        capacityTeu: 1950,
        builtYear: 2021,
        status: 'sailing',
        homeport: 'Tanjung Perak, Surabaya',
        currentPort: 'Laut Jawa (menuju Balikpapan)',
        currentLat: -4.120,
        currentLng: 114.650,
        heading: 42,
        speedKnots: 16.4,
        captainName: 'Capt. Bambang Suryono',
        crewCount: 24,
        fuelLevelPercent: 84,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'MT Celebes Liquid Carrier',
        code: 'IMO-9331045',
        type: 'tanker',
        capacityDwt: 32000,
        capacityTeu: 0,
        builtYear: 2017,
        status: 'loading',
        homeport: 'Belawan, Medan',
        currentPort: 'Pelabuhan Belawan (Dermaga Curah Cair CPO)',
        currentLat: 3.7842,
        currentLng: 98.6946,
        heading: 0,
        speedKnots: 0,
        captainName: 'Capt. Rizal Fahmi',
        crewCount: 26,
        fuelLevelPercent: 92,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'MV Borneo Ore Transporter',
        code: 'IMO-9615522',
        type: 'bulk',
        capacityDwt: 45000,
        capacityTeu: 0,
        builtYear: 2016,
        status: 'sailing',
        homeport: 'Semayang, Balikpapan',
        currentPort: 'Laut Banda (menuju Makassar)',
        currentLat: -3.850,
        currentLng: 122.920,
        heading: 215,
        speedKnots: 12.8,
        captainName: 'Capt. Agus Prasetyo',
        crewCount: 23,
        fuelLevelPercent: 62,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'KM Papua Mandiri Ro-Ro',
        code: 'IMO-9289110',
        type: 'roro',
        capacityDwt: 9500,
        capacityTeu: 380,
        builtYear: 2015,
        status: 'docked',
        homeport: 'Sorong, Papua Barat',
        currentPort: 'Pelabuhan Sorong',
        currentLat: -0.8762,
        currentLng: 131.2558,
        heading: 180,
        speedKnots: 0,
        captainName: 'Capt. Yulius Rumere',
        crewCount: 19,
        fuelLevelPercent: 55,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        name: 'TB Samudera Perkasa & BG 300ft',
        code: 'CALL-YB4821',
        type: 'tug_barge',
        capacityDwt: 8000,
        capacityTeu: 0,
        builtYear: 2020,
        status: 'maintenance',
        homeport: 'Tanjung Priok, Jakarta',
        currentPort: 'Galangan Kapal Priok Shipyard',
        currentLat: -6.115,
        currentLng: 106.872,
        heading: 0,
        speedKnots: 0,
        captainName: 'Capt. Dedi Mulyadi',
        crewCount: 12,
        fuelLevelPercent: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const vesselIds: string[] = [];
    for (const v of initialVessels) {
      const ref = await addDoc(collection(db, 'vessels'), v);
      vesselIds.push(ref.id);
    }

    // 3. Clients / Shippers
    const initialClients: Omit<Client, 'id'>[] = [
      {
        companyName: 'PT Nusantara Agro Lestari',
        picName: 'Ibu Ratna Dewi (Logistics Manager)',
        phone: '+62 811-9234-881',
        email: 'logistics@nusantara-agro.co.id',
        address: 'Jl. Sudirman Kav. 52, SCBD Jakarta',
        industry: 'Agrikultur & Kelapa Sawit (CPO)',
        contractType: 'kontrak_tahunan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        companyName: 'PT Pacific Mineral Sumber Daya',
        picName: 'Bapak Irwan Susanto',
        phone: '+62 812-4455-901',
        email: 'procurement@pacificminerals.com',
        address: 'Kawasan Industri Kariangau, Balikpapan',
        industry: 'Pertambangan & Smelter Nikel',
        contractType: 'voyage_charter',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        companyName: 'PT Retail Sembako Indonesia',
        picName: 'Bapak Ferry Santoso',
        phone: '+62 813-8899-771',
        email: 'freight@sembakonasional.id',
        address: 'Pergudangan Margomulyo, Surabaya',
        industry: 'FMCG, Pangan & Logistik Distribusi',
        contractType: 'kontrak_tahunan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        companyName: 'PT Konstruksi Mega Bangunan IKN',
        picName: 'Bapak Wahyu Hidayat',
        phone: '+62 821-7788-334',
        email: 'supply@megabangunan-ikn.co.id',
        address: 'Jl. Mulawarman No. 88, Balikpapan',
        industry: 'Infrastruktur & Baja Konstruksi',
        contractType: 'spot_charter',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const c of initialClients) {
      await addDoc(collection(db, 'clients'), c);
    }

    // 4. Routes
    const initialRoutes: Omit<RouteItem, 'id'>[] = [
      {
        originPortName: 'Pelabuhan Tanjung Priok (Jakarta)',
        destPortName: 'Pelabuhan Makassar (Soekarno-Hatta)',
        distanceNauticalMiles: 795,
        estDays: 3,
        tariffPerTeu: 4850000,
        tariffPerTon: 420000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        originPortName: 'Pelabuhan Tanjung Perak (Surabaya)',
        destPortName: 'Pelabuhan Semayang (Balikpapan/IKN)',
        distanceNauticalMiles: 520,
        estDays: 2,
        tariffPerTeu: 4200000,
        tariffPerTon: 380000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        originPortName: 'Pelabuhan Belawan (Medan)',
        destPortName: 'Pelabuhan Tanjung Priok (Jakarta)',
        distanceNauticalMiles: 760,
        estDays: 3,
        tariffPerTeu: 4600000,
        tariffPerTon: 410000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        originPortName: 'Pelabuhan Makassar',
        destPortName: 'Pelabuhan Sorong (Papua)',
        distanceNauticalMiles: 980,
        estDays: 4,
        tariffPerTeu: 6800000,
        tariffPerTon: 590000,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const r of initialRoutes) {
      await addDoc(collection(db, 'routes'), r);
    }

    // 5. Shipments / Bill of Lading
    const initialShipments: Omit<Shipment, 'id'>[] = [
      {
        blNumber: 'BL-NML/2026/0912',
        clientName: 'PT Retail Sembako Indonesia',
        vesselName: 'KM Nusantara Samudera 01',
        originPort: 'Pelabuhan Tanjung Priok (Jakarta)',
        destinationPort: 'Pelabuhan Makassar (Soekarno-Hatta)',
        cargoType: 'Bahan Pangan, Beras & Minyak Goreng Kemasan (Kontainer)',
        cargoWeightTon: 1850,
        cargoVolumeTeu: 120,
        freightChargeRp: 582000000,
        paymentStatus: 'paid',
        status: 'in_transit',
        departureDate: '2026-09-29',
        etaDate: '2026-10-02',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        blNumber: 'BL-NML/2026/0915',
        clientName: 'PT Konstruksi Mega Bangunan IKN',
        vesselName: 'MV Bahari Pioneer Express',
        originPort: 'Pelabuhan Tanjung Perak (Surabaya)',
        destinationPort: 'Pelabuhan Semayang (Balikpapan/IKN)',
        cargoType: 'Baja Profil, Tiang Pancang & Semen Curah',
        cargoWeightTon: 2400,
        cargoVolumeTeu: 160,
        freightChargeRp: 672000000,
        paymentStatus: 'dp_paid',
        status: 'in_transit',
        departureDate: '2026-09-30',
        etaDate: '2026-10-02',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        blNumber: 'BL-NML/2026/0918',
        clientName: 'PT Nusantara Agro Lestari',
        vesselName: 'MT Celebes Liquid Carrier',
        originPort: 'Pelabuhan Belawan (Medan)',
        destinationPort: 'Pelabuhan Tanjung Priok (Jakarta)',
        cargoType: 'Crude Palm Oil (CPO Liquid Bulk)',
        cargoWeightTon: 8500,
        cargoVolumeTeu: 0,
        freightChargeRp: 3485000000,
        paymentStatus: 'paid',
        status: 'loading',
        departureDate: '2026-10-02',
        etaDate: '2026-10-05',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        blNumber: 'BL-NML/2026/0890',
        clientName: 'PT Pacific Mineral Sumber Daya',
        vesselName: 'MV Borneo Ore Transporter',
        originPort: 'Pelabuhan Sorong (Papua)',
        destinationPort: 'Pelabuhan Makassar',
        cargoType: 'Konsentrat Bijih Mineral & Nikel',
        cargoWeightTon: 14000,
        cargoVolumeTeu: 0,
        freightChargeRp: 8260000000,
        paymentStatus: 'paid',
        status: 'delivered',
        departureDate: '2026-09-22',
        etaDate: '2026-09-26',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const s of initialShipments) {
      await addDoc(collection(db, 'shipments'), s);
    }

    // 6. Tracking Logs
    const initialLogs: Omit<TrackingLog, 'id'>[] = [
      {
        vesselName: 'KM Nusantara Samudera 01',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        lat: -2.312,
        lng: 118.245,
        locationName: 'Perairan Selat Makassar (Waypoint Alpha-4)',
        status: 'Pelayaran Normal - Kecepatan Jelajah 15.2 Knot',
        speedKnots: 15.2,
        notes: 'Kondisi ombak 1.2 meter, angin tenang barat daya 8 knot. Mesin utama dan generator 100% optimal.',
        reportedBy: 'Capt. Hendra Gunawan',
        createdAt: new Date().toISOString(),
      },
      {
        vesselName: 'MV Bahari Pioneer Express',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        lat: -4.120,
        lng: 114.650,
        locationName: 'Laut Jawa Utara Madura Menuju Selat Makassar',
        status: 'Melintasi Alur Laut Kepulauan Indonesia (ALKI II)',
        speedKnots: 16.4,
        notes: 'Suhu kontainer berpendingin terkontrol baik. Menghindari awan kumulonimbus lokal.',
        reportedBy: 'Mualim 1 Bambang S.',
        createdAt: new Date().toISOString(),
      },
      {
        vesselName: 'MT Celebes Liquid Carrier',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        lat: 3.7842,
        lng: 98.6946,
        locationName: 'Dermaga Curah Cair Pelabuhan Belawan',
        status: 'Pompa Pemuatan Kargo CPO Aktif (Tercapai 65% Tanki)',
        speedKnots: 0,
        notes: 'Survei kualitas asam lemak bebas dan moisture kargo lolos uji laboratorium surveyor independen.',
        reportedBy: 'Chief Officer Rizal',
        createdAt: new Date().toISOString(),
      },
      {
        vesselName: 'KM Papua Mandiri Ro-Ro',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        lat: -0.8762,
        lng: 131.2558,
        locationName: 'Dermaga Domestik Pelabuhan Sorong',
        status: 'Kapal Sandar Sempurna, Pengecekan Rampdoor Selesai',
        speedKnots: 0,
        notes: 'Bunkering air tawar 80 ton dan logistik ransum ABK telah diterima.',
        reportedBy: 'Capt. Yulius Rumere',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const l of initialLogs) {
      await addDoc(collection(db, 'tracking_logs'), l);
    }

    // 7. Operational Expenses
    const initialExpenses: Omit<OperationalExpense, 'id'>[] = [
      {
        vesselName: 'KM Nusantara Samudera 01',
        expenseDate: '2026-09-28',
        category: 'fuel',
        description: 'Bunkering Bahan Bakar Marine Fuel Oil (MFO 380) 45.000 Liter di Priok',
        amountRp: 517500000,
        receiptRef: 'INV-PERTAMINA-9982',
        createdAt: new Date().toISOString(),
      },
      {
        vesselName: 'MV Bahari Pioneer Express',
        expenseDate: '2026-09-29',
        category: 'port_dues',
        description: 'Jasa Labuh, Pandu, dan Tunda Pelabuhan Tanjung Perak Surabaya',
        amountRp: 48500000,
        receiptRef: 'PELINDO-SUB-7712',
        createdAt: new Date().toISOString(),
      },
      {
        vesselName: 'MT Celebes Liquid Carrier',
        expenseDate: '2026-09-30',
        category: 'crew_payroll',
        description: 'Alokasi Premi Layar & Uang Makan ABK Periode Voyage 14',
        amountRp: 78000000,
        receiptRef: 'PAYROLL-VYG14-CL',
        createdAt: new Date().toISOString(),
      },
      {
        vesselName: 'TB Samudera Perkasa & BG 300ft',
        expenseDate: '2026-09-25',
        category: 'maintenance',
        description: 'Penggantian Katup Pendingin Mesin Utama & Servis Pompa Bilga',
        amountRp: 62400000,
        receiptRef: 'DOCK-SVC-0418',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const exp of initialExpenses) {
      await addDoc(collection(db, 'operational_expenses'), exp);
    }

    // 8. Notifications
    const initialNotifs: Omit<AppNotification, 'id'>[] = [
      {
        title: 'Peringatan Gelombang Tinggi BMKG',
        message: 'Potensi gelombang 2.5 - 3.0 meter di Laut Jawa bagian Timur dan Selat Makassar selatan. Seluruh nakhoda diinstruksikan menjaga kecepatan aman dan mengencangkan lashing kontainer.',
        type: 'warning',
        category: 'weather',
        timestamp: new Date().toISOString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Jadwal Docking Wajib: TB Samudera Perkasa',
        message: 'Sertifikat kelayakan laut tahunan (annual survey BKI) tersisa 14 hari. Kapal telah memasuki galangan shipyard Priok.',
        type: 'danger',
        category: 'docking',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Kedatangan Kargo B/L 0890 Selesai',
        message: 'Pengapalan konsentrat nikel di Pelabuhan Makassar telah selesai dibongkar dengan verifikasi B/L 100% tanpa kerusakan.',
        type: 'success',
        category: 'cargo',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        isRead: true,
        createdAt: new Date().toISOString(),
      },
    ];

    for (const notif of initialNotifs) {
      await addDoc(collection(db, 'notifications'), notif);
    }

    console.log('Maritime initial seed completed successfully.');
  } catch (error) {
    console.error('Failed to seed initial data:', error);
  }
}
