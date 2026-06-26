export interface DeviceInfo {
  deviceId: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  status: 'ACTIVE' | 'OFFLINE';
  lastSeen?: number;
  phoneNumber?: string;
}
