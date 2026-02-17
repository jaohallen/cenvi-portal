import React, { useState, useEffect, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Reorder, AnimatePresence, motion } from "framer-motion"; // Added motion import
import { toPng } from 'html-to-image';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from "recharts";
import { 
  Upload, X, Maximize2, Minimize2, Plus, MapPin, 
  FileSpreadsheet, GripVertical, Info, Settings, 
  CheckSquare, Square, Search, Save, Table, 
  PanelLeftClose, PanelLeftOpen, RotateCcw, Loader2, 
  Image as ImageIcon 
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import localforage from "localforage";

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
  
  useEffect(() => {
     setTimeout(() => { map.invalidateSize(); }, 300);
  });
  return null;
}

const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();
  let size = "w-10 h-10 text-sm";
  let colorClass = "bg-[#3a5a40]"; 
  if (count > 10 && count <= 50) {
    size = "w-12 h-12 text-base";
    colorClass = "bg-[#588157]";
  } else if (count > 50) {
    size = "w-14 h-14 text-lg";
    colorClass = "bg-[#344E41]";
  }
  return L.divIcon({
    html: `<div class="flex items-center justify-center ${size} ${colorClass} text-white rounded-full border-4 border-white/50 shadow-lg font-bold">${count}</div>`,
    className: "bg-transparent",
    iconSize: L.point(50, 50, true),
  });
};

// --- PIVOT BLOCK COMPONENT ---
const PivotBlock = ({ id, data, columns, config, setConfig, onRemove, canRemove }) => {
  const { rowField, colField, valField, aggFunc, showChart } = config;
  const chartRef = useRef(null);

  const updateConfig = (field, value) => {
    setConfig(id, { ...config, [field]: value });
  };

  const { pivotData, chartData } = useMemo(() => {
    if (!rowField || !data.length) return { pivotData: null, chartData: [] };
    const rowKeys = new Set();
    const colKeys = new Set();
    const values = {}; 

    data.forEach(row => {
      const rVal = String(row[rowField] || "N/A");
      const cVal = colField ? String(row[colField] || "Total") : "Total";
      rowKeys.add(rVal);
      colKeys.add(cVal);
      if (!values[rVal]) values[rVal] = {};
      if (!values[rVal][cVal]) values[rVal][cVal] = [];
      let val = 1; 
      if (valField && aggFunc !== 'count') {
         val = parseFloat(row[valField]) || 0;
      }
      values[rVal][cVal].push(val);
    });

    const sortedRows = Array.from(rowKeys).sort();
    const sortedCols = Array.from(colKeys).sort();
    const resultMatrix = {};
    let maxCellVal = 0;
    const cData = sortedRows.map(rowKey => {
        const chartRow = { name: rowKey };
        sortedCols.forEach(colKey => {
            const rawVals = values[rowKey]?.[colKey] || [];
            let result = 0;
            if (rawVals.length > 0) {
                if (aggFunc === 'count') result = rawVals.length;
                else if (aggFunc === 'sum') result = rawVals.reduce((a, b) => a + b, 0);
                else if (aggFunc === 'avg') result = rawVals.reduce((a, b) => a + b, 0) / rawVals.length;
                else if (aggFunc === 'min') result = Math.min(...rawVals);
                else if (aggFunc === 'max') result = Math.max(...rawVals);
            }
            result = Math.round(result * 100) / 100;
            resultMatrix[rowKey] = resultMatrix[rowKey] || {};
            resultMatrix[rowKey][colKey] = result;
            chartRow[colKey] = result; 
            if (result > maxCellVal) maxCellVal = result;
        });
        return chartRow;
    });
    return { pivotData: { sortedRows, sortedCols, resultMatrix, maxCellVal }, chartData: cData };
  }, [data, rowField, colField, valField, aggFunc]);

  const handleXlsxExport = () => {
    if (!rowField) { alert("Please select a 'Row' field before exporting."); return; }
    if (aggFunc !== 'count' && !valField) { alert(`Please select a 'Value Field' to calculate the ${aggFunc}.`); return; }
    if (!pivotData) return;
    const baseName = colField ? `CENVI_${rowField}_vs_${colField}` : `CENVI_${rowField}`;
    const fileName = `${baseName}.xlsx`.replace(/\s+/g, '_');
    const analysisRows = [ [rowField, ...pivotData.sortedCols], ...pivotData.sortedRows.map(r => [ r, ...pivotData.sortedCols.map(c => pivotData.resultMatrix[r][c]) ]) ];
    const wb = XLSX.utils.book_new();
    const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisRows);
    XLSX.utils.book_append_sheet(wb, wsAnalysis, "Pivot Analysis");
    const wsDataset = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, wsDataset, "Source Dataset");
    XLSX.writeFile(wb, fileName);
  };

  const handleImageExport = async () => {
    if (!rowField) { alert("Please select a 'Row' field to generate a chart for export."); return; }
    if (!chartRef.current) return;
    const baseName = colField ? `Chart_${rowField}_by_${colField}` : `Chart_${rowField}`;
    const fileName = `${baseName}.png`.replace(/\s+/g, '_');
    try {
      const dataUrl = await toPng(chartRef.current, { backgroundColor: '#ffffff', padding: 20 });
      const link = document.createElement('a');
      link.download = fileName; link.href = dataUrl; link.click();
    } catch (err) { console.error("Image export failed", err); }
  };

  const getCellColor = (val, max) => {
    if (val === 0) return "bg-white text-gray-300";
    const intensity = Math.min(val / max, 1);
    if (intensity < 0.2) return "bg-[#dad7cd] text-gray-800";
    if (intensity < 0.4) return "bg-[#a3b18a] text-gray-800";
    if (intensity < 0.6) return "bg-[#588157] text-white";
    if (intensity < 0.8) return "bg-[#3a5a40] text-white";
    return "bg-[#344E41] text-white";
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
      <div className="bg-gray-50 p-4 border-b flex flex-wrap gap-4 items-end relative">
        {canRemove && (
          <button onClick={() => onRemove(id)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        )}
        <div className="flex flex-col gap-1 w-40">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rows (Categories)</label>
          <select value={rowField} onChange={e => updateConfig("rowField", e.target.value)} className="border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#3a5a40]">
            <option value="">Select Row...</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 w-40">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Columns (Optional)</label>
          <select value={colField} onChange={e => updateConfig("colField", e.target.value)} className="border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#3a5a40]">
            <option value="">(None)</option>
            {columns.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 w-32">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Agg Method</label>
          <select value={aggFunc} onChange={e => updateConfig("aggFunc", e.target.value)} className="border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#3a5a40]">
            <option value="count">Count</option>
            <option value="sum">Sum</option>
            <option value="avg">Average</option>
            <option value="min">Min</option>
            <option value="max">Max</option>
          </select>
        </div>
        {aggFunc !== 'count' && (
          <div className="flex flex-col gap-1 w-40">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Value Field</label>
            <select value={valField} onChange={e => updateConfig("valField", e.target.value)} className="border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#3a5a40]">
              <option value="">Select Value...</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={handleXlsxExport} disabled={!pivotData} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
            <FileSpreadsheet size={14} className="text-green-600" /> Save XLSX
          </button>
          {showChart && (
            <button onClick={handleImageExport} disabled={!pivotData} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              <ImageIcon size={14} className="text-blue-500" /> Save PNG
            </button>
          )}
          <button onClick={() => updateConfig("showChart", !showChart)} className={`px-3 py-1.5 rounded text-xs font-bold border transition ${showChart ? 'bg-[#3a5a40] text-white' : 'bg-white text-gray-600'}`}>
            {showChart ? "Hide Chart" : "Show Chart"}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {showChart && pivotData && (
          <div ref={chartRef} className="w-full md:w-1/3 p-4 border-r bg-white">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-4">{aggFunc} of {valField || 'Rows'} by {rowField}</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 10}} />
                <RechartsTooltip />
                {pivotData.sortedCols.map((col, idx) => (
                  <Bar key={col} dataKey={col} fill={SYMBOLOGY_COLORS[idx % SYMBOLOGY_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex-1 overflow-auto bg-white">
          {pivotData ? (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10 text-gray-600">
                <tr>
                  <th className="p-3 border-b border-r bg-gray-100 sticky left-0 z-20 min-w-[120px] font-bold">{rowField}</th>
                  {pivotData.sortedCols.map(col => <th key={col} className="p-3 border-b text-center font-semibold">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {pivotData.sortedRows.map(rowKey => (
                  <tr key={rowKey}>
                    <td className="p-3 border-b border-r sticky left-0 bg-white font-medium">{rowKey}</td>
                    {pivotData.sortedCols.map(colKey => {
                      const val = pivotData.resultMatrix[rowKey][colKey];
                      return <td key={colKey} className={`p-3 border-b text-center border-l border-white/10 ${getCellColor(val, pivotData.maxCellVal)}`}>{val}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 italic text-sm p-10">Configure Row Field to see data</div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- WRAPPER FOR MULTIPLE PIVOTS ---
const PivotView = ({ data, columns, configs, setConfigs }) => {
  const addBlock = () => {
    const newId = Date.now();
    setConfigs(prev => [...prev, { id: newId, rowField: "", colField: "", valField: "", aggFunc: "count", showChart: true }]);
  };
  const removeBlock = (id) => { setConfigs(prev => prev.filter(c => c.id !== id)); };
  const updateBlockConfig = (id, newConfig) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...newConfig, id } : c));
  };
  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#344E41]">Pivot Comparison View</h2>
          <p className="text-sm text-gray-500">Add multiple tables to compare different metrics or fields.</p>
        </div>
        <button onClick={addBlock} className="bg-[#3a5a40] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#344E41] shadow-md transition">
          <Plus size={18} /> Add Comparison Table
        </button>
      </div>
      <div className="flex flex-col gap-8 pb-10">
        {configs.map((config) => (
          <PivotBlock key={config.id} id={config.id} data={data} columns={columns} config={config} setConfig={updateBlockConfig} onRemove={removeBlock} canRemove={configs.length > 1} />
        ))}
      </div>
    </div>
  );
};

// --- SUMMARY CARD ---
const SummaryCard = ({ item, data, onRemove, onResize }) => {
  const summaryData = useMemo(() => {
    const summary = {};
    let maxCount = 0;
    data.forEach((row) => {
      const value = row[item.name] || "No Data";
      summary[value] = (summary[value] || 0) + 1;
      if (summary[value] > maxCount) maxCount = summary[value];
    });
    return Object.entries(summary).sort(([, a], [, b]) => b - a).map(([key, value]) => ({ key, value, percent: (value / maxCount) * 100 }));
  }, [data, item.name]);

  return (
    <Reorder.Item value={item} id={item.name} className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${item.size === "full" ? "h-[500px]" : "h-[300px]"}`}>
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-gray-400" />
          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
          <h3 className="font-bold text-sm uppercase tracking-wide text-gray-700">{item.name}</h3>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onResize(item.name)} className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition">{item.size === "full" ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          <button onClick={() => onRemove(item.name)} className="p-1.5 hover:bg-red-100 rounded text-red-500 transition"><X size={16} /></button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {summaryData.map(({ key, value, percent }) => (
          <div key={key} className="text-sm">
            <div className="flex justify-between mb-1"><span className="text-gray-700 font-medium truncate w-3/4">{key}</span><span className="text-gray-500">{value}</span></div>
            <div className="w-full bg-gray-100 rounded-full h-2"><div className="h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: item.color }}></div></div>
          </div>
        ))}
      </div>
    </Reorder.Item>
  );
};

// --- COLUMN CONFIGURATOR ---
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
    const filteredColumns = allColumns.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
          <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
            <div><h2 className="text-xl font-bold text-[#344E41] flex items-center gap-2"><Settings className="text-[#3a5a40]" /> Data Cleaning</h2><p className="text-sm text-gray-500">Select columns for Dashboard & Pivot Table.</p></div>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
          </div>
          <div className="p-4 border-b flex gap-4 items-center bg-white">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search columns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3a5a40] outline-none" />
            </div>
            <div className="flex gap-2 text-sm">
              <button onClick={() => toggleAll(true)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition">Select All</button>
              <button onClick={() => toggleAll(false)} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 font-medium transition">Deselect All</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredColumns.map(col => {
                const isSelected = tempSelected.has(col);
                return (
                  <div key={col} onClick={() => toggleColumn(col)} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? "bg-green-50 border-[#3a5a40] shadow-sm" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                    {isSelected ? <CheckSquare className="text-[#3a5a40] shrink-0" size={20} /> : <Square className="text-gray-300 shrink-0" size={20} />}
                    <span className={`text-sm truncate ${isSelected ? "text-[#344E41] font-medium" : "text-gray-500"}`} title={col}>{col}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-6 border-t bg-white flex justify-end gap-3">
            <div className="mr-auto text-sm text-gray-500">{tempSelected.size} columns selected</div>
            <button onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
            <button onClick={() => onSave(Array.from(tempSelected))} className="px-6 py-2 bg-[#3a5a40] hover:bg-[#344E41] text-white rounded-lg font-medium shadow-md flex items-center gap-2"><Save size={18} /> Confirm</button>
          </div>
        </div>
      </div>
    );
};

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const [isRestoring, setRestoring] = useState(true);
  const [data, setData] = useState([]);
  const [allColumns, setAllColumns] = useState([]);       
  const [activeColumns, setActiveColumns] = useState([]); 
  const [showConfig, setShowConfig] = useState(false);    
  const [viewMode, setViewMode] = useState("map"); 
  const [isSidebarOpen, setSidebarOpen] = useState(true); 
  const [pivotConfigs, setPivotConfigs] = useState([
    { id: Date.now(), rowField: "", colField: "", valField: "", aggFunc: "count", showChart: true }
  ]);
  const [latField, setLatField] = useState(null);
  const [lngField, setLngField] = useState(null);
  const [nameField, setNameField] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [activeSummaries, setActiveSummaries] = useState([]);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  const [filters, setFilters] = useState([]); // Array of { column, operator, value }

  useEffect(() => {
    const handleBeforeUnload = (e) => { if (data.length > 0) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [data.length]);

  useEffect(() => {
    const restoreSession = async () => {
        try {
            const savedData = await localforage.getItem("cenvi_dashboard_data");
            const savedConfig = await localforage.getItem("cenvi_dashboard_config");
            if (savedData && savedData.length > 0) {
                setData(savedData);
                if (savedConfig) {
                    setAllColumns(savedConfig.allColumns || []);
                    setActiveColumns(savedConfig.activeColumns || []);
                    setPivotConfigs(savedConfig.pivotConfigs || [{ id: Date.now(), rowField: "", colField: "", valField: "", aggFunc: "count", showChart: true }]);
                    setActiveSummaries(savedConfig.activeSummaries || []);
                    setLatField(savedConfig.latField);
                    setLngField(savedConfig.lngField);
                    setNameField(savedConfig.nameField);
                }
            }
        } catch (err) { console.error("Failed to restore session", err); } 
        finally { setRestoring(false); }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (!isRestoring && data.length > 0) {
        localforage.setItem("cenvi_dashboard_data", data);
        localforage.setItem("cenvi_dashboard_config", {
            allColumns, activeColumns, pivotConfigs, activeSummaries, latField, lngField, nameField
        });
    }
  }, [data, allColumns, activeColumns, pivotConfigs, activeSummaries, latField, lngField, nameField, isRestoring]);

  const handleResetProject = async () => {
     if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
         await localforage.clear();
         setData([]);
         setActiveSummaries([]);
         setActiveColumns([]);
         setAllColumns([]);
         window.location.reload();
     }
  };

  const detectFields = (cols) => {
    const lowerCols = cols.map((c) => ({ original: c, lower: c.toLowerCase() }));
    const lat = lowerCols.find(c => c.lower.includes("latitude") || c.lower === "lat" || c.lower.includes("_lat"))?.original;
    const lng = lowerCols.find(c => c.lower.includes("longitude") || c.lower === "lng" || c.lower === "lon" || c.lower.includes("_lon"))?.original;
    const name = lowerCols.find(c => c.lower.includes("last name"))?.original || lowerCols.find(c => c.lower.includes("surname"))?.original || lowerCols.find(c => c.lower.includes("household head"))?.original || cols[0];
    return { lat, lng, name };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const cleanStr = (str) => !str ? "" : String(str).replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const sheet1OriginalName = workbook.SheetNames[0];
      const households = XLSX.utils.sheet_to_json(workbook.Sheets[sheet1OriginalName]);
      const familyMembers = workbook.SheetNames[1] ? XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]) : [];
      const cleanSheet1Name = cleanStr(sheet1OriginalName);
      const familyMap = {};
      familyMembers.forEach(member => {
        const cleanParentRef = cleanStr(member._parent_table_name);
        if (cleanParentRef === cleanSheet1Name) {
          const pIdx = member._parent_index;
          if (!familyMap[pIdx]) familyMap[pIdx] = [];
          familyMap[pIdx].push(member);
        }
      });
      const enrichedData = households.map(h => ({ ...h, _familyMembers: familyMap[h._index] || [] }));
      if (enrichedData.length > 0) {
        setData(enrichedData);
        const defaultHouseholdCols = [ "First Name", "Middle Name", "Last Name", "Sex at birth", "Age", "Civil Status", "Religion", "Other", "Member of the labor force:", "Educational Attainment", "Contact Number", "Do you live alone", "Number of families", "Member of People's Organization", "Household monthly income" ];
        const allCols = Object.keys(households[0]);
        setAllColumns(allCols);
        const existingDefaults = defaultHouseholdCols.filter(col => allCols.includes(col));
        setActiveColumns(allCols); 
        const initialSummaries = existingDefaults.map((col, idx) => ({ name: col, color: SYMBOLOGY_COLORS[idx % SYMBOLOGY_COLORS.length] }));
        setActiveSummaries(initialSummaries);
        setShowConfig(true); 
        const { lat, lng, name } = detectFields(allCols);
        setLatField(lat); setLngField(lng); setNameField(name);
      }
    };
    reader.readAsBinaryString(file); e.target.value = null; 
  };

  const handleConfigSave = (selected) => { setActiveColumns(selected); setShowConfig(false); };
  const handleConfigCancel = () => { if (activeColumns.length === 0) setData([]); setShowConfig(false); };

  const addSummaryCard = () => {
    if (selectedColumn && !activeSummaries.find((c) => c.name === selectedColumn)) {
      const assignedColor = SYMBOLOGY_COLORS[activeSummaries.length % SYMBOLOGY_COLORS.length];
      setActiveSummaries([{ name: selectedColumn, size: "half", color: assignedColor }, ...activeSummaries]);
      setSelectedColumn("");
    }
  };
  const removeSummaryCard = (column) => { setActiveSummaries(activeSummaries.filter((c) => c.name !== column)); };
  const toggleSize = (column) => { setActiveSummaries(activeSummaries.map((c) => c.name === column ? { ...c, size: c.size === "half" ? "full" : "half" } : c)); };

  const getUniqueValues = (columnName) => {
    if (!columnName || !data.length) return [];
    const values = data.map(row => String(row[columnName] || ""));
    return [...new Set(values)].filter(val => val.trim() !== "").sort();
  };

  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;

    return data.filter((row) => {
      return filters.every((f) => {
        if (!f.column) return true;
        
        if (!f.value || f.value.trim() === "") return true; 

        const cellValue = String(row[f.column] || "").toLowerCase();
        const filterValue = f.value.toLowerCase();

        switch (f.operator) {
          case "equals": return cellValue === filterValue;
          case "contains": return cellValue.includes(filterValue);
          case "starts_with": return cellValue.startsWith(filterValue);
          default: return true;
        }
      });
    });
  }, [data, filters]);

  const validPoints = useMemo(() => {
    if (!latField || !lngField) return [];
    return filteredData.map((row) => ({ 
      lat: parseFloat(row[latField]), 
      lng: parseFloat(row[lngField]), 
      row: row 
    })).filter((pt) => !isNaN(pt.lat) && !isNaN(pt.lng));
  }, [filteredData, latField, lngField]);

  const handleDownloadFiltered = () => {
    if (filteredData.length === 0) return;

    const workbook = XLSX.utils.book_new();

    // --- SHEET 1: Households ---
    // Clean internal keys for the main sheet
    const householdExport = filteredData.map(row => {
      const { _familyMembers, ...cleanRow } = row;
      return cleanRow;
    });
    const householdSheet = XLSX.utils.json_to_sheet(householdExport);
    XLSX.utils.book_append_sheet(workbook, householdSheet, "Households");

    // --- SHEET 2: Family Members ---
    // Extract and flatten family members from the filtered households
    const familyMembersExport = [];
    
    filteredData.forEach((household) => {
      if (household._familyMembers && Array.isArray(household._familyMembers)) {
        household._familyMembers.forEach((member) => {
          familyMembersExport.push({
            // Optional: Include Household Head Name or ID to link the sheets
            "Household Head": `${household["First Name"] || ""} ${household["Last Name"] || ""}`.trim(),
            ...member
          });
        });
      }
    });

    // Only create the second sheet if there are family members found
    if (familyMembersExport.length > 0) {
      const familySheet = XLSX.utils.json_to_sheet(familyMembersExport);
      XLSX.utils.book_append_sheet(workbook, familySheet, "Family Members");
    }

    // --- SAVE WORKBOOK ---
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Filtered_Dataset_${timestamp}.xlsx`);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden pt-24">
      {showConfig && <ColumnConfigurator allColumns={allColumns} selectedColumns={activeColumns} onSave={handleConfigSave} onCancel={handleConfigCancel} />}
      {isSidebarOpen && (
        <div className="w-1/3 min-w-[350px] max-w-[500px] flex flex-col border-r border-gray-200 bg-white h-full shadow-lg z-20 transition-all duration-300">
          <div className="p-6 border-b bg-white z-20">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-[#344E41] flex items-center gap-2"><FileSpreadsheet /> CENVI Dashboard</h1>
              {data.length > 0 && (
                  <div className="flex gap-2">
                     <button onClick={handleResetProject} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Clear All Data"><RotateCcw size={20} /></button>
                     <button onClick={() => setShowConfig(true)} className="p-2 text-gray-500 hover:text-[#3a5a40] hover:bg-gray-100 rounded-full transition" title="Configure Columns"><Settings size={20} /></button>
                  </div>
              )}
            </div>
            <div className="relative group">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <button className="w-full py-3 border-2 border-dashed border-[#3a5a40] text-[#3a5a40] bg-green-50 rounded-xl flex items-center justify-center gap-2 group-hover:bg-[#3a5a40] group-hover:text-white transition-colors font-medium">
                <Upload size={18} /> {data.length > 0 ? "Upload Different File" : "Upload Excel File"}
              </button>
            </div>
          </div>
          {data.length > 0 && (
            <div className="p-4 border-b bg-gray-50 flex gap-2">
              <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} className="flex-1 border-gray-300 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#3a5a40] outline-none">
                <option value="">Select a column to analyze...</option>
                {activeColumns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
              <button onClick={addSummaryCard} disabled={!selectedColumn} className="bg-[#3a5a40] text-white p-2 rounded-lg hover:bg-[#344E41] disabled:opacity-50 disabled:cursor-not-allowed transition"><Plus size={20} /></button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100 scrollbar-thin">
            <Reorder.Group axis="y" values={activeSummaries} onReorder={setActiveSummaries} className="space-y-4">
              <AnimatePresence>{activeSummaries.map((item) => <SummaryCard key={item.name} item={item} data={data} onRemove={removeSummaryCard} onResize={toggleSize} />)}</AnimatePresence>
            </Reorder.Group>
            {activeSummaries.length === 0 && data.length > 0 && (
              <div className="text-center text-gray-400 mt-10 px-6">
                  <Info className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a column above to create a summary card.</p>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 relative">
        {data.length > 0 && (
            <div className="px-6 py-2 bg-white border-b flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition" title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}>
                        {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </button>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setViewMode("map")} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === "map" ? "bg-white text-[#344E41] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><MapPin size={16}/> Map</button>
                        <button onClick={() => setViewMode("pivot")} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${viewMode === "pivot" ? "bg-white text-[#344E41] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}><Table size={16}/> Pivot Table</button>
                    </div>
                </div>
            </div>
        )}
        <div className="flex-1 relative overflow-hidden">
          {viewMode === "pivot" ? (
              <PivotView data={data} columns={activeColumns} configs={pivotConfigs} setConfigs={setPivotConfigs} />
          ) : (
              <div className="w-full h-full relative">
                  {data.length > 0 ? (
                      <>
                      <MapContainer center={[10.3157, 123.8854]} zoom={11} style={{ height: "100%", width: "100%" }} className="z-0">
                          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {validPoints.length > 0 ? (
                              <>
                                  <FitBounds points={validPoints.map(p => [p.lat, p.lng])} />
                                  <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
                                      {validPoints.map((pt, index) => (
                                          <Marker 
                                              key={index} 
                                              position={[pt.lat, pt.lng]}
                                              eventHandlers={{
                                                  click: () => setSelectedHousehold(pt.row),
                                              }}
                                          />
                                      ))}
                                  </MarkerClusterGroup>
                              </>
                              
                          ) : (
                              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-xl z-[999] flex items-center gap-2 text-red-600 border border-red-200">
                                  <MapPin size={18} /><span className="font-medium">No GPS Coordinates found</span>
                              </div>
                          )}
                      </MapContainer>
                      {/* FLOATING FILTER UI */}
                      <div className="absolute top-4 right-6 z-[1000] w-80 max-h-[calc(100%-2rem)] flex flex-col pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto">
                          <div className="p-3 border-b flex justify-between items-center bg-[#3a5a40] text-white">
                            <div className="flex items-center gap-2">
                              <Search size={14} />
                              <span className="text-xs font-bold uppercase tracking-widest">Map Filters</span>
                            </div>
                            <button 
                              onClick={() => setFilters([...filters, { column: activeColumns[0], operator: "contains", value: "" }])}
                              className="p-1 hover:bg-white/20 rounded-md transition"
                            >
                              <Plus size={16} />
                            </button>
                          </div>

                          <div className="p-2 space-y-2 overflow-y-auto custom-scrollbar max-h-[450px]">
                            {filters.map((f, i) => (
                              <div key={i} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm relative group">
                                <button 
                                  onClick={() => setFilters(filters.filter((_, idx) => idx !== i))}
                                  className="absolute top-1 right-1 text-gray-300 hover:text-red-500 transition"
                                >
                                  <X size={12} />
                                </button>
                                
                                <div className="flex flex-col gap-2 mt-1">
                                  <div className="flex gap-1">
                                    {/* Column Selection */}
                                    <select 
                                      value={f.column} 
                                      onChange={(e) => {
                                        const newFilters = [...filters];
                                        newFilters[i].column = e.target.value;
                                        newFilters[i].value = ""; // Clear search when column changes
                                        setFilters(newFilters);
                                      }}
                                      className="w-2/3 text-[10px] bg-gray-50 border border-gray-200 rounded px-2 py-1.5 font-bold text-gray-600 outline-none"
                                    >
                                      {activeColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>

                                    {/* Operator */}
                                    <select 
                                      value={f.operator} 
                                      onChange={(e) => {
                                        const newFilters = [...filters];
                                        newFilters[i].operator = e.target.value;
                                        setFilters(newFilters);
                                      }}
                                      className="w-1/3 text-[10px] bg-gray-50 border border-gray-200 rounded px-1 py-1 text-[#3a5a40] font-bold outline-none"
                                    >
                                      <option value="contains">Like</option>
                                      <option value="equals">Equals</option>
                                      <option value="starts_with">Starts</option>
                                    </select>
                                  </div>

                                  {/* Value Search with Dropdown Suggestions */}
                                  <div className="relative">
                                    <input 
                                      type="text"
                                      list={`vals-${i}`}
                                      placeholder="Search or select value..."
                                      value={f.value}
                                      onChange={(e) => {
                                        const newFilters = [...filters];
                                        newFilters[i].value = e.target.value;
                                        setFilters(newFilters);
                                      }}
                                      className="w-full text-xs border border-gray-200 rounded pl-2 pr-8 py-2 focus:ring-1 focus:ring-[#3a5a40] outline-none bg-gray-50/30 transition-all"
                                    />
                                    {f.value && (
                                      <button
                                        onClick={() => {
                                          const newFilters = [...filters];
                                          newFilters[i].value = "";
                                          setFilters(newFilters);
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Clear input"
                                      >
                                        <X size={12} strokeWidth={3} />
                                      </button>
                                    )}

                                    <datalist id={`vals-${i}`}>
                                      {getUniqueValues(f.column).map(val => (
                                        <option key={val} value={val} />
                                      ))}
                                    </datalist>
                                  </div>
                                </div>
                              </div>
                            ))}
                            
                            {filters.length === 0 && (
                              <div className="text-center py-4 text-gray-400 text-[10px] font-medium">
                                No filters active. Click "+" to start.
                              </div>
                            )}
                          </div>
                          
                          {/* FLOATING FILTER UI - FOOTER SECTION */}
                          {filters.length > 0 && (
                            <div className="p-2 bg-gray-50 border-t flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">
                                  Matches: {filteredData.length} / {data.length}
                                </span>
                                <button 
                                  onClick={() => setFilters([])}
                                  className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase transition-colors"
                                >
                                  Clear All
                                </button>
                              </div>
                              
                              {/* NEW DOWNLOAD BUTTON */}
                              <button 
                                onClick={handleDownloadFiltered}
                                disabled={filteredData.length === 0}
                                className="w-full bg-[#3a5a40] hover:bg-[#344e3a] text-white text-[10px] font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Save size={12} />
                                Export Filtered Data (.xlsx)
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* MODAL OVERLAY */}
                      <AnimatePresence>
                          {selectedHousehold && (
                              <div 
                                  className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                                  onClick={() => setSelectedHousehold(null)} // Close when clicking the background
                              >
                                  <motion.div 
                                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                                      className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden flex flex-col"
                                  >
                                      {/* Fixed Header */}
                                      <div className="bg-[#3a5a40] p-6 text-white flex justify-between items-center shrink-0 shadow-md">
                                          <div>
                                              <h2 className="text-2xl font-bold">
                                                  {`${selectedHousehold["First Name"] || ""} ${selectedHousehold["Last Name"] || ""}`.trim() || "Household Head"}
                                              </h2>
                                              <p className="text-green-100 text-[10px] uppercase tracking-widest mt-1 font-bold">Household Information System</p>
                                          </div>
                                          <button onClick={() => setSelectedHousehold(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                                              <X size={28} />
                                          </button>
                                      </div>

                                      {/* Modal Content */}
                                      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                          
                                          {/* LEFT: Household Details */}
                                          <div className="w-full lg:w-1/3 flex flex-col bg-gray-50 border-r border-gray-200">
                                              <div className="px-6 lg:px-8 pt-1 bg-gray-50">
                                                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1 mb-0">
                                                      Household Details
                                                  </h3>
                                              </div>
                                              
                                              <div className="flex-1 overflow-y-auto p-6 lg:p-8 pt-2 custom-scrollbar">
                                                  <div className="space-y-2">
                                                      {activeSummaries.map((summary) => (
                                                          <div key={summary.name} className="flex flex-col border-b border-gray-200 pb-2">
                                                              <span className="text-[10px] text-[#3a5a40] font-bold uppercase">{summary.name}</span>
                                                              <span className="text-sm text-gray-800 font-medium">
                                                                  {selectedHousehold[summary.name] !== undefined ? String(selectedHousehold[summary.name]) : "-"}
                                                              </span>
                                                          </div>
                                                      ))}
                                                  </div>
                                              </div>
                                          </div>

                                          {/* RIGHT: Family Members */}
                                          <div className="w-full lg:w-2/3 flex flex-col bg-white">
                                              <div className="px-6 lg:px-8 pt-1 bg-white z-10">
                                                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1 mb-0">
                                                      Family Members ({selectedHousehold._familyMembers?.length || 0})
                                                  </h3>
                                              </div>

                                              <div className="flex-1 overflow-y-auto p-6 lg:p-8 pt-0 custom-scrollbar">
                                                  <div className="flex flex-col space-y-0">
                                                      {selectedHousehold._familyMembers?.length > 0 ? (
                                                          selectedHousehold._familyMembers.map((member, i) => (
                                                              <div key={i} className="bg-white py-5 border-b border-gray-100 hover:bg-gray-50 transition-all last:border-b-0">
                                                                  <div className="font-bold text-[#3a5a40] mb-3 text-base flex justify-between">
                                                                      <span>{`${member["First Name"] || ""} ${member["Last Name"] || ""}`.trim() || `Member ${i+1}`}</span>
                                                                      <span className="text-[10px] text-gray-400 font-normal uppercase tracking-tighter">MEMBER #{i+1}</span>
                                                                  </div>
                                                                  <div className="grid grid-cols-1 gap-y-1">
                                                                      {Object.entries(member).map(([key, val]) => {
                                                                          if (key.startsWith("_")) return null;
                                                                          let dVal = val;
                                                                          if (val === 1 || val === "1") dVal = <span className="text-green-600 font-bold italic">True</span>;
                                                                          if (val === 0 || val === "0" || !val) return null;
                                                                          
                                                                          return (
                                                                              <div key={key} className="flex justify-between items-start gap-4 pb-0.5">
                                                                                  <span className="text-[10px] text-gray-400 font-bold uppercase w-1/2 leading-tight">{key}</span>
                                                                                  <span className="text-[11px] text-gray-700 text-right w-1/2 font-medium leading-tight">{dVal}</span>
                                                                              </div>
                                                                          );
                                                                      })}
                                                                  </div>
                                                              </div>
                                                          ))
                                                      ) : (
                                                          <div className="flex flex-col items-center justify-center py-20 text-gray-400 italic">
                                                              No family members found.
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </motion.div>
                              </div>
                          )}
                      </AnimatePresence>
                      </>
                  ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <div className="bg-gray-100 p-8 rounded-full mb-4">
                              <MapPin size={64} className="opacity-20" />
                          </div>
                          <p className="text-lg font-medium">Map Visualization Area</p>
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}