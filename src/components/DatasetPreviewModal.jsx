import React, { useEffect } from "react";
import { MapContainer, TileLayer, WMSTileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DatasetPreviewModal = ({ dataset, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!dataset) return null;

  // ✅ Detect type of dataset
  const isMapFile =
    dataset.type?.toLowerCase().includes("shapefile") ||
    dataset.type?.toLowerCase().includes("raster") ||
    dataset.type?.toLowerCase().includes("map layer");

  const isImage =
    dataset.type?.toLowerCase().includes("image") ||
    dataset.type?.toLowerCase().includes("map image") ||
    dataset.type?.toLowerCase().includes("jpg") ||
    dataset.type?.toLowerCase().includes("png");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-11/12 md:w-3/4 lg:w-2/3 shadow-xl p-4 relative">
        {/* Close Button */}
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-green-600 hover:text-green-800 text-l font-bold bg-transparent border-none cursor-pointer transition-colors"
        >
        ✕
        </button>


        {/* Title + Description */}
        <h2 className="text-xl font-bold mb-2 text-green-800">
          {dataset.name}
        </h2>
        <p className="text-gray-600 mb-3">{dataset.description}</p>

        {/* ✅ Conditional Preview Section */}
        <div className="h-[500px] rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
          {isMapFile ? (
            // 🗺️ Map Preview
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
              {dataset.type.toLowerCase().includes("raster") ||
              dataset.type.toLowerCase().includes("map layer") ? (
                <WMSTileLayer
                  url={dataset.source}
                  layers="cenvi:layer"
                  format="image/png"
                  transparent={true}
                />
              ) : null}

              {/* Optional GeoJSON Overlay */}
              {dataset.geojson && <GeoJSON data={dataset.geojson} />}
            </MapContainer>
          ) : isImage ? (
            // 🖼️ Image Preview
            <img
              src={dataset.source || dataset.thumbnail}
              alt={dataset.name}
              className="max-h-[480px] max-w-full rounded-lg object-contain shadow-md"
            />
          ) : (
            // 📄 Fallback (No preview)
            <p className="text-gray-500 italic">
              Preview not available for this dataset type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetPreviewModal;
