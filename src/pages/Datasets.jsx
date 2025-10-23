import React, { useEffect, useState } from "react";
import DatasetCard from "../components/DatasetCard";
import DatasetPreviewModal from "../components/DatasetPreviewModal";

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [downloadType, setDownloadType] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedField, setCopiedField] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const email = "upcebunicer@gmail.com";
  const phone = "+63 912 345 6789";

  // ✅ Fetch datasets from Google Sheets
  useEffect(() => {
    const SHEET_JSON_URL =
      "https://script.google.com/macros/s/AKfycbyYEz7bD0eW5W24rBkw7rJUywF5QFehnXX_sImKWMV8vArhlsZpZEPhuWa0Tks_49FOVQ/exec";

    setLoading(true);
    fetch(SHEET_JSON_URL)
      .then((res) => res.json())
      .then((data) => {
        const sheetData = data.datasets || [];
        setDatasets(sheetData);
        setFiltered(sheetData);
      })
      .catch((err) => console.error("Error loading datasets from sheet:", err))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Dynamic dropdown options
  const categories = ["All", ...new Set(datasets.map((d) => d.category))];
  const downloadTypes = [
    "All",
    ...Array.from(
      new Set(
        datasets
          .flatMap((d) =>
            (d.available_download || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          )
      )
    ),
  ];

  useEffect(() => {
    let result = datasets;

    // Filter by category
    if (category !== "All") {
      result = result.filter((d) => d.category === category);
    }

    // Filter by download type
    if (downloadType !== "All") {
      result = result.filter((d) =>
        (d.available_download || "")
          .toLowerCase()
          .split(",")
          .map((t) => t.trim())
          .includes(downloadType.toLowerCase())
      );
    }

    // ✅ Case-insensitive search (matches start of words in name or description)
    if (search) {
      const query = search.trim().toLowerCase();
      const regex = new RegExp(`\\b${query}`, "i"); // "i" makes it case-insensitive
      result = result.filter(
        (d) =>
          regex.test((d.name || "").toLowerCase()) ||
          regex.test((d.description || "").toLowerCase())
      );
    }

    setFiltered(result);
  }, [category, downloadType, search, datasets]);


  // ✅ Prevent scroll when contact modal open
  useEffect(() => {
    document.body.style.overflow = showContactModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showContactModal]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  };

  const filtersActive = category !== "All" || downloadType !== "All";

  return (
    <div className="pt-20 p-6 relative">
      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mt-10 mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          CENVI Datasets Repository
        </span>
      </h2>

      {/* Disclaimer */}
      <div className="mb-8 text-center text-gray-700 text-lg mx-auto leading-relaxed">
        <p className="mb-2">
          The maps and datasets shown below are <strong>preview images only</strong> to
          illustrate the available geospatial products developed by CENVI.
        </p>
        <p>
          If you wish to request access to the actual datasets (.shp, .tiff, etc.),
          please{" "}
          <button
            onClick={() => setShowContactModal(true)}
            className="text-[#3a5a40] font-semibold hover:underline hover:text-[#588157] transition bg-transparent border-none cursor-pointer p-0"
          >
            contact our office
          </button>.
        </p>
      </div>

      {/* Sticky Accordion Toggle (Mobile Only) */}
      <div className="lg:hidden sticky top-[70px] z-40 flex justify-center mb-4 bg-white/80 backdrop-blur-md py-2 shadow-sm rounded-lg">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-[#3a5a40] hover:bg-[#588157] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
        </button>
      </div>

      {/* ✅ Filters Section */}
      <div
        className={`transition-all duration-300 ${
          showFilters ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 lg:opacity-100"
        } overflow-hidden lg:max-h-none lg:opacity-100 flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-4 mb-8 mx-auto w-full max-w-5xl justify-center px-4 sm:px-6`}
      >

        {/* Search */}
        <div className="w-full lg:w-1/3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="🔍 Search dataset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full px-5 sm:px-6 py-2 rounded-lg border text-gray-700 placeholder-gray-500 pr-10 h-[44px] box-border ${
                search
                  ? "border-[#3a5a40] bg-white"
                  : "border-gray-300 bg-gray-100"
              }`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#588157] text-lg font-bold"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="w-full lg:w-1/4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-5 sm:px-6 py-2 h-[44px] rounded-lg border text-gray-700 placeholder-gray-500 box-border ${
              category !== "All"
                ? "font-semibold text-[#3a5a40]"
                : "font-normal border-gray-300 bg-gray-100"
            }`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Download Type */}
        <div className="w-full lg:w-1/4">
          <select
            value={downloadType}
            onChange={(e) => setDownloadType(e.target.value)}
            className={`w-full px-5 sm:px-6 py-2 h-[44px] rounded-lg border text-gray-700 placeholder-gray-500 box-border ${
              downloadType !== "All"
                ? "font-semibold text-[#3a5a40]"
                : "font-normal border-gray-300 bg-gray-100"
            }`}
          >
            {downloadTypes.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All file types" : t || "Unspecified"}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Clear Filters */}
        {filtersActive && (
          <div className="flex justify-center lg:justify-start items-end flex-shrink-0 w-full lg:w-auto mt-3 lg:mt-0">
            <button
              onClick={() => {
                setCategory("All");
                setDownloadType("All");
              }}
              className="bg-[#3a5a40] hover:bg-[#588157] text-white font-medium rounded-lg transition-all 
                        text-sm px-5 py-2 sm:py-2.5 
                        w-[160px] sm:w-auto mx-auto"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>

      {/* ✅ Active Search & Filters Summary */}
      {(search || category !== "All" || downloadType !== "All") && (
        <div className="text-center text-sm text-gray-700 mt-3 mb-6 px-4">
          <p className="inline-block px-4 py-2">
            <strong>Active Search:</strong>{" "}
            {search && (
              <span>
                <em>{search.trim()}</em>
              </span>
            )}
            {category !== "All" && (
              <span className="ml-2">
                <strong>Category</strong>: <em>{category}</em>
              </span>
            )}
            {downloadType !== "All" && (
              <span className="ml-2">
                <strong>Type</strong>: <em>{downloadType}</em>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Dataset Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-600">
          <svg
            className="animate-spin h-10 w-10 text-[#3a5a40] mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
          <p className="text-lg font-medium">Loading datasets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 text-lg py-20">No datasets found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((ds) => (
            <DatasetCard key={ds.id || ds.name} dataset={ds} onPreview={setSelected} />
          ))}
        </div>
      )}

      {/* Dataset Preview Modal */}
      {selected && (
        <DatasetPreviewModal dataset={selected} onClose={() => setSelected(null)} />
      )}

      {/* Contact Info Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowContactModal(false)}
              aria-label="Close contact dialog"
              className="absolute top-4 right-4 text-[#3a5a40] hover:text-[#588157] text-l font-bold bg-transparent"
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold text-[#3a5a40] mb-4">
              Contact Information
            </h3>

            {/* Email */}
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <p className="text-gray-700 truncate">
                <strong>Email:</strong> {email}
              </p>
              <button
                onClick={() => handleCopy(email, "email")}
                className="btn btn-outline border-[#3A5A40] text-sm px-3 py-1 text-[#3a5a40]"
              >
                {copiedField === "email" ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <p className="text-gray-700 truncate">
                <strong>Phone:</strong> {phone}
              </p>
              <button
                onClick={() => handleCopy(phone, "phone")}
                className="btn btn-outline border-[#3A5A40] text-sm px-3 py-1 text-[#3a5a40]"
              >
                {copiedField === "phone" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Datasets;
