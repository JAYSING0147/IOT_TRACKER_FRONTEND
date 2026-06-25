import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Calendar } from 'lucide-react';
import './insights.css'; // Import the new custom Vanilla CSS

const BASE_URL = 'https://iot-tracker-backend.onrender.com/api/insights';

export function InsightsView() {
  const [dailyActive, setDailyActive] = useState(0);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BASE_URL}/daily`).then(r => r.json()).then(d => setDailyActive(d.totalActiveToday || 0)).catch(()=>null);
    fetch(`${BASE_URL}/hourly`).then(r => r.json()).then(d => setHourlyData(d)).catch(()=>null);
    fetch(`${BASE_URL}/weekly`).then(r => r.json()).then(d => setWeeklyData(d)).catch(()=>null);
  }, []);

  return (
    <div className="insights-container">
      <h1 className="insights-header">Analytics & Insights</h1>
      
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper emerald">
            <Activity size={28} />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Active Today</p>
            <p className="kpi-value">{dailyActive} Devices</p>
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
    </div>
  );
}
