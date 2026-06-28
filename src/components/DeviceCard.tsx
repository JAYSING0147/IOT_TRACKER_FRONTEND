import React from 'react';
import type { DeviceInfo } from '../types';
import { MapPin, Hash, Clock } from 'lucide-react';

const formatLastSeen = (timestamp?: number) => {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

interface DeviceCardProps {
  device: DeviceInfo;
  isSelected: boolean;
  onSelect: (deviceId: string) => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ 
  device, 
  isSelected, 
  onSelect
}) => {
  return (
    <div 
      className={`device-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(device.deviceId)}
    >
      <div className="device-header">
        <span className="device-title">{device.customerName}</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {device.deviceId.startsWith('899110') && <span className="sim-badge airtel">Airtel</span>}
          {device.deviceId.startsWith('899111') && <span className="sim-badge vi">VI</span>}
          <span className={`status-badge ${device.status.toLowerCase()}`}>
            <div className="status-dot"></div>
            {device.status}
          </span>
        </div>
      </div>
      
      <div className="device-id">
        <Hash size={12} style={{ display: 'inline', marginRight: '4px' }}/>
        {device.deviceId}
      </div>
      
      <div className="device-address">
        <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px' }}/>
        <span>{device.address}</span>
      </div>
      
      <div className="device-last-seen" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={12} style={{ flexShrink: 0 }} />
        <span>Last Active: {formatLastSeen(device.lastSeen)}</span>
      </div>
    </div>
  );
};
