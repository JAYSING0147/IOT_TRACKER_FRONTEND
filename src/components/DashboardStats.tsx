import React from 'react';
import type { DeviceInfo } from '../types';

interface DashboardStatsProps {
  devices: DeviceInfo[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ devices }) => {
  const total = devices.length;
  const active = devices.filter(d => d.status === 'ACTIVE').length;
  const offline = devices.filter(d => d.status === 'OFFLINE').length;

  return (
    <div className="glass stats-header">
      <div className="stats-title">Fleet Overview</div>
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total Devices</span>
          <span className="stat-value total">{total}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Active Now</span>
          <span className="stat-value active">{active}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Offline</span>
          <span className="stat-value offline">{offline}</span>
        </div>
      </div>
    </div>
  );
};
