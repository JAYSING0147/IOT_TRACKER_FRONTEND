import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, MapPin, Hash, Clock, Navigation, Save, Phone } from 'lucide-react';
import type { DeviceInfo } from '../types';

interface DeviceDetailsProps {
  deviceId: string;
  devices: DeviceInfo[];
  onBack: () => void;
  onUpdateLocation: (deviceId: string, lat: number, lng: number) => void;
}

interface TimelineInterval {
  status: 'ACTIVE' | 'OFFLINE';
  start: Date;
  end: Date;
  isCurrent: boolean;
}

const getTodayISTString = () => {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + offset);
  return istTime.toISOString().split('T')[0];
};

const buildTimeline = (
  logs: Array<{ event: 'ONLINE' | 'OFFLINE'; timestamp: string }>,
  currentStatus: 'ACTIVE' | 'OFFLINE',
  selectedDateStr: string
): TimelineInterval[] => {
  const parts = selectedDateStr.split('-');
  const istYear = parseInt(parts[0]);
  const istMonth = parseInt(parts[1]) - 1;
  const istDay = parseInt(parts[2]);
  const targetDate = new Date(Date.UTC(istYear, istMonth, istDay));
  
  const startOfDay = new Date(targetDate.getTime() - (5.5 * 60 * 60 * 1000));
  const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000));
  
  const now = new Date();
  const timelineEnd = endOfDay < now ? endOfDay : now;
  const intervals: TimelineInterval[] = [];

  if (logs.length === 0) {
    intervals.push({
      status: currentStatus,
      start: startOfDay,
      end: timelineEnd,
      isCurrent: endOfDay >= now
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
    end: timelineEnd,
    isCurrent: endOfDay >= now
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

export const DeviceDetailsView: React.FC<DeviceDetailsProps> = ({
  deviceId,
  devices,
  onBack,
  onUpdateLocation
}) => {
  const device = devices.find(d => d.deviceId === deviceId);

  const [selectedDate, setSelectedDate] = useState(getTodayISTString());
  const [editLat, setEditLat] = useState(device?.lat.toString() || '');
  const [editLng, setEditLng] = useState(device?.lng.toString() || '');
  const [logs, setLogs] = useState<Array<{ event: 'ONLINE' | 'OFFLINE'; timestamp: string }>>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Sync edits if device coordinates change externally
  useEffect(() => {
    if (device) {
      setEditLat(device.lat.toString());
      setEditLng(device.lng.toString());
    }
  }, [device?.lat, device?.lng]);

  // Fetch daily logs based on selectedDate
  useEffect(() => {
    if (!deviceId) return;

    const fetchLogs = async () => {
      setLoadingLogs(true);
      setLogsError(null);
      try {
        const res = await fetch(`https://iot-tracker-backend.onrender.com/api/devices/${deviceId}/logs?date=${selectedDate}`);
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
  }, [deviceId, selectedDate, device?.status]);

  if (!device) {
    return (
      <div className="details-view-container">
        <button className="details-back-btn" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Map
        </button>
        <div className="timeline-error">Device not found.</div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(editLat);
    const lng = parseFloat(editLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      onUpdateLocation(device.deviceId, lat, lng);
    }
  };

  // Uptime chart calculation
  const timelineIntervals = buildTimeline(logs, device.status, selectedDate);
  
  let onlineMs = 0;
  let offlineMs = 0;
  timelineIntervals.forEach(interval => {
    const diff = interval.end.getTime() - interval.start.getTime();
    if (interval.status === 'ACTIVE') {
      onlineMs += diff;
    } else {
      offlineMs += diff;
    }
  });
  const totalMs = onlineMs + offlineMs;
  const onlinePercent = totalMs > 0 ? Math.round((onlineMs / totalMs) * 100) : 0;
  const offlinePercent = totalMs > 0 ? 100 - onlinePercent : 100;

  const uptimeData = [
    { name: 'Online', value: onlinePercent, color: '#22c55e' },
    { name: 'Offline', value: offlinePercent, color: '#ef4444' }
  ];

  return (
    <div className="details-view-container">
      <button className="details-back-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Map
      </button>

      <div className="details-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="details-title-group">
          <h1 className="details-title">{device.customerName}</h1>
          <div className="details-subtitle">
            <span className="device-id" style={{ fontSize: '0.9rem' }}>
              <Hash size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
              {device.deviceId}
            </span>
            {device.deviceId.startsWith('899110') && <span className="sim-badge airtel">Airtel</span>}
            {device.deviceId.startsWith('899111') && <span className="sim-badge vi">VI</span>}
            <span className={`status-badge ${device.status.toLowerCase()}`}>
              <div className="status-dot"></div>
              {device.status}
            </span>
          </div>
        </div>
        <div className="date-picker-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            max={getTodayISTString()}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '0.9rem', fontWeight: 500 }}
          />
        </div>
      </div>

      <div className="details-grid">
        {/* Left Column: Info & Form & Chart */}
        <div className="details-column">
          <div className="details-card">
            <h2 className="details-card-title">Device Information</h2>
            <div className="info-row">
              <span className="info-label"><MapPin size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Address</span>
              <span className="info-value">{device.address}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Navigation size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Location</span>
              <span className="info-value">Lat: {device.lat.toFixed(5)}, Lng: {device.lng.toFixed(5)}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Clock size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Last Active</span>
              <span className="info-value">{formatLastSeen(device.lastSeen)}</span>
            </div>
            <div className="info-row">
              <span className="info-label"><Phone size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Phone</span>
              <span className="info-value">
                {device.phoneNumber && device.phoneNumber !== 'N/A' ? (
                  <a href={`tel:${device.phoneNumber}`} style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 600 }}>
                    {device.phoneNumber}
                  </a>
                ) : 'N/A'}
              </span>
            </div>
          </div>

          <div className="details-card">
            <h2 className="details-card-title">Update Coordinates</h2>
            <form className="edit-location-form" onSubmit={handleSave} style={{ margin: 0, padding: 0, border: 'none' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Latitude</label>
                  <input 
                    type="number" 
                    step="any" 
                    value={editLat} 
                    onChange={e => setEditLat(e.target.value)} 
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Longitude</label>
                  <input 
                    type="number" 
                    step="any" 
                    value={editLng} 
                    onChange={e => setEditLng(e.target.value)} 
                  />
                </div>
              </div>
              <button type="submit" className="save-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content' }}>
                <Save size={16} /> Save Changes
              </button>
            </form>
          </div>

          <div className="details-card">
            <h2 className="details-card-title">Uptime Breakdown (Today)</h2>
            {totalMs === 0 ? (
              <p className="no-devices">No uptime data logged today.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div className="chart-pie-container" style={{ width: '180px', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={uptimeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {uptimeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Online: {onlinePercent}%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Offline: {offlinePercent}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="details-column">
          <div className="details-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 className="details-card-title">Today's Timeline (IST)</h2>
            {loadingLogs ? (
              <div className="timeline-loading">
                <span className="spinner-mini"></span> Loading timeline...
              </div>
            ) : logsError ? (
              <div className="timeline-error">{logsError}</div>
            ) : (
              <div className="timeline-list" style={{ flex: 1, maxHeight: 'none' }}>
                {timelineIntervals.reverse().map((interval, idx) => {
                  const isOnline = interval.status === 'ACTIVE';
                  return (
                    <div key={idx} className="timeline-item" style={{ paddingBottom: '20px' }}>
                      <div className="timeline-line" style={{ left: '6px' }}></div>
                      <div className={`timeline-dot ${isOnline ? 'online' : 'offline'}`} style={{ left: '2px', top: '4px' }}></div>
                      <div className="timeline-content" style={{ marginLeft: '24px' }}>
                        <div className="timeline-status-header">
                          <span className={`timeline-status ${isOnline ? 'online' : 'offline'}`} style={{ fontSize: '0.95rem' }}>
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                          <span className="timeline-duration" style={{ fontSize: '0.78rem' }}>
                            {formatDuration(interval.start, interval.end)}
                          </span>
                        </div>
                        <div className="timeline-time" style={{ fontSize: '0.8rem' }}>
                          {formatTimeOnly(interval.start)} - {interval.isCurrent ? 'Present' : formatTimeOnly(interval.end)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
