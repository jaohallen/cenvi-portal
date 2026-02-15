import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Reorder, AnimatePresence } from "framer-motion";
import { 
  Upload, X, Maximize2, Minimize2, Plus, MapPin, 
  FileSpreadsheet, GripVertical, Info, Settings, 
  CheckSquare, Square, Search, Save 
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- Leaflet Icon Fix ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SYMBOLOGY_COLORS = [
  "#3a5a40", "#e76f51", "#2a9d8f", "#e9c46a", "#f4a261", 
  "#264653", "#d62828", "#457b9d", "#6d597a", "#b5838d"
];

// --- Helper Components ---

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
}

// --- CLUSTER ICON GENERATOR (NEW) ---
const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  
  // Dynamic sizing/coloring based on density
  let size = "w-10 h-10 text-sm";
  let colorClass = "bg-[#3a5a40]"; // Default Green
  let borderClass = "border-white/50";
  
  if (count > 10 && count <= 50) {
    size = "w-12 h-12 text-base";
    colorClass = "bg-[#588157]"; // Lighter Green
  } else if (count > 50) {
    size = "w-14 h-14 text-lg";
    colorClass = "bg-[#344E41]"; // Dark Green
  }

  // We return a Leaflet DivIcon with custom HTML (Tailwind classes inside)
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center ${size} ${colorClass} text-white rounded-full border-4 ${borderClass} shadow-lg font-bold">
        ${count}
      </div>
    `,
    className: "bg-transparent", // Important to remove default leaflet square
    iconSize: L.point(50, 50, true), // Coordinate reference point size
  });
};


// --- COLUMN CONFIGURATOR COMPONENT ---
const ColumnConfigurator = ({ allColumns, selectedColumns, onSave, onCancel }) => {
  const [tempSelected, setTempSelected] = useState(new Set(selectedColumns));
  const [searchTerm, setSearchTerm] = useState("");

  const toggleColumn = (col) => {
    const newSet = new Set(tempSelected);
    if (newSet.has(col)) newSet.delete(col);
    else newSet.add(col);
    setTempSelected(newSet);
  };

  const toggleAll = (select) => {
    if (select) setTempSelected(new Set(allColumns));
    else setTempSelected(new Set());
  };

  const filteredColumns = allColumns.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#344E41] flex items-center gap-2">
              <Settings className="text-[#3a5a40]" /> Data Cleaning
            </h2>
            <p className="text-sm text-gray-500">Select the columns you want to visualize in the dashboard.</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b flex gap-4 items-center bg-white">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search columns..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3a5a40] outline-none"
            />
          </div>
          <div className="flex gap-2 text-sm">
            <button 
              onClick={() => toggleAll(true)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition"
            >
              Select All
            </button>
            <button 
              onClick={() => toggleAll(false)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Column Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredColumns.map(col => {
              const isSelected = tempSelected.has(col);
              return (
                <div 
                  key={col} 
                  onClick={() => toggleColumn(col)}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-green-50 border-[#3a5a40] shadow-sm" 
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {isSelected 
                    ? <CheckSquare className="text-[#3a5a40] shrink-0" size={20} /> 
                    : <Square className="text-gray-300 shrink-0" size={20} />
                  }
                  <span className={`text-sm truncate ${isSelected ? "text-[#344E41] font-medium" : "text-gray-500"}`} title={col}>
                    {col}
                  </span>
                </div>
              );
            })}
          </div>
          {filteredColumns.length === 0 && (
            <div className="text-center py-10 text-gray-400">No columns match your search.</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-white flex justify-end gap-3">
          <div className="mr-auto text-sm text-gray-500 flex items-center">
            {tempSelected.size} columns selected
          </div>
          <button 
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium transition"
          >
            Cancel Upload
          </button>
          <button 
            onClick={() => onSave(Array.from(tempSelected))}
            className="px-6 py-2 bg-[#3a5a40] hover:bg-[#344E41] text-white rounded-lg font-medium shadow-md flex items-center gap-2 transition"
          >
            <Save size={18} /> Confirm & Load Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ item, data, onRemove, onResize }) => {
  const summaryData = useMemo(() => {
    const summary = {};
    let maxCount = 0;

    data.forEach((row) => {
      const value = row[item.name] || "No Data";
      summary[value] = (summary[value] || 0) + 1;
      if (summary[value] > maxCount) maxCount = summary[value];
    });

    return Object.entries(summary)
      .sort(([, a], [, b]) => b - a)
      .map(([key, value]) => ({ key, value, percent: (value / maxCount) * 100 }));
  }, [data, item.name]);

  return (
    <Reorder.Item
      value={item}
      id={item.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileDrag={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${
        item.size === "full" ? "h-[500px]" : "h-[300px]"
      }`}
    >
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-400" />
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700">{item.name}</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onResize(item.name)} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition">
            {item.size === "full" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={() => onRemove(item.name)} className="p-1.5 hover:bg-red-100 rounded text-red-500 transition">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1">
        <div className="space-y-3">
          {summaryData.map(({ key, value, percent }) => (
            <div key={key} className="text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 font-medium truncate w-3/4" title={key}>{key}</span>
                <span className="text-gray-500">{value}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: item.color }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reorder.Item>
  );
};

// --- Main Dashboard ---

export default function Dashboard() {
  const [data, setData] = useState([]);
  
  // State for Column Management
  const [allColumns, setAllColumns] = useState([]);       
  const [activeColumns, setActiveColumns] = useState([]); 
  const [showConfig, setShowConfig] = useState(false);    

  const [latField, setLatField] = useState(null);
  const [lngField, setLngField] = useState(null);
  const [nameField, setNameField] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [activeSummaries, setActiveSummaries] = useState([]);

  const detectFields = (cols) => {
    const lowerCols = cols.map((c) => ({ original: c, lower: c.toLowerCase() }));
    
    const lat = lowerCols.find(c => c.lower.includes("latitude") || c.lower === "lat" || c.lower.includes("_lat"))?.original;
    const lng = lowerCols.find(c => c.lower.includes("longitude") || c.lower === "lng" || c.lower === "lon" || c.lower.includes("_lon"))?.original;
    
    const name = lowerCols.find(c => c.lower.includes("last name"))?.original || 
                 lowerCols.find(c => c.lower.includes("surname"))?.original ||
                 lowerCols.find(c => c.lower.includes("household head"))?.original ||
                 lowerCols.find(c => c.lower.includes("name"))?.original ||
                 cols[0];

    return { lat, lng, name };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const binaryStr = evt.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const mainSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(mainSheet);

      if (jsonData.length > 0) {
        setData(jsonData);
        setActiveSummaries([]);
        
        const cols = Object.keys(jsonData[0]);
        setAllColumns(cols);
        
        // Smart Default Selection
        const smartDefaults = cols.filter(c => 
          !c.startsWith("_") && 
          !["start", "end", "deviceid", "simserial"].includes(c.toLowerCase())
        );
        
        setActiveColumns(smartDefaults);
        setShowConfig(true); 
        
        const { lat, lng, name } = detectFields(cols);
        setLatField(lat);
        setLngField(lng);
        setNameField(name);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; 
  };

  const handleConfigSave = (selected) => {
    setActiveColumns(selected);
    setShowConfig(false);
  };

  const handleConfigCancel = () => {
    if (activeColumns.length === 0) {
        setData([]);
    }
    setShowConfig(false);
  };

  const addSummaryCard = () => {
    if (selectedColumn && !activeSummaries.find((c) => c.name === selectedColumn)) {
      const assignedColor = SYMBOLOGY_COLORS[activeSummaries.length % SYMBOLOGY_COLORS.length];
      setActiveSummaries([{ name: selectedColumn, size: "half", color: assignedColor }, ...activeSummaries]);
      setSelectedColumn("");
    }
  };

  const removeSummaryCard = (column) => {
    setActiveSummaries(activeSummaries.filter((c) => c.name !== column));
  };

  const toggleSize = (column) => {
    setActiveSummaries(activeSummaries.map((c) => c.name === column ? { ...c, size: c.size === "half" ? "full" : "half" } : c));
  };

  const validPoints = useMemo(() => {
    if (!latField || !lngField) return [];
    return data
      .map((row) => ({
        lat: parseFloat(row[latField]),
        lng: parseFloat(row[lngField]),
        row: row,
      }))
      .filter((pt) => !isNaN(pt.lat) && !isNaN(pt.lng));
  }, [data, latField, lngField]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden pt-24">
      
      {/* CONFIG MODAL */}
      {showConfig && (
        <ColumnConfigurator 
            allColumns={allColumns} 
            selectedColumns={activeColumns} 
            onSave={handleConfigSave}
            onCancel={handleConfigCancel}
        />
      )}

      {/* SIDEBAR */}
      <div className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col border-r border-gray-200 bg-white h-full shadow-lg z-10">
        <div className="p-6 border-b bg-white z-20">
          <div className="flex justify-between items-start mb-4">
             <h1 className="text-2xl font-bold text-[#344E41] flex items-center gap-2">
                <FileSpreadsheet /> CENVI Dashboard
             </h1>
             {data.length > 0 && (
                <button 
                  onClick={() => setShowConfig(true)}
                  className="p-2 text-gray-500 hover:text-[#3a5a40] hover:bg-gray-100 rounded-full transition"
                  title="Configure Columns"
                >
                    <Settings size={20} />
                </button>
             )}
          </div>
          
          <div className="relative group">
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <button className="w-full py-3 border-2 border-dashed border-[#3a5a40] text-[#3a5a40] bg-green-50 rounded-xl flex items-center justify-center gap-2 group-hover:bg-[#3a5a40] group-hover:text-white transition-colors font-medium">
              <Upload size={18} />
              {data.length > 0 ? "Upload Different File" : "Upload Excel File"}
            </button>
          </div>
        </div>

        {data.length > 0 && (
          <div className="p-4 border-b bg-gray-50 flex gap-2">
            <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} className="flex-1 border-gray-300 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a5a40] outline-none">
              <option value="">Select a column to analyze...</option>
              {activeColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
            <button onClick={addSummaryCard} disabled={!selectedColumn} className="bg-[#3a5a40] text-white p-2 rounded-lg hover:bg-[#344E41] disabled:opacity-50 disabled:cursor-not-allowed transition">
              <Plus size={20} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 scrollbar-thin">
          <Reorder.Group axis="y" values={activeSummaries} onReorder={setActiveSummaries} className="space-y-4">
            <AnimatePresence>
              {activeSummaries.map((item) => (
                <SummaryCard key={item.name} item={item} data={data} onRemove={removeSummaryCard} onResize={toggleSize} />
              ))}
            </AnimatePresence>
          </Reorder.Group>
          {activeSummaries.length === 0 && data.length > 0 && (
             <div className="text-center text-gray-400 mt-10 px-6">
                <Info className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select a column above (e.g., 'Wall Material') to create a summary card.</p>
                <p className="text-xs mt-2 text-gray-500">Missing columns? Click the gear icon <Settings size={12} className="inline"/> to clean your data.</p>
             </div>
          )}
        </div>
      </div>

      {/* MAP AREA */}
      <div className="flex-1 relative bg-gray-200">
        {data.length > 0 ? (
          <MapContainer center={[10.3157, 123.8854]} zoom={11} style={{ height: "100%", width: "100%" }} className="z-0">
            <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {validPoints.length > 0 ? (
              <>
                <FitBounds points={validPoints.map(p => [p.lat, p.lng])} />
                
                {/* CLUSTER GROUP with Custom Icon */}
                <MarkerClusterGroup 
                  chunkedLoading
                  iconCreateFunction={createClusterCustomIcon} // <--- Added here
                >
                  {validPoints.map((pt, index) => (
                    <Marker key={index} position={[pt.lat, pt.lng]}>
                      <Popup minWidth={250}>
                        <div className="bg-[#3a5a40] text-white p-3 -mx-4 -mt-3 rounded-t-md mb-2 shadow-sm">
                          <strong className="text-sm block font-bold">
                            {pt.row[nameField] || "Household Data"}
                          </strong>
                          <span className="text-[10px] opacity-80 uppercase tracking-wider">Respondent #{index + 1}</span>
                        </div>

                        {activeSummaries.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {activeSummaries.map((summary) => (
                              <div key={summary.name} className="flex justify-between items-center border-b border-gray-100 pb-1 last:border-0 hover:bg-gray-50 p-1 rounded">
                                 <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: summary.color }}></div>
                                    <span className="text-[11px] text-gray-500 uppercase font-semibold truncate max-w-[100px]" title={summary.name}>{summary.name}</span>
                                 </div>
                                 <span className="text-sm text-gray-800 font-medium text-right ml-2 truncate max-w-[120px]" title={pt.row[summary.name]}>
                                   {pt.row[summary.name] !== undefined ? String(pt.row[summary.name]) : <span className="text-gray-300">-</span>}
                                 </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1">
                             <div className="text-[10px] text-gray-400 uppercase font-semibold mb-1">Preview (Selected Columns)</div>
                             {activeColumns.slice(0, 5).map(col => (
                                <div key={col} className="flex justify-between text-xs border-b border-gray-50 pb-1">
                                  <span className="text-gray-500 truncate w-1/2" title={col}>{col}:</span>
                                  <span className="font-medium truncate w-1/2 text-right">{pt.row[col] || "-"}</span>
                                </div>
                             ))}
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
                
              </>
            ) : (
               <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl z-[999] flex items-center gap-2 text-red-600 border border-red-200">
                  <MapPin size={18} />
                  <span className="font-medium">No GPS Coordinates found</span>
               </div>
            )}
          </MapContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <div className="bg-gray-100 p-8 rounded-full mb-4"><MapPin size={64} className="opacity-20" /></div>
            <p className="text-lg font-medium">Map Visualization Area</p>
          </div>
        )}
      </div>
    </div>
  );
}