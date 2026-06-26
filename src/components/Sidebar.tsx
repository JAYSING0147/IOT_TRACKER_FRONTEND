import React from 'react';
import type { DeviceInfo } from '../types';
import { DashboardStats } from './DashboardStats';
import { DeviceCard } from './DeviceCard';

interface SidebarProps {
  devices: DeviceInfo[];
  selectedDeviceId: string | null;
  onSelectDevice: (id: string) => void;
  activeTab: 'map' | 'insights';
  onTabChange: (tab: 'map' | 'insights') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  devices,
  selectedDeviceId,
  onSelectDevice,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => onTabChange('map')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'map' ? '#e2e8f0' : 'transparent', fontWeight: activeTab === 'map' ? 'bold' : 'normal' }}
          >
            Live Map
          </button>
          <button 
            onClick={() => onTabChange('insights')}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: activeTab === 'insights' ? '#e2e8f0' : 'transparent', fontWeight: activeTab === 'insights' ? 'bold' : 'normal' }}
          >
            Insights
          </button>
        </div>
        <DashboardStats devices={devices} />
        <div className="device-list-container">
          {devices.map(device => (
            <DeviceCard 
              key={device.deviceId}
              device={device}
              isSelected={device.deviceId === selectedDeviceId}
              onSelect={onSelectDevice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
