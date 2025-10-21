import React, { useEffect } from "react";
import { MapContainer, TileLayer, WMSTileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DatasetPreviewModal = ({ dataset, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!dataset) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-11/12 md:w-3/4 lg:w-2/3 shadow-xl p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-2">{dataset.name}</h2>
        <p className="text-gray-600 mb-3">{dataset.description}</p>

        <div className="h-[500px] rounded-lg overflow-hidden">
          <MapContainer
            center={[10.3, 123.9]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {dataset.type === "Raster" || dataset.type === "Map Layer" ? (
              <WMSTileLayer
                url={dataset.source}
                layers="cenvi:layer"
                format="image/png"
                transparent={true}
              />
            ) : null}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DatasetPreviewModal;
