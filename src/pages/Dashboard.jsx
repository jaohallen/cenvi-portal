import React, { useState, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Maximize2, Minimize2 } from "lucide-react";
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
  const hasFit = useRef(false);

  useEffect(() => {
    if (points.length > 0 && !hasFit.current) {
      const bounds = points.map(([lat, lng]) => [lat, lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
      hasFit.current = true; // ✅ only fit once
    }
  }, [points, map]);

  return null;
};

// 🎨 Generate HSL-based color for each bar
const getHSLColor = (index, total) => {
  const hue = (index * (360 / total)) % 360;
  return `hsl(${hue}, 65%, 45%)`;
};

const ResetViewButton = ({ points }) => {
  const map = useMap();

  return (
    <div
      className="absolute top-[80px] left-[10px] z-[1000] pointer-events-auto"
      style={{ position: "absolute" }}
    >
      <button
        onClick={() => {
          if (points.length > 0) {
            const bounds = points.map(([lat, lng]) => [lat, lng]);
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        }}
        className="bg-[#344e41] text-white rounded-md px-[10px] py-[6px] text-sm shadow-md hover:bg-[#3a5a40] transition-all"
        title="Reset Map View"
      >
        ⟳
      </button>
    </div>
  );
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
  const [showPivotSection, setShowPivotSection] = useState(false);
  const [showPivotModal, setShowPivotModal] = useState(false);


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
    setShowPivotSection(true);
  };

  const handlePivotSort = (pivotId, field) => {
    setPivotConfigs((prev) =>
      prev.map((p) => {
        if (p.id !== pivotId) return p;

        // 🧠 If this is a NEW field, start with DESC
        let newOrder;
        if (p.sortField !== field) {
          newOrder = "desc";
        } else {
          // Otherwise toggle between asc/desc
          newOrder = p.sortOrder === "asc" ? "desc" : "asc";
        }

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

  const scrollToBottom = (ref) => {
    if (ref?.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const [isWide, setIsWide] = useState(window.innerWidth >= 1400);

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 1400);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="bg-gray-50 pt-[90px]">
      
      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]">

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

      {/* ✅ Fullscreen Overlay */}
      {fullscreenSection && (
        <div className="fixed inset-0 bg-white z-50 rounded-xl shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col">
            <SectionToolbar title={
              fullscreenSection === "map"
                ? "Map View"
                : fullscreenSection === "summary"
                ? "Data Summary"
                : "Pivot Tables"
            }>
              <button
                onClick={() => setFullscreenSection(null)}
                className="px-3 py-2 rounded-md text-[#344e41] hover:text-[#3a5a40] transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </SectionToolbar>

            {/* ✅ Render the fullscreen content */}
            <div className="flex-1 overflow-y-auto p-6">
              {fullscreenSection === "map" && (
                <MapContainer
                  center={[
                    Number(filteredData[0][latitudeCol]),
                    Number(filteredData[0][longitudeCol]),
                  ]}
                  zoom={10}
                  scrollWheelZoom
                  className="h-full w-full rounded-none"
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
                  <ResetViewButton
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
              )}

              {fullscreenSection === "summary" && (
                <div>
                  {isConfigured && (
                    <div
                      className={`relative shadow-md border border-gray-200 bg-white flex flex-col overflow-y-auto transition-all duration-500 ${
                        fullscreenSection === "summary"
                          ? "absolute inset-0 z-20 h-full w-full p-6 bg-white shadow-lg "
                          : "h-[400px] lg:h-[calc(100vh-160px)]"
                      }`}
                    >
                      <SectionToolbar>
                        <div className="flex items-center justify-between mb-2 gap-3">
                          <p className="text-[15px] text-[#344e41] font-medium leading-none">
                            {selectedCols.length} items, {filteredData.length.toLocaleString()} rows loaded
                          </p>

                          <button
                            onClick={() => {
                              localStorage.removeItem("selectedColumns");
                              setShowConfigModal(true);
                            }}
                            className="flex items-center justify-center px-4 h-8 bg-[#344e41] text-white rounded-md hover:bg-[#3a5a40] transition-colors text-sm font-medium leading-none"
                          >
                            Change Columns
                          </button>
                        </div>
                      </SectionToolbar>
                      

                      {Object.entries(selectedChartData).map(([col, data]) => {
                        const total = data.length;
                        const coloredData = data.map((item, i) => ({
                          ...item,
                          color: getHSLColor(i, total),
                        }));
                        
                        return (
                          <div
                            key={col}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t pt-3 pb-6 shadow-sm"
                          >
                            <div className="col-span-full">
                              <h4 className="text-lg font-bold text-[#3a5a40] text-center">
                                {col}
                              </h4>
                            </div>

                            {/* 📊 Bar Chart */}
                            <div className="h-[320px] min-h-[300px] bg-white border border-gray-200 p-3">
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
                            <div className="h-[320px] min-h-[300px] bg-white rounded-md flex flex-col">
                              {/* inner container with padding to avoid scrolling through margins */}
                              <div className="flex-1 overflow-y-auto relative">
                                <table className="min-w-full text-sm border-collapse">
                                  <thead className="top-0 z-50">
                                    <tr className="bg-[#344e41] text-white shadow-sm">
                                      <th className="border border-[#2a3a32] px-3 py-2 text-left">Label</th>
                                      <th className="border border-[#2a3a32] px-3 py-2 text-center">Frequency</th>
                                      <th className="border border-[#2a3a32] px-3 py-2 text-center">Percentage</th>
                                    </tr>
                                  </thead>

                                  {/* Scrollable body */}
                                  <tbody className="z-10">
                                    {coloredData
                                      .map((item) => ({
                                        ...item,
                                        percentage: ((item.value / filteredData.length) * 100).toFixed(2),
                                      }))
                                      .sort((a, b) => b.value - a.value)
                                      .map((item, i) => (
                                        <tr
                                          key={i}
                                          className={`${
                                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                          } hover:bg-gray-100 transition-colors`}
                                        >
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

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {fullscreenSection === "pivot" && (
                <div>
                  <div
                    className={`relative rounded-xl shadow-md border border-gray-200 bg-whiteflex flex-col gap-8 overflow-y-auto ${
                      fullscreenSection === "pivot"
                        ? "absolute inset-0 z-20 h-full w-full p-6 bg-white shadow-lg rounded-xl"
                        : "h-[400px] lg:h-[calc(100vh-160px)]"
                    }`}
                  >
                    <SectionToolbar>
                      <button
                        onClick={() => setShowPivotModal(true)}
                        className="px-3 py-1 text-sm bg-[#344e41] text-white rounded-md hover:bg-[#3a5a40]"
                      >
                        Create Pivot Table

                      </button>
                    </SectionToolbar>
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
                          sortedRows.sort((a, b) => {
                            const aVal = a ?? "";
                            const bVal = b ?? "";

                            // numeric comparison if both are numbers
                            if (!isNaN(aVal) && !isNaN(bVal)) {
                              return pivot.sortOrder === "asc"
                                ? Number(aVal) - Number(bVal)
                                : Number(bVal) - Number(aVal);
                            }

                            // string fallback
                            return pivot.sortOrder === "asc"
                              ? String(aVal).localeCompare(String(bVal))
                              : String(bVal).localeCompare(String(aVal));
                          });
                        } else if (pivot.sortField === "total") {
                          sortedRows.sort((a, b) => {
                            const totalA = cols.reduce(
                              (sum, c) => sum + (Number(result[a]?.[c]) || 0),
                              0
                            );
                            const totalB = cols.reduce(
                              (sum, c) => sum + (Number(result[b]?.[c]) || 0),
                              0
                            );
                            return pivot.sortOrder === "asc"
                              ? totalA - totalB
                              : totalB - totalA;
                          });
                        } else {
                          sortedRows.sort((a, b) => {
                            const valA = Number(result[a]?.[pivot.sortField]) || 0;
                            const valB = Number(result[b]?.[pivot.sortField]) || 0;
                            return pivot.sortOrder === "asc"
                              ? valA - valB
                              : valB - valA;
                          });
                        }

                        return (
                          <div
                            key={pivot.id}
                            className="border-t pt-3 pb-5 bg-gray-50 rounded-lg shadow-sm mb-5"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-lg font-bold text-[#344e41] pl-4">
                                {pivot.row} × {pivot.col}
                              </h4>
                              <button
                                onClick={() => {
                                  setPivotConfigs((prev) => {
                                    const updated = prev.filter((p) => p.id !== pivot.id);

                                    // Auto-hide pivot section if last table is removed
                                    if (updated.length === 0) {
                                      setShowPivotSection(false);
                                    }

                                    return updated;
                                  });
                                }}

                                className="flex items-center justify-center w-8 h-8 rounded-full text-[#344e41] hover:text-[#3a5a40] hover:text-white"
                                title="Remove Pivot Table"
                              >
                                ✕
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
                                        (pivot.sortOrder === "asc" ? " ▲" : " ▼")}
                                    </th>
                                    {cols.map((c) => (
                                      <th
                                        key={c}
                                        className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                                        onClick={() => handlePivotSort(pivot.id, c)}
                                      >
                                        {c}
                                        {pivot.sortField === c &&
                                          (pivot.sortOrder === "asc" ? " ▲" : " ▼")}
                                      </th>
                                    ))}
                                    <th
                                      className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                                      onClick={() => handlePivotSort(pivot.id, "total")}
                                    >
                                      Row Total
                                      {pivot.sortField === "total" &&
                                        (pivot.sortOrder === "asc" ? " ▲" : " ▼")}
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
              )}
            </div>
          </div>
        </div>
      )}
      {/* Pivot Creator */}
      {showPivotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
          <div className="bg-white w-[90%] max-w-[500px] p-6 rounded-lg shadow-xl border border-gray-200">

            <h3 className="text-xl font-bold text-[#344e41] mb-4 text-center">
              Create Pivot Table
            </h3>

            <div className="flex flex-col gap-4">

              {/* Row Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Row Field</label>
                <select
                  value={pivotRow}
                  onChange={(e) => setPivotRow(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">Select Row Field</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Column Field */}
              <div>
                <label className="text-sm font-medium text-gray-700">Column Field</label>
                <select
                  value={pivotCol}
                  onChange={(e) => setPivotCol(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                >
                  <option value="">Select Column Field</option>
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPivotModal(false);
                  setPivotRow("");
                  setPivotCol("");
                }}
                className="px-4 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  generatePivotTable();
                  setShowPivotModal(false);
                }}
                className="px-5 py-2 rounded-md bg-[#3a5a40] text-white font-medium hover:bg-[#588157]"
              >
                Generate Pivot
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="relative grid gap-2 px-6 lg:px-10 pb-6 mx-auto max-w-[1920px]"
        style={{
          gridTemplateColumns: isWide
            ? showPivotSection
              ? "30% 40% 30%"
              : "30% 70%"
            : "1fr",
        }}
      >


        {/* Map Section */}
        <div
          className={`relative rounded-xl shadow-md border border-gray-200 bg-white overflow-hidden flex flex-col ${
            fullscreenSection === "map"
              ? "absolute inset-0 z-20 h-full w-full p-6 bg-white shadow-lg rounded-xl"
              : "h-[400px] lg:h-[calc(100vh-160px)]"
          }`}
        >
          <SectionToolbar title="Map View">
            <button
              onClick={() => toggleFullscreen("map")}
              className="flex items-center justify-center w-9 h-7 text-[#344e41] rounded-md hover:text-[#3a5a40] transition-colors"
              title={fullscreenSection === "map" ? "Exit Fullscreen" : "Fullscreen"}
            >
              {fullscreenSection === "map" ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
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
              className="h-full w-full rounded-none"
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
                <ResetViewButton
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
            ref={summaryRef}
            className={`relative rounded-xl shadow-md border border-gray-200 bg-white flex flex-col overflow-y-auto  ${
              fullscreenSection === "summary"
                ? "absolute inset-0 z-20 h-full w-full p-6 bg-white shadow-lg rounded-xl"
                : "h-[400px] lg:h-[calc(100vh-160px)]"
            }`}
          >
            <SectionToolbar title="Data Summary">
              <button
                onClick={() => {
                  localStorage.removeItem("selectedColumns");
                  setShowConfigModal(true);
                }}
                className="flex items-center justify-center px-4 h-7 bg-[#344e41] text-white rounded-md hover:bg-[#3a5a40] transition-colors text-sm font-medium"
                title="Change Columns"
              >
                Change Columns
              </button>
              {/* Show only if pivot section is HIDDEN */}
              {!showPivotSection && (
                <button
                  onClick={() => setShowPivotModal(true)}
                  className="flex items-center justify-center px-4 h-7 bg-[#344e41] text-white rounded-md hover:bg-[#3a5a40] transition-colors text-sm font-medium"
                >
                  Create Pivot Table
                </button>
              )}

              <button
                onClick={() => toggleFullscreen("summary")}
                className="flex items-center justify-center w-9 h-7 text-[#344e41] rounded-md hover:text-[#3a5a40] transition-colors"
                title={fullscreenSection === "summary" ? "Exit Fullscreen" : "Fullscreen"}
              >
                {fullscreenSection === "summary" ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </SectionToolbar>
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <h3 className="text-base font-normal font-bold text-[#344e41] flex items-center gap-3 pl-4">
                {selectedCols.length} items, {filteredData.length.toLocaleString()} rows loaded
              </h3>
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
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t pt-3 pb-6 bg-gray-50 shadow-sm"
                >
                  <div className="col-span-full">
                    <h4 className="text-m font-semibold text-[#2f3e34] text-center">
                      {col}
                    </h4>
                  </div>

                  {/* Bar Chart */}
                  <div className="h-[320px] min-h-[300px] bg-white border border-gray-200 p-3">
                    <ResponsiveContainer width="100%" height="100%" minWidth={250} minHeight={250}>
                    <BarChart
                      data={[...coloredData].sort((a, b) => b.value - a.value)}
                      margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        hide={false}              // shows the X-axis line
                        tick={false}              // hides the labels
                        axisLine={{ stroke: "#333", strokeWidth: 1.5 }}  
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#333" }} width={40} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload; // actual data object from your bar
                            return (
                              <div className="p-2 bg-white border border-gray-300 text-xs shadow-md">
                                <p className="font-semibold text-[#3a5a40]">{d.name}</p> 
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

                  {/* Frequency Table */}
                  <div className="h-[320px] min-h-[300px] bg-white flex flex-col">
                    <div className="flex-1 overflow-y-auto relative">
                      <table className="min-w-full text-sm border-collapse">
                        <thead className="top-0 z-50">
                          <tr className="bg-[#344e41] text-white shadow-sm">
                            <th className="border border-[#2a3a32] px-3 py-2 text-left">Label</th>
                            <th className="border border-[#2a3a32] px-3 py-2 text-center">Frequency</th>
                            <th className="border border-[#2a3a32] px-3 py-2 text-center">Percentage</th>
                          </tr>
                        </thead>

                        {/* Scrollable body */}
                        <tbody className="z-10">
                          {coloredData
                            .map((item) => ({
                              ...item,
                              percentage: ((item.value / filteredData.length) * 100).toFixed(2),
                            }))
                            .sort((a, b) => b.value - a.value)
                            .map((item, i) => (
                              <tr
                                key={i}
                                className={`${
                                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                                } hover:bg-gray-100 transition-colors`}
                              >
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

                
                </div>
              );
            })}

          </div>
        )}

        {/* Pivot Tables Column */}
        {showPivotSection && (
          <div
            ref={pivotRef}
            className={`relative rounded-xl shadow-md border border-gray-200 bg-whiteflex flex-col gap-8 overflow-y-auto ${
              fullscreenSection === "pivot"
                ? "absolute inset-0 z-20 h-full w-full p-6 bg-white shadow-lg rounded-xl"
                : "h-[400px] lg:h-[calc(100vh-160px)]"
            }`}
          >
            <SectionToolbar title="Pivot Tables">
              <button
                onClick={() => setShowPivotModal(true)}
                className="flex items-center justify-center px-4 h-7 bg-[#344e41] text-white rounded-md hover:bg-[#3a5a40] transition-colors text-sm font-medium"
              >
                Create Pivot Table
              </button>
              <button
                onClick={() => toggleFullscreen("pivot")}
                className="flex items-center justify-center w-9 h-7 text-[#344e41] rounded-md hover:text-[#3a5a40] transition-colors"
                title={fullscreenSection === "pivot" ? "Exit Fullscreen" : "Fullscreen"}
              >
                {fullscreenSection === "pivot" ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </SectionToolbar>

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
                  sortedRows.sort((a, b) => {
                    const aVal = a ?? "";
                    const bVal = b ?? "";

                    // numeric comparison if both are numbers
                    if (!isNaN(aVal) && !isNaN(bVal)) {
                      return pivot.sortOrder === "asc"
                        ? Number(aVal) - Number(bVal)
                        : Number(bVal) - Number(aVal);
                    }

                    // string fallback
                    return pivot.sortOrder === "asc"
                      ? String(aVal).localeCompare(String(bVal))
                      : String(bVal).localeCompare(String(aVal));
                  });
                } else if (pivot.sortField === "total") {
                  sortedRows.sort((a, b) => {
                    const totalA = cols.reduce(
                      (sum, c) => sum + (Number(result[a]?.[c]) || 0),
                      0
                    );
                    const totalB = cols.reduce(
                      (sum, c) => sum + (Number(result[b]?.[c]) || 0),
                      0
                    );
                    return pivot.sortOrder === "asc"
                      ? totalA - totalB
                      : totalB - totalA;
                  });
                } else {
                  sortedRows.sort((a, b) => {
                    const valA = Number(result[a]?.[pivot.sortField]) || 0;
                    const valB = Number(result[b]?.[pivot.sortField]) || 0;
                    return pivot.sortOrder === "asc"
                      ? valA - valB
                      : valB - valA;
                  });
                }

                return (
                  <div
                    key={pivot.id}
                    className="border-t pt-3 pb-5 bg-gray-50 rounded-lg shadow-sm mb-5"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-m font-semibold text-[#2f3e34] mb-2 pl-4 ">
                        {pivot.row} × {pivot.col}
                      </h4>
                      <button
                        onClick={() => {
                          setPivotConfigs((prev) => {
                            const updated = prev.filter((p) => p.id !== pivot.id);

                            // Auto-hide pivot section if last table is removed
                            if (updated.length === 0) {
                              setShowPivotSection(false);
                            }

                            return updated;
                          });
                        }}

                        className="flex items-center justify-center w-8 h-8 rounded-full text-[#344e41] hover:text-[#3a5a40] hover:text-white"
                        title="Remove Pivot Table"
                      >
                        ✕
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
                                (pivot.sortOrder === "asc" ? " ▲" : " ▼")}
                            </th>
                            {cols.map((c) => (
                              <th
                                key={c}
                                className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                                onClick={() => handlePivotSort(pivot.id, c)}
                              >
                                {c}
                                {pivot.sortField === c &&
                                  (pivot.sortOrder === "asc" ? " ▲" : " ▼")}
                              </th>
                            ))}
                            <th
                              className="border px-3 py-2 cursor-pointer hover:bg-[#588157]"
                              onClick={() => handlePivotSort(pivot.id, "total")}
                            >
                              Row Total
                              {pivot.sortField === "total" &&
                                (pivot.sortOrder === "asc" ? " ▲" : " ▼")}
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
        )}

      </div>

      {/* Modal for Point Details */}
      {showPointModal && pointData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]">

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
