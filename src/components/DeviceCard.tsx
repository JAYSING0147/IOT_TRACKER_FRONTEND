import React, { useState, useEffect } from 'react';
import type { DeviceInfo } from '../types';
import { MapPin, Hash } from 'lucide-react';

interface DeviceCardProps {
  device: DeviceInfo;
  isSelected: boolean;
  onSelect: (deviceId: string) => void;
  onUpdateLocation: (deviceId: string, lat: number, lng: number) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  isSelected, 
  onSelect,
  onUpdateLocation 
}) => {
  const [editLat, setEditLat] = useState(device.lat.toString());
  const [editLng, setEditLng] = useState(device.lng.toString());

  // Sync state if device coordinates change externally
  useEffect(() => {
    setEditLat(device.lat.toString());
    setEditLng(device.lng.toString());
  }, [device.lat, device.lng]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onUpdateLocation(device.deviceId, lat, lng);
    }
  };

  return (
    <div 
      className={`device-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(device.deviceId)}
    >
      <div className="device-header">
        <span className="device-title">{device.customerName}</span>
        <span className={`status-badge ${device.status.toLowerCase()}`}>
          <div className="status-dot"></div>
          {device.status}
        </span>
      </div>
      
      <div className="device-id">
        <Hash size={12} style={{ display: 'inline', marginRight: '4px' }}/>
        {device.deviceId}
      </div>
      
      <div className="device-address">
        <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }}/>
        <span>{device.address}</span>
      </div>

      {isSelected && (
        <form className="edit-location-form" onSubmit={handleSave}>
          <div className="input-group">
            <label>Latitude</label>
            <input 
              type="number" 
              step="any" 
              value={editLat} 
              onChange={e => setEditLat(e.target.value)} 
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="input-group">
            <label>Longitude</label>
            <input 
              type="number" 
              step="any" 
              value={editLng} 
              onChange={e => setEditLng(e.target.value)} 
              onClick={e => e.stopPropagation()}
            />
          </div>
          <button type="submit" className="save-btn" onClick={e => e.stopPropagation()}>
            Update Location
          </button>
        </form>
      )}
    </div>
  );
};
