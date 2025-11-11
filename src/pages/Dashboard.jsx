import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [pivotConfigs, setPivotConfigs] = useState([]);
  const [pivotRow, setPivotRow] = useState("");
  const [pivotCol, setPivotCol] = useState("");
  const [showPivotCreator, setShowPivotCreator] = useState(false);
  const [fullscreenSection, setFullscreenSection] = useState(null); 
  const mapRef = useRef(null);
  const summaryRef = useRef(null);
  const pivotRef = useRef(null);

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

  const generatePivotTable = () => {
    if (!pivotRow || !pivotCol) {
      alert("Please select both Row and Column fields.");
      return;
    }

    const result = {};
    const rowSet = new Set();
    const colSet = new Set();

    filteredData.forEach((item) => {
      const rowVal = item[pivotRow] || "—";
      const colVal = item[pivotCol] || "—";
      rowSet.add(rowVal);
      colSet.add(colVal);
      if (!result[rowVal]) result[rowVal] = {};
      result[rowVal][colVal] = (result[rowVal][colVal] || 0) + 1;
    });

    const newPivot = {
      id: Date.now(),
      row: pivotRow,
      col: pivotCol,
      sortField: "row",
      sortOrder: "asc",
      data: {
        rows: Array.from(rowSet),
        cols: Array.from(colSet),
        result,
      },
    };

    setPivotConfigs((prev) => [...prev, newPivot]);
    setShowPivotCreator(false);
    setPivotRow("");
    setPivotCol("");
  };

  const handlePivotSort = (pivotId, field) => {
    setPivotConfigs((prev) =>
      prev.map((p) => {
        if (p.id !== pivotId) return p;
        const newOrder =
          p.sortField === field && p.sortOrder === "asc" ? "desc" : "asc";
        return { ...p, sortField: field, sortOrder: newOrder };
      })
    );
  };

  const toggleFullscreen = (section) => {
    setFullscreenSection((prev) => (prev === section ? null : section));
  };

  const SectionToolbar = ({ title, children, scrollRef }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
      if (!scrollRef?.current) return;
      const handleScroll = () => {
        setScrolled(scrollRef.current.scrollTop > 10); // threshold for shrink
      };
      const refEl = scrollRef.current;
      refEl.addEventListener("scroll", handleScroll);
      return () => refEl.removeEventListener("scroll", handleScroll);
    }, [scrollRef]);

    return (
      <div
        className={`flex justify-between items-center sticky top-0 z-10 transition-all duration-300 ${
          scrolled
            ? "bg-[#f8f9fa]/90 backdrop-blur-sm shadow-md py-1"
            : "bg-[#f8f9fa] py-2"
        } border-b border-gray-300 px-4 rounded-t-lg`}
      >
        <h3
          className={`font-bold text-[#344e41] transition-all duration-300 ${
            scrolled ? "text-base" : "text-lg"
          }`}
        >
          {title}
        </h3>
        <div className="flex gap-2 items-center">{children}</div>
      </div>
    );
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setFullscreenSection(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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

        <div
          className={`grid grid-cols-1 lg:grid-cols-[30%_40%_30%] gap-4 px-5 pb-5 transition-all duration-500 ${
            fullscreenSection ? "relative" : ""
          }`}
        >        
        {/* Map Section */}
        <div
          className={`relative rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden flex flex-col transition-all duration-500 ${
            fullscreenSection === "map"
              ? "fixed inset-0 z-50 h-screen w-screen p-6"
              : "h-[400px] lg:h-[calc(100vh-160px)]"
          }`}
        >
          <SectionToolbar title="Map View">
            <button
              onClick={() => toggleFullscreen("map")}
              className="px-3 py-1 text-sm bg-[#3a5a40] text-white rounded-md hover:bg-[#588157]"
            >
              {fullscreenSection === "map" ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </SectionToolbar>
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

        {/* Charts Section */}
        {isConfigured && (
          <div
            className={`relative rounded-xl shadow-md border border-gray-200 bg-white p-5 flex flex-col gap-8 overflow-y-auto transition-all duration-500 ${
              fullscreenSection === "summary"
                ? "fixed inset-0 z-50 h-screen w-screen p-6"
                : "max-h-[calc(100vh-160px)]"
            }`}
          >
            <SectionToolbar title="Data Summary">
              <button
                onClick={() => setShowPivotCreator(!showPivotCreator)}
                className="px-3 py-1 text-sm bg-[#3a5a40] text-white rounded-md hover:bg-[#588157]"
              >
                {showPivotCreator ? "Cancel Pivot" : "Create Pivot Table"}
              </button>

              <button
                onClick={() => {
                  localStorage.removeItem("selectedColumns");
                  setShowConfigModal(true);
                }}
                className="px-3 py-1 text-sm bg-[#344e41] text-white rounded-md hover:bg-[#588157]"
              >
                Change Columns
              </button>

              <button
                onClick={() => toggleFullscreen("summary")}
                className="px-3 py-1 text-sm bg-[#3a5a40] text-white rounded-md hover:bg-[#588157]"
              >
                {fullscreenSection === "summary" ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            </SectionToolbar>

            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="text-2xl font-bold text-[#344e41] flex items-center gap-3">
                Data Summary ({selectedCols.length} Items)
                <span className="text-base font-normal text-gray-600">
                  Total rows loaded:{" "}
                  <span className="font-semibold text-[#3a5a40]">
                    {filteredData.length.toLocaleString()}
                  </span>
                </span>
              </h3>
            </div>

            {/* Pivot Creator Dropdowns */}
            {showPivotCreator && (
              <div className="flex flex-wrap gap-3 bg-[#f8f9fa] border border-gray-300 rounded-lg p-4 mb-6 items-center justify-center">
                <select
                  value={pivotRow}
                  onChange={(e) => setPivotRow(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">Select Row Field</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select
                  value={pivotCol}
                  onChange={(e) => setPivotCol(e.target.value)}
                  className="border rounded-md px-3 py-2"
                >
                  <option value="">Select Column Field</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button
                  onClick={generatePivotTable}
                  className="px-5 py-2 rounded-md bg-[#3a5a40] text-white font-medium hover:bg-[#588157]"
                >
                  Generate Pivot
                </button>
              </div>
            )}

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

        {/* 🧮 Pivot Tables Column */}
        <div
          className={`relative rounded-xl shadow-md border border-gray-200 bg-whiteflex flex-col gap-8 overflow-y-auto transition-all duration-500 ${
            fullscreenSection === "pivot"
              ? "fixed inset-0 z-50 h-screen w-screen p-6"
              : "max-h-[calc(100vh-160px)]"
          }`}
        >
          <SectionToolbar title="Pivot Tables">
            <button
              onClick={() => toggleFullscreen("pivot")}
              className="px-3 py-1 text-sm bg-[#3a5a40] text-white rounded-md hover:bg-[#588157]"
            >
              {fullscreenSection === "pivot" ? "Exit Fullscreen" : "Fullscreen"}
            </button>
          </SectionToolbar>
            <h3 className="text-2xl font-bold text-[#344e41] mb-4 text-center">
              Pivot Tables
            </h3>

            {pivotConfigs.length === 0 ? (
              <p className="text-gray-500 italic text-center">
                No pivot tables generated yet.
              </p>
            ) : (
              pivotConfigs.map((pivot) => {
                // 🧮 compute pivot dynamically so it updates when data changes
                const result = {};
                const rowSet = new Set();
                const colSet = new Set();

                filteredData.forEach((item) => {
                  const rowVal = item[pivot.row] || "—";
                  const colVal = item[pivot.col] || "—";
                  rowSet.add(rowVal);
                  colSet.add(colVal);
                  if (!result[rowVal]) result[rowVal] = {};
                  result[rowVal][colVal] = (result[rowVal][colVal] || 0) + 1;
                });

                const rows = Array.from(rowSet);
                const cols = Array.from(colSet);

                let sortedRows = [...rows];
                if (pivot.sortField === "row") {
                  sortedRows.sort((a, b) =>
                    pivot.sortOrder === "asc" ? b.localeCompare(a) : a.localeCompare(b)
                  );
                } else if (pivot.sortField === "total") {
                  sortedRows.sort((a, b) => {
                    const totalA = cols.reduce((sum, c) => sum + (result[a]?.[c] || 0), 0);
                    const totalB = cols.reduce((sum, c) => sum + (result[b]?.[c] || 0), 0);
                    return pivot.sortOrder === "asc" ? totalB - totalA : totalA - totalB;
                  });
                } else {
                  sortedRows.sort((a, b) => {
                    const valA = result[a]?.[pivot.sortField] || 0;
                    const valB = result[b]?.[pivot.sortField] || 0;
                    return pivot.sortOrder === "asc" ? valB - valA : valA - valB;
                  });
                }

                return (
                  <div
                    key={pivot.id}
                    className="border-t pt-3 pb-5 bg-gray-50 rounded-lg shadow-sm mb-5"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-bold text-[#344e41]">
                        {pivot.row} × {pivot.col}
                      </h4>
                      <button
                        onClick={() =>
                          setPivotConfigs((prev) =>
                            prev.filter((p) => p.id !== pivot.id)
                          )
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-gray-300">
                        <thead className="bg-[#344e41] text-white">
                          <tr>
                            <th
                              className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                              onClick={() => handlePivotSort(pivot.id, "row")}
                            >
                              {pivot.row}
                              {pivot.sortField === "row" &&
                                (pivot.sortOrder === "asc" ? " ▼" : " ▲")}
                            </th>
                            {cols.map((c) => (
                              <th
                                key={c}
                                className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                                onClick={() => handlePivotSort(pivot.id, c)}
                              >
                                {c}
                                {pivot.sortField === c &&
                                  (pivot.sortOrder === "asc" ? " ▼" : " ▲")}
                              </th>
                            ))}
                            <th
                              className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                              onClick={() => handlePivotSort(pivot.id, "total")}
                            >
                              Row Total
                              {pivot.sortField === "total" &&
                                (pivot.sortOrder === "asc" ? " ▼" : " ▲")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sortedRows.map((r) => {
                            const rowVals = result[r] || {};
                            const rowTotal = cols.reduce(
                              (sum, c) => sum + (rowVals[c] || 0),
                              0
                            );
                            return (
                              <tr key={r}>
                                <td className="border px-3 py-2 font-semibold">{r}</td>
                                {cols.map((c) => (
                                  <td
                                    key={c}
                                    className="border px-3 py-2 text-center"
                                  >
                                    {rowVals[c] || 0}
                                  </td>
                                ))}
                                <td className="border px-3 py-2 text-center font-bold">
                                  {rowTotal}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-gray-100 font-semibold">
                            <td className="border px-3 py-2">Column Total</td>
                            {cols.map((c) => {
                              const colTotal = rows.reduce(
                                (sum, r) => sum + (result[r]?.[c] || 0),
                                0
                              );
                              return (
                                <td key={c} className="border px-3 py-2 text-center">
                                  {colTotal}
                                </td>
                              );
                            })}
                            <td className="border px-3 py-2 text-center font-bold">
                              {filteredData.length}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            )}

        </div>

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
