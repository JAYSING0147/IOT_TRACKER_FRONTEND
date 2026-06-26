import { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import type { DeviceInfo } from '../types';

const MOCK_CSV_DATA = `Customer Name,Address,Device ID,Latitude,Longitude,Phone
John Doe,123 Green St,DEV-001,20.5937,78.9629,+91 98765 43210
Alice Smith,456 Agro Ln,DEV-002,21.1458,79.0882,+91 87654 32109
Bob Johnson,789 Farm Rd,DEV-003,19.0760,72.8777,+91 76543 21098
Priya Patel,101 MG Road,DEV-004,22.3094,72.1362,+91 65432 10987
Rahul Sharma,404 Cyber City,DEV-005,28.4595,77.0266,+91 54321 09876`;

export function useDeviceData(csvUrl?: string) {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parseData = (csvText: string) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const uniqueDevices = new Map<string, DeviceInfo>();
          
          results.data.forEach((row: any) => {
            const deviceId = row['Device ID']?.trim();
            if (deviceId && !uniqueDevices.has(deviceId)) {
              uniqueDevices.set(deviceId, {
                deviceId,
                customerName: row['Name'] || row['Customer Name'] || 'Unknown',
                address: row['Address'] || 'Unknown',
                lat: parseFloat(row['Latitude']) || (20.5937 + (Math.random() - 0.5) * 5),
                lng: parseFloat(row['Longitude']) || (78.9629 + (Math.random() - 0.5) * 5),
                status: 'OFFLINE',
                phoneNumber: row['Phone'] || row['Phone Number'] || row['Contact'] || 'N/A',
              });
            }
          });

          setDevices(Array.from(uniqueDevices.values()));
          setLoading(false);
        }
      });
    };

    if (csvUrl) {
      fetch(csvUrl)
        .then(res => res.text())
        .then(parseData)
        .catch(err => {
          console.error('Failed to fetch CSV, using mock data fallback', err);
          parseData(MOCK_CSV_DATA);
        });
    } else {
      parseData(MOCK_CSV_DATA);
    }
  }, [csvUrl]);

  const updateDeviceLocation = useCallback((deviceId: string, lat: number, lng: number) => {
    setDevices(prev => 
      prev.map(d => d.deviceId === deviceId ? { ...d, lat, lng } : d)
    );
  }, []);

  const updateDeviceStatus = useCallback((deviceId: string, status: 'ACTIVE' | 'OFFLINE', lastSeen: number) => {
    setDevices(prev => {
      const device = prev.find(d => d.deviceId === deviceId);
      if (device) {
        if (device.status === status && device.lastSeen === lastSeen) return prev;
        return prev.map(d => d.deviceId === deviceId ? { ...d, status, lastSeen } : d);
      } else {
        if (loading) return prev;
        // Device exists in backend DB but not in CSV, add it as a placeholder
        const newDevice: DeviceInfo = {
          deviceId,
          customerName: 'Unknown Device',
          address: 'Not Registered in Sheet',
          lat: 20.5937,
          lng: 78.9629,
          status,
          lastSeen,
          phoneNumber: 'N/A'
        };
        return [...prev, newDevice];
      }
    });
  }, [loading]);

  return { devices, loading, updateDeviceLocation, updateDeviceStatus };
}
