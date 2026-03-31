import React, { useEffect, useState } from 'react';
import Map from './Map';
import './EVStations.css'; // We will create this

function EVStations() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    console.log('EVStations component rendered');
    return () => console.log('EVStations component unmounted');
  }, []);

  return (
    <>
      {/* Animated Background matching the Carpool Hub */}
      <div className="ev-stations-background">
        <div className="ev-floating-orb ev-orb-1"></div>
        <div className="ev-floating-orb ev-orb-2"></div>
      </div>

      <div className={`ev-stations-container ${isLoaded ? 'loaded' : ''}`}>
        <div className="ev-glass-card">
          <div className="ev-header">
            <h1 className="ev-title">
              <span className="ev-icon">⚡</span> 
              EV Charging Stations
            </h1>
            <p className="ev-subtitle">Locate nearby fast and standard charging points for your electric vehicle.</p>
          </div>
          
          {/* The Map Component */}
          <div className="ev-map-wrapper">
            <Map key="ev-stations-map" />
          </div>
        </div>
      </div>
    </>
  );
}

export default EVStations;