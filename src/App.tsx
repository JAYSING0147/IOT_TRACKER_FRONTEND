import { useState, useEffect } from 'react';
import { useDeviceData } from './hooks/useDeviceData';
import { useBackendStatus } from './hooks/useBackendStatus';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/Map';
import { InsightsView } from './components/InsightsView';
import { DeviceDetailsView } from './components/DeviceDetailsView';
import { LoginScreen } from './components/LoginScreen';

function App() {
  // Pass a CSV URL here if you want to load from a public sheet/CSV instead of mock
  // e.g., const { devices, loading, updateDeviceLocation, updateDeviceStatus } = useDeviceData('https://docs.google.com/spreadsheets/.../export?format=csv');
  const { devices, loading, updateDeviceLocation, updateDeviceStatus } = useDeviceData('https://docs.google.com/spreadsheets/d/1LWihDKIuZjkS_ztKGk1zxqQQoE6Thhymg4INJETYgPU/export?format=csv');
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'insights'>('map');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('iot_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('iot_admin_auth', 'true');
    setIsAuthenticated(true);
  };

  useBackendStatus(updateDeviceStatus);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <h2>Loading Fleet Data...</h2>
      </div>
    );
  }

  return (
    <div className={`app-container tab-${activeTab}`}>
      <Sidebar 
        devices={devices} 
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={setSelectedDeviceId}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === 'map' ? (
        selectedDeviceId ? (
          <DeviceDetailsView 
            deviceId={selectedDeviceId}
            devices={devices}
            onBack={() => setSelectedDeviceId(null)}
            onUpdateLocation={updateDeviceLocation}
          />
        ) : (
          <MapView 
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={setSelectedDeviceId}
          />
        )
      ) : (
        <InsightsView devices={devices} />
      )}
    </div>
  );
}

export default App;
