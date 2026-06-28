import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Calendar } from 'lucide-react';
import './insights.css'; // Import the new custom Vanilla CSS
import type { DeviceInfo } from '../types';

const BASE_URL = 'https://iot-tracker-backend.onrender.com/api/insights';

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

interface InsightsViewProps {
  devices?: DeviceInfo[];
}

export function InsightsView({ devices = [] }: InsightsViewProps) {
  const getTodayISTString = () => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + offset);
    return istTime.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayISTString());
  const [dailyActiveCount, setDailyActiveCount] = useState(0);
  const [activeDeviceIds, setActiveDeviceIds] = useState<string[]>([]);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [showActiveList, setShowActiveList] = useState(false);
  const [simAnalysis, setSimAnalysis] = useState<any>(null);
  const [rankings, setRankings] = useState<{ mostActive: any[], leastActive: any[] } | null>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/daily?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => {
        setDailyActiveCount(d.totalActiveToday || 0);
        setActiveDeviceIds(d.activeDevices || []);
        setSimAnalysis(d.simAnalysis || null);
      })
      .catch(()=>null);
    fetch(`${BASE_URL}/hourly?date=${selectedDate}`).then(r => r.json()).then(d => setHourlyData(d)).catch(()=>null);
    fetch(`${BASE_URL}/weekly?date=${selectedDate}`).then(r => r.json()).then(d => setWeeklyData(d)).catch(()=>null);
  }, [selectedDate]);

  useEffect(() => {
    fetch(`${BASE_URL}/rankings`)
      .then(r => r.json())
      .then(d => setRankings(d))
      .catch(()=>null);
  }, []);

  return (
    <div className="insights-container">
      <div className="insights-header-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 className="insights-header" style={{ margin: 0 }}>Analytics & Insights</h1>
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
      
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card clickable" onClick={() => setShowActiveList(true)}>
          <div className="kpi-icon-wrapper emerald">
            <Activity size={28} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Active Today</p>
            <p className="kpi-value">{dailyActiveCount} Devices</p>
            <span className="click-hint">Click to view details</span>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="kpi-icon-wrapper blue">
            <Clock size={28} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Peak Time Today</p>
            <p className="kpi-value">
              {hourlyData.length > 0 ? 
                [...hourlyData].sort((a,b) => b.active - a.active)[0].hour : 'N/A'
              }
            </p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper purple">
            <Calendar size={28} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Weekly Peak Day</p>
            <p className="kpi-value">
               {weeklyData.length > 0 ? 
                [...weeklyData].sort((a,b) => b.active - a.active)[0].name : 'N/A'
              }
            </p>
          </div>
        </div>
      </div>

      {simAnalysis && (
        <div className="details-card" style={{ marginBottom: '32px', background: 'rgba(255, 255, 255, 0.8)', padding: '24px', borderRadius: 'var(--border-radius)' }}>
          <h2 className="chart-title" style={{ marginBottom: '20px' }}>SIM Uptime Performance Analysis</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="sim-analysis-grid">
            {/* Airtel Performance */}
            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="sim-badge airtel" style={{ fontSize: '0.8rem' }}>Airtel</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{simAnalysis.airtel.deviceCount} Devices</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{simAnalysis.airtel.uptimePercent}%</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Average Uptime</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${simAnalysis.airtel.uptimePercent}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '4px' }}></div>
              </div>
            </div>

            {/* VI Performance */}
            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="sim-badge vi" style={{ fontSize: '0.8rem' }}>VI</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{simAnalysis.vi.deviceCount} Devices</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{simAnalysis.vi.uptimePercent}%</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Average Uptime</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${simAnalysis.vi.uptimePercent}%`, height: '100%', backgroundColor: '#7c3aed', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        {/* Hourly Chart */}
        <div className="chart-card">
          <h2 className="chart-title">Devices Active by Hour (Today)</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="active" stroke="#22c55e" strokeWidth={4} dot={{r: 4, fill: '#22c55e', strokeWidth: 0}} activeDot={{r: 7}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="chart-card">
          <h2 className="chart-title">Unique Active Devices (Last 7 Days)</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="active" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {rankings && (
        <div className="rankings-section" style={{ marginTop: '32px', marginBottom: '32px' }}>
          <h2 className="chart-title" style={{ marginBottom: '20px' }}>Device Performance Rankings (All-Time)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }} className="rankings-grid">
            
            {/* Most Active Devices */}
            <div className="details-card" style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '24px', borderRadius: 'var(--border-radius)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }}></span>
                Top Performing (Most Active)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rankings.mostActive.map((device, index) => (
                  <div key={device.deviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {index + 1}. {device.customerName}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{device.deviceId}</span>
                        {device.deviceId.startsWith('899110') && <span className="sim-badge airtel" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Airtel</span>}
                        {device.deviceId.startsWith('899111') && <span className="sim-badge vi" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>VI</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)' }}>{device.uptimePercent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Least Active Devices */}
            <div className="details-card" style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '24px', borderRadius: 'var(--border-radius)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }}></span>
                Needs Attention (Least Active)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rankings.leastActive.map((device, index) => (
                  <div key={device.deviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.6)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {index + 1}. {device.customerName}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{device.deviceId}</span>
                        {device.deviceId.startsWith('899110') && <span className="sim-badge airtel" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>Airtel</span>}
                        {device.deviceId.startsWith('899111') && <span className="sim-badge vi" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>VI</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-red)' }}>{device.uptimePercent}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {showActiveList && (
        <div className="modal-overlay" onClick={() => setShowActiveList(false)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Active Devices Today</h2>
              <button className="close-btn" onClick={() => setShowActiveList(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {activeDeviceIds.length === 0 ? (
                <p className="no-devices">No devices recorded active today.</p>
              ) : (
                <div className="active-devices-list">
                  {activeDeviceIds.map(id => {
                    const dev = devices.find(d => d.deviceId === id);
                    return (
                      <div key={id} className="active-device-item">
                        <div className="device-info">
                          <span className="dev-name">{dev ? dev.customerName : 'Unknown Device'}</span>
                          <span className="dev-id">{id}</span>
                          {dev?.lastSeen && (
                            <span className="dev-last-seen" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Clock size={10} />
                              Last Active: {formatLastSeen(dev.lastSeen)}
                            </span>
                          )}
                        </div>
                        <span className={`status-pill ${dev?.status === 'ACTIVE' ? 'active' : 'offline'}`}>
                          {dev?.status || 'OFFLINE'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
