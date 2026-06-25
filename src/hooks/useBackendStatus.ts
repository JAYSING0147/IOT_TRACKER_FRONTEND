import { useEffect } from 'react';

// Use localhost for local dev. Once deployed to Render, change this to your Render URL.
const BACKEND_URL = 'https://iot-tracker-backend.onrender.com/api/devices';

export function useBackendStatus(
  updateDeviceStatus: (id: string, status: 'ACTIVE' | 'OFFLINE', lastSeen: number) => void
) {
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(BACKEND_URL);
        if (!res.ok) return;
        const dbDevices = await res.json();
        
        dbDevices.forEach((dbDev: any) => {
          updateDeviceStatus(
            dbDev.deviceId, 
            dbDev.status, 
            new Date(dbDev.lastSeen).getTime()
          );
        });
      } catch (err) {
        console.error('Failed to fetch from backend', err);
      }
    };

    fetchStatus(); // Fetch immediately
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, [updateDeviceStatus]);
}
