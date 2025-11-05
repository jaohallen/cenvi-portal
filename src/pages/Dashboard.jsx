import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

  // ✅ File upload
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

    const valid = data
      .filter(
        (row) =>
          row[latitudeCol] &&
          row[longitudeCol] &&
          !isNaN(Number(row[latitudeCol])) &&
          !isNaN(Number(row[longitudeCol]))
      )
      .map((row, index) => ({ __id: index + 1, ...row }));

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
          <div className="bg-white rounded-lg p-6 w-[90%] md:w-[700px] shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#3a5a40] mb-4 text-center">
              File Configuration
            </h3>

            {/* Column Selector */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Latitude Column
                </label>
                <select
                  value={latitudeCol}
                  onChange={(e) => setLatitudeCol(e.target.value)}
                  className="border p-2 rounded-md w-40"
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
                <label className="block text-sm font-medium mb-1">
                  Longitude Column
                </label>
                <select
                  value={longitudeCol}
                  onChange={(e) => setLongitudeCol(e.target.value)}
                  className="border p-2 rounded-md w-40"
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
            <div className="border p-2 rounded-md max-h-[200px] overflow-y-auto mb-4">
              {headers.map((h) => (
                <div key={h} className="flex items-center mb-2 space-x-2">
                  <input
                    type="checkbox"
                    checked={columnsToDisplay.includes(h)}
                    onChange={() => handleToggleColumn(h)}
                  />
                  <span className="w-32 text-sm">{getRenamedHeader(h)}</span>
                  <input
                    type="text"
                    placeholder="Rename"
                    value={renamedColumns[h] || ""}
                    onChange={(e) => handleRenameColumn(h, e.target.value)}
                    className="border p-1 rounded-md text-sm w-40"
                  />
                </div>
              ))}
            </div>

            {/* Preview Table */}
            {data.length > 0 && (
              <div className="border rounded-md p-2 bg-gray-50 mb-4">
                <h5 className="font-semibold mb-2 text-sm text-[#3a5a40]">
                  Preview (first 5 rows)
                </h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        {headers.map((h) => (
                          <th key={h} className="border px-2 py-1 text-left">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {headers.map((h) => (
                            <td
                              key={h}
                              className="border px-2 py-1 break-words max-w-[150px]"
                            >
                              {row[h]?.toString() || ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
                        1
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
                            padding: "1px 5px",
                            color: "#3a5a40",
                            fontWeight: "bold",
                            fontSize: "13px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.25)",
                        }}
                        >
                        <span style={{ fontSize: "18px", marginRight: "3px" }}>+</span>5
                        </div>
                        <span>Clustered Points</span>
                    </div>
                    </div>
                </div>
                </MapContainer>

            </div>
          </div>
        
          {/* Selected Point Info */}
          {selectedPoint && (
            <div className="flex justify-center">
              <div className="w-full max-w-5xl border rounded-xl p-5 mb-6 bg-white shadow">
                <h3 className="text-lg font-bold text-[#3a5a40] mb-3">
                  Selected Point – ID {selectedPoint.__id}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 text-sm table-fixed">
                    <tbody>
                      {columnsToDisplay
                        .filter((c) => c !== "__id")
                        .map((h) => (
                          <tr key={h}>
                            <td className="border px-3 py-1 font-semibold bg-gray-50 w-1/4">
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
              </div>
            </div>
          )}

          {/* Left-aligned Button */}
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-5xl flex justify-start">
              <button
                onClick={handleOpenFullTable}
                className="px-4 py-2 bg-[#588157] text-white rounded-md hover:bg-[#3a5a40]"
              >
                View Full Table
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
