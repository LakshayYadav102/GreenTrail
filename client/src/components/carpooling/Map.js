import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import './Map.css'; // Ensure this CSS file exists

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
      console.log('Map initialized with center:', position);
      map.invalidateSize();
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          layer.on('tileload', () => console.log('Tile loaded successfully'));
          layer.on('tileerror', (err, tile) => console.error('Tile load error:', {
            url: tile.src,
            error: err.message || err,
            coords: tile.coords,
          }));
        }
      });
    }
  }, [map, position]);
  return null;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return <div className="text-red-500 text-center">Map Error: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

const Map = () => {
  const [position, setPosition] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(20); // km
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Fetch stations
  const fetchStations = useCallback(async () => {
    if (!position) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching stations for:', { lat: position.lat, lon: position.lon, radius: searchRadius });
      const res = await api.get('/ev/nearby', {
        params: { lat: position.lat, lon: position.lon, radius: searchRadius },
      });
      console.log('Stations received:', res.data.length);
      setStations(res.data);
      setLoading(false);
      if (res.data.length === 0 && searchRadius < 50) {
        setSearchRadius(50);
        setError('No stations found within 20km. Expanding to 50km...');
      } else if (res.data.length === 0) {
        setError('No charging stations found within 50km.');
      }
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
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

  // Get user location with high accuracy
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        console.log('Geolocation success:', coords);
        setPosition(coords);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to get location. Using fallback (Delhi).');
        setPosition({ lat: 28.6139, lon: 77.2090 });
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 } // Increased timeout, high accuracy, no cache
    );
  }, []);

  // Fetch stations when position or radius changes
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Manual retry handler
  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    fetchStations();
  };

  // Radius change handler
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10);
    setSearchRadius(newRadius);
    setRetryCount(0);
    setError(null);
  };

  // Manual refresh location button handler
  const handleRefreshLocation = () => {
    setError(null);
    setPosition(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        console.log('Refreshed geolocation:', coords);
        setPosition(coords);
      },
      (err) => {
        console.error('Geolocation refresh error:', err);
        setError('Unable to refresh location. Using fallback.');
        setPosition({ lat: 28.4595, lon: 77.0266 }); // Fallback to Gurugram
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const mapContent = useMemo(() => {
    if (!position) {
      return <p className="text-center mt-4 text-gray-600">Getting your location...</p>;
    }
    if (error) {
      return (
        <div className="text-center mt-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="w-full h-[500px] rounded-xl shadow-lg mt-4" style={{ position: 'relative', zIndex: 1 }}>
        {loading && <p className="text-center mt-4 text-gray-600">Loading charging stations...</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">Search Radius (km)</label>
          <select
            value={searchRadius}
            onChange={handleRadiusChange}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value={10}>10 km</option>
            <option value={20}>20 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
          </select>
          <button
            onClick={handleRefreshLocation}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Refresh Location
          </button>
        </div>
        <ErrorBoundary>
          <MapContainer
            center={[position.lat, position.lon]}
            zoom={12}
            style={{ height: '500px', width: '100%', zIndex: 1 }}
            key={`map-${position.lat}-${position.lon}`}
          >
            <MapEffect position={position} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{
                tileload: () => console.log('OpenStreetMap tile loaded successfully'),
                tileerror: (err, tile) => console.error('OpenStreetMap tile load error:', {
                  url: tile.src,
                  error: err.message || err,
                  coords: tile.coords,
                }),
              }}
            />
            {/* User's location with custom red icon */}
            <Marker position={[position.lat, position.lon]} icon={userIcon}>
              <Popup>Your location</Popup>
            </Marker>
            {stations.map((s, i) => (
              <Marker
                key={i}
                position={[s.AddressInfo.Latitude, s.AddressInfo.Longitude]}
              >
                <Popup>
                  {s.AddressInfo.Title}<br />
                  {s.AddressInfo.AddressLine1}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </ErrorBoundary>
        <p className="text-center mt-2 text-gray-500">{stations.length} stations found</p>
      </div>
    );
  }, [position, stations, loading, error, searchRadius]);

  return mapContent;
};

export default Map;