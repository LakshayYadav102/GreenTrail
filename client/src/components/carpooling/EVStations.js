import React, { useEffect } from 'react';
import Map from './Map';

function EVStations() {
  useEffect(() => {
    console.log('EVStations component rendered');
    return () => console.log('EVStations component unmounted');
  }, []);

  return (
    <div className="container mx-auto p-4" style={{ minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold mb-4">EV Charging Stations</h1>
      <Map key="ev-stations-map" />
      <p className="text-center mt-4 text-gray-600">Showing nearby EV charging stations. Zoom or pan to explore.</p>
    </div>
  );
}

export default EVStations;