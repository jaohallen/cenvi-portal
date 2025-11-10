import React, { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [points, map]);
  return null;
};

// 🎨 Generate HSL-based color for each bar
const getHSLColor = (index, total) => {
  const hue = (index * (360 / total)) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

const Dashboard = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [latitudeCol, setLatitudeCol] = useState("");
  const [longitudeCol, setLongitudeCol] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [showPointModal, setShowPointModal] = useState(false);
  const [pointData, setPointData] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedCols, setSelectedCols] = useState([]);

  const SHEET_CSV =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQIiNlo_BgY_sqXu1LnXH-rDH00RB43oecoQ_PSxg50lkloSLnqKloyhyfVm2jqDL2PVX3nAKBdIl_/pub?output=csv";

  // ✅ Load saved columns from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedColumns");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSelectedCols(parsed);
        setIsConfigured(true);
      }
    }
  }, []);

  useEffect(() => {
    Papa.parse(SHEET_CSV, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          alert("Google Sheet is empty or unreadable.");
          return;
        }
        const cleaned = result.data.map((row) => {
          const r = {};
          Object.keys(row).forEach((key) => (r[key.trim()] = row[key]));
          return r;
        });

        const cols = Object.keys(cleaned[0] || {});
        setColumns(cols);

        const latCol = cols.find((c) => c.toLowerCase().includes("lat"));
        const lonCol = cols.find(
          (c) => c.toLowerCase().includes("lon") || c.toLowerCase().includes("lng")
        );

        setLatitudeCol(latCol || "");
        setLongitudeCol(lonCol || "");

        if (latCol && lonCol) {
          const valid = cleaned
            .filter(
              (row) =>
                row[latCol] &&
                row[lonCol] &&
                !isNaN(Number(row[latCol])) &&
                !isNaN(Number(row[lonCol]))
            )
            .map((row, index) => ({
              __id: index + 1,
              ...row,
            }));
          setFilteredData(valid);

          if (!localStorage.getItem("selectedColumns")) {
            setShowConfigModal(true);
          }
        } else {
          alert("Latitude/Longitude columns not found in sheet.");
        }
      },
    });
  }, []);

  const createNumberIcon = (id) =>
    L.divIcon({
      html: `<div style="background-color:#3a5a40;color:white;border-radius:50%;width:28px;height:28px;font-size:13px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;">${id}</div>`,
      className: "",
      iconSize: [28, 28],
    });

  const createClusterCustomIcon = (cluster) =>
    L.divIcon({
      html: `
        <div style="
          display:flex;align-items:center;justify-content:center;
          background:rgba(255,255,255,0.9);
          border:2px solid #344e41;border-radius:12px;
          padding:4px 8px;color:#3a5a40;font-weight:bold;font-size:14px;
        ">
          <span style="font-size:18px;font-weight:900;margin-right:4px;">+</span>
          <span>${cluster.getChildCount()}</span>
        </div>
      `,
      className: "custom-cluster-plus",
      iconSize: [40, 32],
    });

  const getChartData = (column) => {
    if (!column || !filteredData.length) return [];
    const freq = {};
    filteredData.forEach((r) => {
      const val = r[column] || "Unknown";
      freq[val] = (freq[val] || 0) + 1;
    });
    return Object.entries(freq).map(([name, value]) => ({ name, value }));
  };

  const selectedChartData = useMemo(() => {
    const result = {};
    selectedCols.forEach((col) => {
      result[col] = getChartData(col);
    });
    return result;
  }, [selectedCols, filteredData]);

    // ✅ Handle checkbox toggling
  const toggleColumn = (col) => {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleConfirm = () => {
    if (selectedCols.length === 0) {
      alert("Please select at least one column to display charts.");
      return;
    }
    localStorage.setItem("selectedColumns", JSON.stringify(selectedCols));
    setShowConfigModal(false);
    setIsConfigured(true);
  };

  return (
    <div className="bg-gray-50 pt-[90px]">
      
      {/* ⚙️ Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-[95%] md:w-[700px] max-h-[80vh] overflow-y-auto animate-fadeIn">
            <h3 className="text-xl font-bold text-[#344e41] mb-5 text-center">
              Select Columns to Display Charts
            </h3>

            <p className="text-center text-gray-600 text-sm mb-4">
              Please choose at least one column before continuing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {columns
                .filter(
                  (c) =>
                    c !== latitudeCol &&
                    c !== longitudeCol &&
                    c !== "__id" &&
                    c.trim() !== ""
                )
                .map((col) => (
                  <label
                    key={col}
                    className={`flex items-center gap-2 text-sm border rounded-md px-3 py-2 transition-all cursor-pointer ${
                      selectedCols.includes(col)
                        ? "bg-[#e9f5ec] border-[#3a5a40] text-[#3a5a40]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCols.includes(col)}
                      onChange={() => toggleColumn(col)}
                      className="accent-[#3a5a40]"
                    />
                    <span>{col}</span>
                  </label>
                ))}
            </div>

            {/* ✅ Confirm button only */}
            <div className="flex justify-center">
              <button
                onClick={handleConfirm}
                disabled={selectedCols.length === 0}
                className={`px-6 py-2 rounded-md font-semibold text-white transition-all ${
                  selectedCols.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#3a5a40] hover:bg-[#588157]"
                }`}
              >
                {selectedCols.length === 0
                  ? "Select at least one column"
                  : "Confirm Selection"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 px-5 pb-5">
        {/* 🗺️ Map Section */}
        <div className="w-full lg:w-[30%] h-[400px] lg:h-[calc(100vh-160px)] rounded-xl overflow-hidden shadow-md border border-gray-200 bg-white">
          {isConfigured && filteredData.length > 0 ? (
            <MapContainer
              center={[
                Number(filteredData[0][latitudeCol]),
                Number(filteredData[0][longitudeCol]),
              ]}
              zoom={10}
              scrollWheelZoom
              className="h-full w-full rounded-xl"
              style={{ position: "relative", zIndex: 1 }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds
                points={filteredData.map((row) => [
                  Number(row[latitudeCol]),
                  Number(row[longitudeCol]),
                ])}
              />
              <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterCustomIcon}
                spiderfyOnMaxZoom
                showCoverageOnHover={false}
              >
                {filteredData.map((row) => (
                  <Marker
                    key={row.__id}
                    position={[
                      Number(row[latitudeCol]),
                      Number(row[longitudeCol]),
                    ]}
                    icon={createNumberIcon(row.__id)}
                    eventHandlers={{
                      click: () => {
                        setPointData(row);
                        setShowPointModal(true);
                      },
                    }}
                  />
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {showConfigModal ? "Configuring..." : "Loading map..."}
            </div>
          )}
        </div>

        {/* 📊 Charts Section */}
        {isConfigured && (
          <div className="w-full lg:w-[70%] flex flex-col bg-white rounded-xl shadow-md border border-gray-200 p-5 gap-8 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="text-2xl font-bold text-[#344e41] flex items-center gap-3">
                Data Summary ({selectedCols.length} Items)
                <span className="text-base font-normal text-gray-600">
                  Total rows loaded: <span className="font-semibold text-[#3a5a40]">{filteredData.length.toLocaleString()}</span>
                </span>
              </h3>

              <button
                onClick={() => {
                  localStorage.removeItem("selectedColumns");
                  setShowConfigModal(true);
                }}
                className="px-3 py-1 text-sm text-white bg-[#3a5a40] rounded-md hover:bg-[#588157] transition"
              >
                Change Columns
              </button>
            </div>

            {Object.entries(selectedChartData).map(([col, data]) => {
              const total = data.length;
              const coloredData = data.map((item, i) => ({
                ...item,
                color: getHSLColor(i, total),
              }));
              
              return (
                <div
                  key={col}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t pt-3 pb-6 bg-gray-50 rounded-lg shadow-sm"
                >
                  <div className="col-span-full mb-1">
                    <h4 className="text-lg font-bold text-[#3a5a40] text-center">
                      {col}
                    </h4>
                  </div>

                  {/* 📊 Bar Chart */}
                  <div className="h-[320px] min-h-[300px] bg-white rounded-md border border-gray-200 p-3">
                    <ResponsiveContainer width="100%" height="100%" minWidth={250} minHeight={250}>
                    <BarChart
                      data={[...coloredData].sort((a, b) => b.value - a.value)} // ✅ sort descending
                      margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        hide={false}              // shows the X-axis line
                        tick={false}              // hides the labels
                        axisLine={{ stroke: "#333", strokeWidth: 1.5 }}  // ✅ solid dark line
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#333" }} width={40} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload; // actual data object from your bar
                            console.log("Tooltip payload:", payload[0]); // 👀 optional debug
                            return (
                              <div className="p-2 bg-white border border-gray-300 rounded-md text-xs shadow-md">
                                <p className="font-semibold text-[#3a5a40]">{d.name}</p> {/* ✅ shows 'Residential', 'Road', etc. */}
                                <p>Value: <span className="font-medium">{d.value}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <Bar dataKey="value">
                        {[...coloredData]
                          .sort((a, b) => b.value - a.value)
                          .map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  </div>

                  {/* 📋 Frequency Table */}
                  <div className="h-[320px] min-h-[300px] overflow-y-auto bg-white rounded-md border border-gray-200 p-3">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#344e41] text-white sticky top-0">
                        <tr>
                          <th className="border px-3 py-2 text-left">Label</th>
                          <th className="border px-3 py-2 text-center">Frequency</th>
                          <th className="border px-3 py-2 text-center">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coloredData
                          .map((item) => ({
                            ...item,
                            percentage: ((item.value / filteredData.length) * 100).toFixed(2),
                          }))
                          .sort((a, b) => b.value - a.value)
                          .map((item, i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="border px-3 py-2 flex items-center gap-2">
                                <span
                                  className="inline-block w-3 h-3 rounded-sm"
                                  style={{ backgroundColor: item.color }}
                                ></span>
                                {item.name || "—"}
                              </td>
                              <td className="border px-3 py-2 text-center font-medium">
                                {item.value}
                              </td>
                              <td className="border px-3 py-2 text-center text-gray-700">
                                {item.percentage}%
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🪟 Modal for Point Details */}
      {showPointModal && pointData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] md:w-[800px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[#344e41] mb-4 text-center">
              Selected Point Details
            </h3>
            <div className="overflow-x-auto">
              <table className="border border-gray-300 text-sm min-w-[800px]" style={{ tableLayout: "fixed" }}>
                <tbody>
                  {Object.entries(pointData).map(([key, value]) => (
                    <tr key={key}>
                      <td className="border px-3 py-2 font-semibold bg-gray-100 w-[250px] whitespace-nowrap">
                        {key}
                      </td>
                      <td className="border px-3 py-2 break-words max-w-[500px]">
                        {typeof value === "string" && value.startsWith("http") ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#2a9d8f] underline">
                            {value}
                          </a>
                        ) : (
                          value?.toString() || "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowPointModal(false)}
                className="px-5 py-2 rounded-md bg-[#3a5a40] text-white font-medium hover:bg-[#588157]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
