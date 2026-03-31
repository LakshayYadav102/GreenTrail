import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import './Map.css';

// Fix default Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user marker icon (red marker)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to force map re-render
const MapEffect = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.invalidateSize();
    }
  }, [map, position]);
  return null;
};

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return <div className="ev-error-state">Map Error: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

const Map = () => {
  const [position, setPosition] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(20);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const fetchStations = useCallback(async () => {
    if (!position) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/ev/nearby', {
        params: { lat: position.lat, lon: position.lon, radius: searchRadius },
      });
      setStations(res.data);
      setLoading(false);
      if (res.data.length === 0 && searchRadius < 50) {
        setSearchRadius(50);
        setError('No stations found within 20km. Expanding to 50km...');
      } else if (res.data.length === 0) {
        setError('No charging stations found within 50km.');
      }
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.');
      } else if (err.response?.status === 500 && retryCount < MAX_RETRIES) {
        setError(`Error fetching stations. Retrying... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => setRetryCount(prev => prev + 1), 3000);
      } else {
        setError('Failed to fetch stations: ' + (err.response?.data?.message || err.message));
      }
    }
  }, [position, searchRadius, retryCount]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setPosition(coords);
      },
      (err) => {
        setError('Unable to get location. Using fallback (Delhi).');
        setPosition({ lat: 28.6139, lon: 77.2090 });
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchStations();
  };

  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10);
    setSearchRadius(newRadius);
    setRetryCount(0);
    setError(null);
  };

  const handleRefreshLocation = () => {
    setError(null);
    setPosition(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setPosition(coords);
      },
      (err) => {
        setError('Unable to refresh location. Using fallback.');
        setPosition({ lat: 28.4595, lon: 77.0266 });
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const mapContent = useMemo(() => {
    if (!position) {
      return (
        <div className="ev-loading-state">
          <div className="ev-spinner"></div>
          <p>Getting your precise location...</p>
        </div>
      );
    }
    if (error && !stations.length) {
      return (
        <div className="ev-error-state">
          <p>⚠️ {error}</p>
          <button onClick={handleRetry} className="ev-btn primary">Retry Connection</button>
        </div>
      );
    }
    
    return (
      <div className="ev-map-inner-container">
        
        {/* Sleek Dark Mode Controls */}
        <div className="ev-map-controls">
          <div className="ev-control-group">
            <label>Search Radius:</label>
            <div className="ev-select-wrapper">
              <select value={searchRadius} onChange={handleRadiusChange} className="ev-select">
                <option value={10}>10 km Radius</option>
                <option value={20}>20 km Radius</option>
                <option value={50}>50 km Radius</option>
                <option value={100}>100 km Radius</option>
              </select>
            </div>
          </div>
          
          <button onClick={handleRefreshLocation} className="ev-btn secondary">
            <span className="btn-icon">📍</span> Recenter Map
          </button>
        </div>

        {/* Status Indicators */}
        <div className="ev-status-bar">
          {loading ? (
            <span className="status loading">Scanning area for stations...</span>
          ) : (
            <span className="status success">Found {stations.length} charging stations in area</span>
          )}
          {error && stations.length > 0 && <span className="status warning">{error}</span>}
        </div>

        {/* The Actual Map */}
        <div className="ev-leaflet-wrapper">
          <ErrorBoundary>
            <MapContainer
              center={[position.lat, position.lon]}
              zoom={12}
              className="ev-leaflet-map"
              key={`map-${position.lat}-${position.lon}`}
            >
              <MapEffect position={position} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[position.lat, position.lon]} icon={userIcon}>
                <Popup>
                  <div className="ev-popup">
                    <strong>📍 You are here</strong>
                  </div>
                </Popup>
              </Marker>
              {stations.map((s, i) => (
                <Marker key={i} position={[s.AddressInfo.Latitude, s.AddressInfo.Longitude]}>
                  <Popup>
                    <div className="ev-popup">
                      <strong>⚡ {s.AddressInfo.Title}</strong>
                      <p>{s.AddressInfo.AddressLine1}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </ErrorBoundary>
        </div>

      </div>
    );
  }, [position, stations, loading, error, searchRadius]);

  return mapContent;
};

export default Map;