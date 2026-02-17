import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Layers, Map as MapIcon, Compass } from "lucide-react";

mapboxgl.accessToken = "pk.eyJ1IjoiamFvaGFsbGVuIiwiYSI6ImNtbHB3OGJseTFmcmkzZHM2amw3dzB3YmkifQ.3KuVI-f24eeLVP6fHl4EoQ";

const WebMap = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [isSatellite, setIsSatellite] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
      center: [123.8854, 10.3157],
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    return () => mapRef.current?.remove();
  }, []);

  // Style Toggle Function
  const toggleStyle = () => {
    const nextStyle = isSatellite ? "outdoors-v12" : "satellite-streets-v12";
    mapRef.current.setStyle(`mapbox://styles/mapbox/${nextStyle}`);
    setIsSatellite(!isSatellite);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-gray-900">
      
      {/* 1. THE MAP ENGINE */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* 2. FLOATING HEADER (Top Left) */}
      <div className="absolute top-16 left-6 z-10 animate-in fade-in duration-700">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/20 flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#3a5a40] rounded-lg text-white">
              <Compass size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black text-[#3a5a40] uppercase tracking-widest leading-none">
                CENVI Explorer
              </h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1">
                Geospatial Visualization Engine
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. STYLE TOGGLE BUTTON (Top Right) */}
      <div className="absolute top-16 right-6 z-10">
        <button 
          onClick={toggleStyle}
          className="group flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white/20 hover:bg-white transition-all duration-300"
        >
          <div className={`p-2 rounded-lg transition-colors ${isSatellite ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {isSatellite ? <Layers size={18} /> : <MapIcon size={18} />}
          </div>
          <div className="flex flex-col items-start pr-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
              Base Map
            </span>
            <span className="text-xs font-bold text-gray-700">
              {isSatellite ? "Satellite View" : "Terrain View"}
            </span>
          </div>
        </button>
      </div>

    </div>
  );
};

export default WebMap;