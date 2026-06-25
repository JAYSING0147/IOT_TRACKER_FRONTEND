import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DeviceInfo } from '../types';

// Fix default icon path issues in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  devices: DeviceInfo[];
  selectedDeviceId: string | null;
  onSelectDevice: (id: string) => void;
}

// Component to recenter map when a device is selected
const MapRecenter: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 13, { duration: 1.5 });
  }, [lat, lng, map]);
  return null;
};

// Custom Marker rendering function
const createCustomIcon = (status: 'ACTIVE' | 'OFFLINE') => {
  const isOffline = status === 'OFFLINE';
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container ${isOffline ? 'marker-offline' : 'marker-active'}">
        <div class="pulse"></div>
        <div class="marker-pin"></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

export const MapView: React.FC<MapProps> = ({ devices, selectedDeviceId, onSelectDevice }) => {
  // Center of India
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  
  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);

  return (
    <div className="map-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {devices.map(device => (
          <Marker 
            key={device.deviceId}
            position={[device.lat, device.lng]}
            icon={createCustomIcon(device.status)}
            eventHandlers={{
              click: () => onSelectDevice(device.deviceId)
            }}
          >
            <Popup>
              <strong>{device.customerName}</strong><br/>
              {device.deviceId}<br/>
              Status: {device.status}
            </Popup>
          </Marker>
        ))}

        {selectedDevice && (
          <MapRecenter lat={selectedDevice.lat} lng={selectedDevice.lng} />
        )}
      </MapContainer>
    </div>
  );
};
