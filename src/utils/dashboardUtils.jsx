import L from "leaflet";

export const createClusterCustomIcon = (cluster) => {

  const count = cluster.getChildCount();

  let size = "w-10 h-10 text-sm";
  let colorClass = "bg-[#3a5a40]";

  if (count > 10 && count <= 50) {
    size = "w-12 h-12 text-base";
    colorClass = "bg-[#588157]";
  } 
  else if (count > 50) {
    size = "w-14 h-14 text-lg";
    colorClass = "bg-[#344E41]";
  }

  return L.divIcon({
    html: `<div class="flex items-center justify-center ${size} ${colorClass} text-white rounded-full border-4 border-white/50 shadow-lg font-bold">${count}</div>`,
    className: "bg-transparent",
    iconSize: L.point(50, 50, true),
  });

};

export const createSingleCustomIcon = () => {

  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 bg-[#3a5a40] text-white rounded-full border-2 border-white/80 shadow-md transform hover:scale-110 transition-transform font-bold text-xs">
            1
           </div>`,
    className: "bg-transparent",
    iconSize: L.point(32, 32),
    iconAnchor: L.point(16, 16),
  });

};

export const detectFields = (cols) => {

  const lowerCols = cols.map((c) => ({
    original: c,
    lower: c.toLowerCase()
  }));

  const lat = lowerCols.find(c =>
    c.lower.includes("latitude") ||
    c.lower === "lat" ||
    c.lower.includes("_lat")
  )?.original;

  const lng = lowerCols.find(c =>
    c.lower.includes("longitude") ||
    c.lower === "lng" ||
    c.lower === "lon" ||
    c.lower.includes("_lon")
  )?.original;

  const name =
    lowerCols.find(c => c.lower.includes("last name"))?.original ||
    lowerCols.find(c => c.lower.includes("surname"))?.original ||
    lowerCols.find(c => c.lower.includes("household head"))?.original ||
    cols[0];

  return { lat, lng, name };

};