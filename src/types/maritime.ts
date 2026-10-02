export type VesselType = 'container' | 'tanker' | 'bulk' | 'roro' | 'tug_barge';
export type VesselStatus = 'sailing' | 'docked' | 'maintenance' | 'loading' | 'standby';

export interface Vessel {
  id: string;
  name: string;
  code: string;
  type: VesselType;
  capacityDwt: number;
  capacityTeu: number;
  builtYear: number;
  status: VesselStatus;
  homeport: string;
  currentPort: string;
  currentLat: number;
  currentLng: number;
  heading: number;
  speedKnots: number;
  captainName: string;
  crewCount: number;
  fuelLevelPercent: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Port {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  activeDocks: number;
  capacityTeu: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  companyName: string;
  picName: string;
  phone: string;
  email: string;
  address: string;
  industry: string;
  contractType: 'kontrak_tahunan' | 'spot_charter' | 'voyage_charter';
  createdAt?: string;
  updatedAt?: string;
}

export interface RouteItem {
  id: string;
  originPortId?: string;
  originPortName: string;
  destPortId?: string;
  destPortName: string;
  distanceNauticalMiles: number;
  estDays: number;
  tariffPerTeu: number;
  tariffPerTon: number;
  status: 'active' | 'restricted' | 'seasonal';
  createdAt?: string;
  updatedAt?: string;
}

export type ShipmentStatus = 'booking' | 'loading' | 'in_transit' | 'arrived' | 'unloading' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'dp_paid' | 'paid';

export interface Shipment {
  id: string;
  blNumber: string;
  clientId?: string;
  clientName: string;
  vesselId?: string;
  vesselName: string;
  routeId?: string;
  originPort: string;
  destinationPort: string;
  cargoType: string;
  cargoWeightTon: number;
  cargoVolumeTeu: number;
  freightChargeRp: number;
  paymentStatus: PaymentStatus;
  status: ShipmentStatus;
  departureDate: string;
  etaDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrackingLog {
  id: string;
  shipmentId?: string;
  vesselId?: string;
  vesselName: string;
  timestamp: string;
  lat: number;
  lng: number;
  locationName: string;
  status: string;
  speedKnots: number;
  notes: string;
  reportedBy: string;
  createdAt?: string;
}

export type ExpenseCategory = 'fuel' | 'port_dues' | 'crew_payroll' | 'maintenance' | 'provisions' | 'insurance';

export interface OperationalExpense {
  id: string;
  vesselId?: string;
  vesselName: string;
  shipmentId?: string;
  expenseDate: string;
  category: ExpenseCategory;
  description: string;
  amountRp: number;
  receiptRef: string;
  createdAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  category?: 'weather' | 'docking' | 'cargo' | 'system';
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'operator' | 'captain' | 'finance';
}
