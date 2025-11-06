import React, { useState, useEffect } from "react";
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { value, frequency, percentage } = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          border: "1px solid #ccc",
          padding: "8px 12px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <p style={{ margin: 0, fontWeight: "bold", color: "#344e41" }}>
          {value}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
          Frequency: {frequency}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [latitudeCol, setLatitudeCol] = useState("");
  const [longitudeCol, setLongitudeCol] = useState("");
  const [columnsToDisplay, setColumnsToDisplay] = useState([]);
  const [renamedColumns, setRenamedColumns] = useState({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [fileName, setFileName] = useState("dataset.csv");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedSummaryCols, setSelectedSummaryCols] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [valueRows, setValueRows] = useState([]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSelectedValue(null);
        setValueRows([]);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);


  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          alert("The CSV file is empty or unreadable.");
          return;
        }

        const cleaned = result.data.map((row) => {
          const r = {};
          Object.keys(row).forEach((key) => {
            r[key.trim()] = row[key];
          });
          return r;
        });

        const cols = Object.keys(cleaned[0] || {});
        setHeaders(cols);
        setColumnsToDisplay(cols);
        setData(cleaned);
        setShowConfigModal(true);
      },
      error: (err) => alert("Error reading CSV: " + err.message),
    });

    e.target.value = "";
  };

  const handleToggleColumn = (col) => {
    setColumnsToDisplay((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleRenameColumn = (col, newName) => {
    setRenamedColumns((prev) => ({ ...prev, [col]: newName }));
  };

  const getRenamedHeader = (col) => renamedColumns[col] || col;

  const handleConfirmConfiguration = () => {
    if (!latitudeCol || !longitudeCol) {
      alert("Please select both latitude and longitude columns.");
      return;
    }

    // ✅ Detect numeric columns based on available data
    const numericColumns = new Set();
    headers.forEach((col) => {
      const firstNonEmpty = data.find(
        (r) => r[col] !== null && r[col] !== undefined && r[col] !== ""
      );
      if (firstNonEmpty && !isNaN(Number(firstNonEmpty[col]))) {
        numericColumns.add(col);
      }
    });

    // ✅ Clean and normalize all rows
    const valid = data
      .filter(
        (row) =>
          row[latitudeCol] &&
          row[longitudeCol] &&
          !isNaN(Number(row[latitudeCol])) &&
          !isNaN(Number(row[longitudeCol]))
      )
      .map((row, index) => {
        const cleanedRow = { __id: index + 1 };

        Object.keys(row).forEach((key) => {
          let value = row[key];

          // Convert missing/empty values appropriately
          if (value === null || value === undefined || value === "") {
            value = numericColumns.has(key) ? 0 : "null";
          }

          // Ensure numeric consistency
          if (numericColumns.has(key)) {
            value = isNaN(Number(value)) ? 0 : Number(value);
          }

          cleanedRow[key] = value;
        });

        return cleanedRow;
      });

    if (valid.length === 0) {
      alert("No valid rows with coordinates found.");
      return;
    }

    setFilteredData(valid);
    setHeaders(["__id", ...headers]);
    setColumnsToDisplay(["__id", ...columnsToDisplay]);
    setShowConfigModal(false);
    setIsConfigured(true);
  };

  const handleCancelConfiguration = () => {
    setShowConfigModal(false);
    setData([]);
    setHeaders([]);
    setIsConfigured(false);
  };

  const handleOpenFullTable = () => {
    const csvData = Papa.unparse(
      filteredData.map((row) => {
        const newRow = {};
        columnsToDisplay.forEach((h) => {
          newRow[getRenamedHeader(h)] = row[h];
        });
        return newRow;
      })
    );

    const newTab = window.open("", "_blank");
    const tableHTML = `
      <html>
        <head>
          <title>${fileName}</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h2 { color: #3a5a40; }
            table { border-collapse: collapse; width: 100%; word-wrap: break-word; table-layout: fixed; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; }
            button { background: #3a5a40; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; margin-bottom: 10px; }
            button:hover { background: #588157; }
          </style>
        </head>
        <body>
          <h2>${fileName}</h2>
          <button id="downloadBtn">Export CSV</button>
          <table>
            <thead><tr>${columnsToDisplay
              .map((h) => `<th>${getRenamedHeader(h)}</th>`)
              .join("")}</tr></thead>
            <tbody>${filteredData
              .map(
                (row) =>
                  `<tr>${columnsToDisplay
                    .map((h) => `<td>${row[h] ?? ""}</td>`)
                    .join("")}</tr>`
              )
              .join("")}</tbody>
          </table>
          <script>
            document.getElementById('downloadBtn').addEventListener('click', () => {
              const csv = \`${csvData.replace(/`/g, "\\`")}\`;
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', '${fileName}');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            });
          </script>
        </body>
      </html>`;
    newTab.document.write(tableHTML);
    newTab.document.close();
  };

  const createNumberIcon = (id) =>
    L.divIcon({
      html: `<div style="background-color:#3a5a40;color:white;border-radius:50%;width:34px;height:34px;font-size:15px;display:flex;align-items:center;justify-content:center;font-weight:bold;border:2px solid white;box-shadow:0 0 3px rgba(0,0,0,0.4);">${id}</div>`,
      className: "",
      iconSize: [30, 30],
    });

    const createClusterCustomIcon = (cluster) => {
    const count = cluster.getChildCount();

    return L.divIcon({
        html: `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: row;
            background: rgba(255, 255, 255, 0.9);
            border: 2px solid #344e41;
            border-radius: 12px;
            padding: 6px 10px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            color: #3a5a40;
            font-weight: bold;
            font-size: 16px;
        ">
            <span style="font-size: 22px; font-weight: 900; margin-right: 4px;">+</span>
            <span>${count}</span>
        </div>
        `,
        className: "custom-cluster-plus",
        iconSize: [50, 40],
    });
    };
  
  const getSummaryData = (col) => {
    const freq = {};
    filteredData.forEach((row) => {
      const val = row[col] || "—";
      freq[val] = (freq[val] || 0) + 1;
    });
    return Object.entries(freq).map(([value, count]) => ({
      value,
      frequency: count,
      percentage: ((count / filteredData.length) * 100).toFixed(2),
    }));
  };

  const toggleSummaryColumn = (col) => {
    setSelectedSummaryCols((prev) =>
      prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col]
    );
  };

  return (
    <div className="pt-20 p-6 relative">
      {/* Header */}
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mt-10 mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          Data Dashboard
        </span>
      </h2>

      <div className="mb-8 text-center text-gray-700 text-lg mx-auto leading-relaxed">
        <p>Upload your CSV file to visualize your data in a map.</p>
      </div>

      {/* File Upload */}
      <div className="flex justify-center items-center mb-10 z-10 relative">
        <label
          htmlFor="fileInput"
          className="px-6 py-3 bg-[#3a5a40] text-white rounded-md shadow-md cursor-pointer hover:bg-[#588157] transition"
        >
          Choose CSV File
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* ✅ File Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-8 w-[95%] md:w-[900px] lg:w-[1100px] shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#3a5a40] mb-4 text-center">
              File Configuration
            </h3>

            {/* Column Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude Column</label>
                <select
                  value={latitudeCol}
                  onChange={(e) => setLatitudeCol(e.target.value)}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Select</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Longitude Column</label>
                <select
                  value={longitudeCol}
                  onChange={(e) => setLongitudeCol(e.target.value)}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Select</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            {/* Select & Rename Columns */}
            <h4 className="text-md font-semibold mb-2">
              Select & Rename Columns
            </h4>
            <div className="border p-3 rounded-md max-h-[250px] overflow-y-auto mb-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {headers.map((h) => (
                <div key={h} className="flex items-center justify-between gap-2 w-full">
                  {/* Checkbox + Label */}
                  <div className="flex items-center gap-2 w-1/2 min-w-0">
                    <input
                      type="checkbox"
                      checked={columnsToDisplay.includes(h)}
                      onChange={() => handleToggleColumn(h)}
                      className="flex-shrink-0"
                    />
                    <span
                      className="text-sm truncate"
                      title={getRenamedHeader(h)}
                    >
                      {getRenamedHeader(h)}
                    </span>
                  </div>

                  {/* Rename Input */}
                  <input
                    type="text"
                    placeholder="Rename"
                    value={renamedColumns[h] || ""}
                    onChange={(e) => handleRenameColumn(h, e.target.value)}
                    className="border p-1 rounded-md text-sm w-1/2"
                  />
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelConfiguration}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmConfiguration}
                className="px-4 py-2 bg-[#3a5a40] text-white rounded-md hover:bg-[#588157]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}  

      {/* ✅ Map & Table */}
      {isConfigured && filteredData.length > 0 && (
        <>
          {/* Uploaded File Info — One Liner, Responsive */}
          <div className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-sm sm:text-base mt-8 mb-4 px-4 leading-snug">
            <div className="flex flex-wrap items-center gap-2 text-[#344e41] font-medium">
              <span className="truncate max-w-[100%] sm:max-w-[60%] md:max-w-[70%]">
                Uploaded file:
              </span>
              <button
                onClick={handleOpenFullTable}
                className="text-[#3a5a40] underline hover:text-[#588157] transition break-words text-left w-full sm:w-auto"
              >
                {fileName}
              </button>
            </div>

            {filteredData.length > 0 && (
              <span className="text-gray-600 whitespace-nowrap">
                {filteredData.length} record{filteredData.length !== 1 ? "s" : ""} loaded
              </span>
            )}
          </div>      
          {/* Map */}
          <div className="flex justify-center mt-8 mb-6">
            <div className="w-full max-w-7xl rounded-xl overflow-hidden shadow-md relative z-10">
              <MapContainer
                center={[
                    Number(filteredData[0][latitudeCol]),
                    Number(filteredData[0][longitudeCol]),
                ]}
                zoom={10}
                scrollWheelZoom
                className="h-[520px] w-full"
                style={{ zIndex: 1, position: "relative" }}
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
                    spiderfyOnMaxZoom={true}
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
                        eventHandlers={{ click: () => setSelectedPoint(row) }}
                    />
                    ))}
                </MarkerClusterGroup>

                {/* ✅ Floating Legend */}
                <div
                    className="leaflet-top leaflet-right"
                    style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 999,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "rgba(255,255,255,0.50)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            border: "1px solid #ccc",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            fontSize: "13px",
                            color: "#333",
                        }}
                    >
                    Legend
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                        style={{
                            backgroundColor: "#3a5a40",
                            color: "white",
                            borderRadius: "50%",
                            width: "30px",
                            height: "30px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "bold",
                            border: "1.5px solid white",
                            boxShadow: "0 0 3px rgba(0,0,0,0.3)",
                        }}
                        >
                    
                        </div>
                        <span>Individual Point</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.9)",
                            border: "2px solid #344e41",
                            borderRadius: "12px",
                            padding: "1px 8px",
                            color: "#3a5a40",
                            fontWeight: "bold",
                            fontSize: "13px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
                        }}
                        >
                        <span style={{ fontSize: "15px"}}>+</span>
                        </div>
                        <span>Clustered Points</span>
                    </div>
                    </div>
                </div>
                </MapContainer>

            </div>
          </div>

          {/* Summary Dashboard + Selected Point Info side-by-side */}
          <div className="w-full max-w-7xl mx-auto mt-10 mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SUMMARY DASHBOARD */}
            <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col">
              <h3 className="text-lg font-bold text-[#344e41] mb-6 text-center">
                Summary Dashboard
              </h3>

              {/* Column Selector (Dropdown) */}
              <div className="flex justify-center mb-6">
                <select
                  value={selectedSummaryCols[0] || ""}
                  onChange={(e) => {
                    setSelectedSummaryCols([e.target.value]);
                    setShowAll(false); // reset when switching columns
                  }}
                  className="border rounded-md px-4 py-2 text-sm min-w-[200px] md:min-w-[250px] lg:min-w-[300px] max-w-full"
                  style={{
                    width: "auto",
                    maxWidth: "100%",
                  }}
                >
                  <option value="">Select Column to Summarize</option>
                  {columnsToDisplay
                    .filter((h) => h !== "__id" && h !== latitudeCol && h !== longitudeCol)
                    .map((col) => (
                      <option key={col} value={col}>
                        {getRenamedHeader(col)}
                      </option>
                    ))}
                </select>
              </div>

              {/* Chart + Frequency Table */}
              {selectedSummaryCols[0] && (() => {
                const col = selectedSummaryCols[0];
                const summary = getSummaryData(col).sort((a, b) => b.frequency - a.frequency);
                const visibleData = showAll ? summary : summary.slice(0, 15);

                return (
                  <>
                    <h4 className="text-lg font-semibold text-[#3a5a40] mb-4 text-center">
                      {getRenamedHeader(col)}
                    </h4>

                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={visibleData} margin={{ top: 10, right: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="value"
                          hide
                          tick={{ fontSize: 12, fill: "#333" }}
                        />
                        <YAxis
                          domain={[0, "dataMax + 5"]}
                          tick={{ fontSize: 12, fill: "#333" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="frequency"
                          onClick={(data) => {
                            const clickedValue = data.payload.value;
                            setSelectedValue(clickedValue);

                            const col = selectedSummaryCols[0];

                            const rows = filteredData.filter((r) => {
                              const cell = r[col];
                              const isNumeric = !isNaN(Number(clickedValue)) && !isNaN(Number(cell));
                              return isNumeric
                                ? Number(cell) === Number(clickedValue)
                                : String(cell) === String(clickedValue);
                            });

                            setValueRows(rows);
                          }}
                        >

                          {visibleData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`hsl(${(index * 45) % 360}, 70%, 55%)`}
                              style={{ cursor: "pointer" }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Summary Table with Color Legend */}
                    <div className="overflow-x-auto mt-6">
                      <table className="min-w-full border border-gray-300 text-sm">
                        <thead className="bg-[#344e41] text-white">
                          <tr>
                            <th className="border px-3 py-2 text-left">Value</th>
                            <th className="border px-3 py-2 text-center">Frequency</th>
                            <th className="border px-3 py-2 text-center">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleData.map((item, index) => (
                            <tr
                              key={item.value}
                              onClick={() => {
                                setSelectedValue(item.value);
                                const col = selectedSummaryCols[0];

                                const rows = filteredData.filter((r) => {
                                  const cell = r[col];
                                  const isNumeric = !isNaN(Number(item.value)) && !isNaN(Number(cell));
                                  return isNumeric
                                    ? Number(cell) === Number(item.value)
                                    : String(cell) === String(item.value);
                                });

                                setValueRows(rows);
                              }}
                              className="cursor-pointer hover:bg-gray-100 transition"
                            >
                              <td className="border px-3 py-2 flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-sm flex-shrink-0"
                                  style={{
                                    backgroundColor: `hsl(${(index * 45) % 360}, 70%, 55%)`,
                                  }}
                                ></div>
                                <span className="truncate" title={item.value}>
                                  {item.value}
                                </span>
                              </td>
                              <td className="border px-3 py-2 text-center">{item.frequency}</td>
                              <td className="border px-3 py-2 text-center">{item.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Show All / Show Less Button */}
                    {summary.length > 15 && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAll((prev) => !prev)}
                          className="px-4 py-2 bg-[#3a5a40] text-white rounded-md hover:bg-[#588157] transition"
                        >
                          {showAll ? "Show Less" : `Show All (${summary.length})`}
                        </button>
                      </div>
                    )}
                    
                    {selectedValue && (
                      <div
                        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                      >
                        <div
                          className="bg-white rounded-lg shadow-2xl w-[90%] max-w-[1200px] max-h-[90vh] flex flex-col"
                        >
                          {/* Header */}
                          <div className="flex justify-between items-center px-6 py-4 border-b bg-white sticky top-0 z-10">
                            <h4 className="text-lg font-bold text-[#344e41]">
                              Rows containing: “{selectedValue}”
                              <span className="text-gray-600 font-normal">
                                {" "}
                                ({valueRows.length} {valueRows.length === 1 ? "result" : "results"})
                              </span>
                            </h4>

                            {/* Footer */}
                            <div className="px-2 py-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedValue(null);
                                  setValueRows([]);
                                }}
                                className="px-4 py-2 text-white bg-[#3a5a40] rounded-md hover:bg-[#588157] transition"
                              >
                                Close
                              </button>
                            </div>
                          </div>

                          {/* Scrollable Table Section */}
                          <div className="flex-grow overflow-y-auto px-6 py-4">
                            {valueRows.length > 0 ? (
                              <div className="overflow-x-auto border rounded-lg shadow-sm">
                                {/* ✅ Scrollable table body container */}
                                <div className="max-h-[60vh] overflow-y-auto">
                                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                    <thead className="bg-[#3a5a40] text-white sticky top-0 z-10">
                                      <tr>
                                        {columnsToDisplay
                                          .filter((h) => h !== "__id")
                                          .map((col) => (
                                            <th
                                              key={col}
                                              className="border px-3 py-2 text-left whitespace-normal break-words sticky top-0 bg-[#3a5a40] text-white align-top"
                                              style={{
                                                zIndex: 20,
                                                lineHeight: "1.2em",
                                                maxWidth: "220px", // optional — prevents very wide headers
                                                whiteSpace: "normal", // allows multi-line
                                              }}
                                            >
                                              {getRenamedHeader(col)}
                                            </th>

                                          ))}
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {valueRows.map((row, i) => (
                                        <tr
                                          key={i}
                                          className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                        >
                                          {columnsToDisplay
                                            .filter((h) => h !== "__id")
                                            .map((col) => (
                                              <td
                                                key={col}
                                                className="border px-3 py-1 align-top break-words whitespace-normal"
                                                style={{
                                                  maxWidth: "300px",
                                                  verticalAlign: "top",
                                                }}
                                              >
                                                {row[col]?.toString() || "—"}
                                              </td>
                                            ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                            ) : (
                              <p className="text-center text-gray-600 italic">
                                No matching rows found for “{selectedValue}”.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                  </>
                );
              })()}
            </div>

            {/* SELECTED POINT INFO */}
            <div className="bg-white rounded-xl shadow-md p-6 border flex flex-col h-fit min-h-[250px]">
              <h3 className="text-lg font-bold text-[#3a5a40] mb-3 text-center">
                {selectedPoint
                  ? `Selected Point – ID ${selectedPoint.__id}`
                  : "Selected Point"}
              </h3>

              {selectedPoint ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm table-fixed">
                    <tbody>
                      {columnsToDisplay
                        .filter((c) => c !== "__id")
                        .map((h) => (
                          <tr key={h}>
                            <td className="border px-3 py-1 font-semibold bg-gray-50 w-1/3">
                              {getRenamedHeader(h)}
                            </td>
                            <td className="border px-3 py-1 break-words max-w-[400px]">
                              {selectedPoint[h]?.toString() || "—"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-8 italic">
                  Click a point on the map to view details here.
                </p>
              )}
            </div>
          </div>



        </>
      )}
    </div>
  );
};

export default Dashboard;
