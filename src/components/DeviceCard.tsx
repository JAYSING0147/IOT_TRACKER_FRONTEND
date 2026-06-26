import React, { useState, useEffect } from 'react';
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

interface TimelineInterval {
  status: 'ACTIVE' | 'OFFLINE';
  start: Date;
  end: Date;
  isCurrent: boolean;
}

const getStartOfISTDay = () => {
  const offset = 5.5 * 60 * 60 * 1000;
  const utcNow = Date.now();
  const istNowTime = utcNow + offset;
  const istStartOfDayTime = new Date(istNowTime).setUTCHours(0, 0, 0, 0);
  return istStartOfDayTime - offset;
};

const buildTimeline = (
  logs: Array<{ event: 'ONLINE' | 'OFFLINE'; timestamp: string }>,
  currentStatus: 'ACTIVE' | 'OFFLINE'
): TimelineInterval[] => {
  const startOfDay = new Date(getStartOfISTDay());
  const now = new Date();
  const intervals: TimelineInterval[] = [];

  if (logs.length === 0) {
    intervals.push({
      status: currentStatus,
      start: startOfDay,
      end: now,
      isCurrent: true
    });
    return intervals;
  }

  let currentPos = startOfDay;
  let currentState: 'ACTIVE' | 'OFFLINE' = logs[0].event === 'ONLINE' ? 'OFFLINE' : 'ACTIVE';

  logs.forEach((log) => {
    const logTime = new Date(log.timestamp);
    if (logTime < startOfDay) return;

    intervals.push({
      status: currentState,
      start: currentPos,
      end: logTime,
      isCurrent: false
    });

    currentPos = logTime;
    currentState = log.event === 'ONLINE' ? 'ACTIVE' : 'OFFLINE';
  });

  intervals.push({
    status: currentState,
    start: currentPos,
    end: now,
    isCurrent: true
  });

  return intervals;
};

const formatDuration = (start: Date, end: Date) => {
  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return '0m';
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const formatTimeOnly = (date: Date) => {
  return date.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

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
  const [logs, setLogs] = useState<Array<{ event: 'ONLINE' | 'OFFLINE'; timestamp: string }>>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Sync state if device coordinates change externally
  useEffect(() => {
    setEditLat(device.lat.toString());
    setEditLng(device.lng.toString());
  }, [device.lat, device.lng]);

  // Fetch timeline logs when selected
  useEffect(() => {
    if (!isSelected) return;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      setLogsError(null);
      try {
        const res = await fetch(`https://iot-tracker-backend.onrender.com/api/devices/${device.deviceId}/logs`);
        if (!res.ok) throw new Error('Failed to fetch timeline logs');
        const data = await res.json();
        setLogs(data);
      } catch (err: any) {
        setLogsError(err.message || 'Error loading timeline');
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchLogs();
  }, [isSelected, device.deviceId, device.status]);

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
      
      <div className="device-last-seen" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Clock size={12} style={{ flexShrink: 0 }} />
        <span>Last Active: {formatLastSeen(device.lastSeen)}</span>
      </div>

      {isSelected && (
        <>
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

          <div className="device-timeline-section" onClick={e => e.stopPropagation()}>
            <div className="timeline-title">Today's Timeline (IST)</div>
            {loadingLogs ? (
              <div className="timeline-loading">
                <span className="spinner-mini"></span> Loading timeline...
              </div>
            ) : logsError ? (
              <div className="timeline-error">{logsError}</div>
            ) : (
              <div className="timeline-list">
                {buildTimeline(logs, device.status).reverse().map((interval, idx) => {
                  const isOnline = interval.status === 'ACTIVE';
                  return (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-line"></div>
                      <div className={`timeline-dot ${isOnline ? 'online' : 'offline'}`}></div>
                      <div className="timeline-content">
                        <div className="timeline-status-header">
                          <span className={`timeline-status ${isOnline ? 'online' : 'offline'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                          <span className="timeline-duration">
                            {formatDuration(interval.start, interval.end)}
                          </span>
                        </div>
                        <div className="timeline-time">
                          {formatTimeOnly(interval.start)} - {interval.isCurrent ? 'Present' : formatTimeOnly(interval.end)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
