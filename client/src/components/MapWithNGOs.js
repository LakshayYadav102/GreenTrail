import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapWithNGOs = () => {
  const [ngos, setNgos] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [searchRadius, setSearchRadius] = useState(20000); // 20 km
  const [loading, setLoading] = useState(false);

  // Load cached location from localStorage
  useEffect(() => {
    const cachedLocation = localStorage.getItem('userLocation');
    if (cachedLocation) {
      setUserLocation(JSON.parse(cachedLocation));
    }
  }, []);

  // Retry geolocation with fallback
  const getUserLocation = useCallback(() => {
    const attemptGeolocation = (highAccuracy, retries = 2) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lon: position.coords.longitude };
          setUserLocation(location);
          localStorage.setItem('userLocation', JSON.stringify(location)); // Cache location
          fetchNGOs(location.lat, location.lon, searchRadius);
        },
        (err) => {
          console.error('Geolocation error:', err);
          if (retries > 0 && highAccuracy) {
            // Retry with low accuracy
            attemptGeolocation(false, retries - 1);
          } else {
            // Fallback to Delhi NCR
            const fallbackLocation = { lat: 28.6139, lon: 77.209 }; // Delhi
            setUserLocation(fallbackLocation);
            localStorage.setItem('userLocation', JSON.stringify(fallbackLocation));
            fetchNGOs(fallbackLocation.lat, fallbackLocation.lon, searchRadius);
            setError('Unable to get location. Using Delhi as fallback.');
          }
        },
        { timeout: 8000, enableHighAccuracy: highAccuracy } // Fixed: Use highAccuracy instead of enableHighAccuracy
      );
    };
    attemptGeolocation(true);
  }, [searchRadius]);

  useEffect(() => {
    if (!userLocation) {
      getUserLocation();
    }
  }, [userLocation, getUserLocation]);

  // Debounced fetchNGOs to prevent rapid API calls
  const fetchNGOs = useCallback(async (lat, lon, radius) => {
    setLoading(true);
    setError('');
    try {
      const query = `
        [out:json];
        (
          node["office"="ngo"]["description"~"tree|plant|environment|conservation",i](around:${radius},${lat},${lon});
          node["environment"="conservation"](around:${radius},${lat},${lon});
          node["name"~"Tree|Plant|Environment|Green|Conservation|Eco|Nature",i](around:${radius},${lat},${lon});
        );
        out center;
      `;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Overpass API failed: ${res.status}`);

      const data = await res.json();
      const ngoList = data.elements
        .filter((e) => e.lat && e.lon)
        .filter((e) =>
          /tree|plant|environment|green|conservation|eco|nature/i.test(e.tags.name || e.tags.description || '') ||
          e.tags.environment === 'conservation'
        )
        .map((e) => ({
          id: e.id,
          name: e.tags.name || e.tags.description || 'Environmental Organization',
          lat: e.lat,
          lon: e.lon,
        }));

      if (ngoList.length === 0) {
        if (radius < 50000) {
          setSearchRadius(50000); // Expand to 50 km
          setError('No environmental NGOs found within 20 km. Expanding search to 50 km...');
        } else {
          setError('No environmental NGOs found within 50 km.');
          setNgos([]);
        }
      } else {
        setNgos(ngoList);
        setError('');
      }
    } catch (err) {
      console.error('Fetch NGOs error:', err);
      setError('Failed to load NGOs. Please try again.');
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update NGOs when radius or location changes
  useEffect(() => {
    if (userLocation) {
      fetchNGOs(userLocation.lat, userLocation.lon, searchRadius);
    }
  }, [userLocation, searchRadius, fetchNGOs]);

  // Memoize map rendering to prevent unnecessary re-renders
  const mapContent = useMemo(() => {
    if (!userLocation) return <p>Getting your location...</p>;

    return (
      <div style={{ height: '400px', width: '100%', marginTop: '2rem' }}>
        {error && (
          <div className="alert alert-warning text-center" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        {loading && <p>Loading NGOs...</p>}
        <MapContainer
          center={[userLocation.lat, userLocation.lon]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[userLocation.lat, userLocation.lon]}>
            <Popup>You are here</Popup>
          </Marker>
          {ngos.map((ngo) => (
            <Marker key={ngo.id} position={[ngo.lat, ngo.lon]}>
              <Popup>{ngo.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }, [userLocation, ngos, error, loading]);

  return mapContent;
};

export default MapWithNGOs;