import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Layers, Map as MapIcon, Compass } from "lucide-react";

// Check the token immediately
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = MAPBOX_TOKEN;

const WebMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    // 1. Safety check: Don't init if container doesn't exist or token is missing
    if (!mapContainer.current || !MAPBOX_TOKEN) {
      console.error("Mapbox Token is missing or container is not ready.");
      return;
    }
    
    if (mapRef.current) return;

    // 2. Initialize Map
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [123.8854, 10.3157],
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    // 3. Define the styleSheet in the useEffect scope so return can see it
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
      .mapboxgl-ctrl-bottom-right { 
        margin-right: 24px !important; 
        margin-bottom: 24px !important; 
      }
    `;
    document.head.appendChild(styleSheet);

    // 4. Force a resize once the map is loaded to fix "blank div" issues
    mapRef.current.on('load', () => {
      mapRef.current.resize();
    });

    // 5. Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (document.head.contains(styleSheet)) {
        document.head.removeChild(styleSheet);
      }
    };
  }, []);

  const toggleStyle = () => {
    if (!mapRef.current) return;
    const nextStyle = isSatellite ? "outdoors-v12" : "satellite-streets-v12";
    mapRef.current.setStyle(`mapbox://styles/mapbox/${nextStyle}`);
    setIsSatellite(!isSatellite);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-100">
      {/* MAP CONTAINER - using absolute and full screen */}
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full" 
      />

      {/* Floating UI Elements */}
      <div className="absolute top-16 left-6 z-10">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3a5a40] rounded-lg text-white font-bold">
              <Compass size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-[#3a5a40] uppercase tracking-widest">CENVI Explorer</h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Geospatial Engine</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-16 right-6 z-10">
        <button 
          onClick={toggleStyle}
          className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/20 hover:bg-white transition-all"
        >
          <div className={`p-2 rounded-lg ${isSatellite ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {isSatellite ? <Layers size={18} /> : <MapIcon size={18} />}
          </div>
          <div className="flex flex-col items-start pr-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Base Map</span>
            <span className="text-xs font-bold text-gray-700">{isSatellite ? "Satellite" : "Terrain"}</span>
          </div>
        </button>
      </div>

      {/* Token Error Warning (Only shows if .env failed) */}
      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-[100] text-white p-10 text-center">
          <p>Mapbox Token Missing. <br/> Check your .env file and restart Vite.</p>
        </div>
      )}
    </div>
  );
};

export default WebMap;