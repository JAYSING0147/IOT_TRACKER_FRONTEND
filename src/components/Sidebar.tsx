import React, { useState, useMemo } from 'react';
import type { DeviceInfo } from '../types';
import { DashboardStats } from './DashboardStats';
import { DeviceCard } from './DeviceCard';
import { Search, X, Phone } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDevices = useMemo(() => {
    if (!searchQuery.trim()) return devices;
    const query = searchQuery.trim().toLowerCase();
    const cleanQuery = query.replace(/\D/g, '');

    return devices.filter(device => {
      const name = (device.customerName || '').toLowerCase();
      const deviceId = (device.deviceId || '').toLowerCase();
      const address = (device.address || '').toLowerCase();
      
      const phone = (device.phoneNumber || '').toLowerCase();
      const cleanPhone = phone.replace(/\D/g, '');
      
      const ownerMobile = (device.ownerMobile || '').toLowerCase();
      const cleanOwnerMobile = ownerMobile.replace(/\D/g, '');

      const matchName = name.includes(query);
      const matchId = deviceId.includes(query);
      const matchAddress = address.includes(query);
      const matchPhone = phone.includes(query) || (cleanQuery.length > 0 && cleanPhone.includes(cleanQuery));
      const matchOwnerMobile = ownerMobile.includes(query) || (cleanQuery.length > 0 && cleanOwnerMobile.includes(cleanQuery));

      return matchName || matchId || matchAddress || matchPhone || matchOwnerMobile;
    });
  }, [devices, searchQuery]);

  return (
    <div className="sidebar-container">
      <div className="sidebar-content">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
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

        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            placeholder="Search by phone number, name, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="search-clear-btn"
              title="Clear search"
              type="button"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="device-list-container">
          {filteredDevices.length > 0 ? (
            filteredDevices.map(device => (
              <DeviceCard 
                key={device.deviceId}
                device={device}
                isSelected={device.deviceId === selectedDeviceId}
                onSelect={onSelectDevice}
              />
            ))
          ) : (
            <div className="no-results">
              <Phone size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p style={{ fontWeight: 500 }}>No devices found</p>
              <span style={{ fontSize: '0.85rem', marginTop: '4px' }}>No match for "{searchQuery}"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
