import React, { useEffect, useState } from "react";
import DatasetCard from "../components/DatasetCard";
import DatasetPreviewModal from "../components/DatasetPreviewModal";
import { Search, Filter, Download, FolderOpen, X, Copy, Phone, Mail, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  const email = "upcenvi@gmail.com";
  const phone = "+63 908 353 3727";

  // --- FETCH DATA ---
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

  // --- DYNAMIC OPTIONS ---
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

  // --- FILTER LOGIC ---
  useEffect(() => {
    let result = datasets;

    if (category !== "All") {
      result = result.filter((d) => d.category === category);
    }

    if (downloadType !== "All") {
      result = result.filter((d) =>
        (d.available_download || "")
          .toLowerCase()
          .split(",")
          .map((t) => t.trim())
          .includes(downloadType.toLowerCase())
      );
    }

    if (search) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (d) =>
          (d.name || "").toLowerCase().includes(query) ||
          (d.description || "").toLowerCase().includes(query)
      );
    }

    setFiltered(result);
  }, [category, downloadType, search, datasets]);

  // --- MODAL SCROLL LOCK ---
  useEffect(() => {
    document.body.style.overflow = showContactModal || selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showContactModal, selected]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  };

  const clearFilters = () => {
    setCategory("All");
    setDownloadType("All");
    setSearch("");
  };

  const hasActiveFilters = category !== "All" || downloadType !== "All" || search !== "";
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 md:px-8 font-sans">
      
      {/* --- HEADER --- */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-6 tracking-tight">
          Dataset Repository
        </h2>
        <div className="h-1.5 w-24 bg-[#3a5a40] mx-auto rounded-full mb-6"></div>
        <div className="bg-white/60 backdrop-blur-sm border border-green-100 rounded-xl p-6 max-w-3xl mx-auto shadow-sm">
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            <span className="font-semibold text-[#3a5a40]">Note:</span> The maps below are preview images. 
            To access the raw geospatial data (.shp, .tiff, etc.), please 
            <button
              onClick={() => setShowContactModal(true)}
              className="ml-1 text-[#3a5a40] font-bold hover:underline hover:text-[#588157] transition"
            >
              request access here
            </button>.
            <span className="font-semibold text-[#3a5a40]"><br /></span> You can also view the available datasets in our 
            <button
              onClick={() => navigate("/webmap")}
              className="ml-1 text-[#3a5a40] font-bold hover:underline hover:text-[#588157] transition"
            >
              Web Map
            </button>.

          </p>
        </div>
      </div>

      {/* --- CONTROLS SECTION --- */}
      <div className="max-w-6xl mx-auto mb-8 sticky top-20 z-30">
        
        {/* Mobile Toggle */}
        <div className="lg:hidden flex justify-center mb-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-[#3a5a40] hover:bg-[#588157] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg transition-all"
          >
            <Filter size={16} /> {showFilters ? "Hide Filters" : "Filter Datasets"}
          </button>
        </div>

        {/* Filter Bar */}
        <div className={`
          bg-white rounded-xl shadow-lg border border-gray-100 p-4 
          transition-all duration-300 ease-in-out
          ${showFilters ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 lg:opacity-100 lg:max-h-none overflow-visible"}
          lg:flex lg:items-center lg:justify-between lg:gap-4
        `}>
          
          {/* Search Input */}
          <div className="relative flex-grow lg:max-w-md mb-4 lg:mb-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#3a5a40] focus:ring-2 focus:ring-[#3a5a40]/20 outline-none transition bg-gray-50 focus:bg-white text-gray-700"
            />
          </div>

          {/* Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 lg:mb-0">
            <div className="relative">
               <FolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 focus:border-[#3a5a40] outline-none bg-gray-50 text-gray-700 appearance-none cursor-pointer hover:bg-white transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Download className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={downloadType}
                onChange={(e) => setDownloadType(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-8 py-2.5 rounded-lg border border-gray-200 focus:border-[#3a5a40] outline-none bg-gray-50 text-gray-700 appearance-none cursor-pointer hover:bg-white transition"
              >
                {downloadTypes.map((t) => (
                  <option key={t} value={t}>{t === "All" ? "All Formats" : t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors w-full lg:w-auto"
            >
              <X size={16} /> Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mt-4 px-2 text-sm text-gray-500 font-medium">
            Showing {filtered.length} {filtered.length === 1 ? "result" : "results"}
            {datasets.length !== filtered.length && ` (from ${datasets.length} total)`}
          </div>
        )}
      </div>

      {/* --- GRID SECTION --- */}
      <div className="max-w-6xl mx-auto min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#3a5a40]">
             <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="font-medium animate-pulse">Fetching datasets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No datasets found</h3>
            <p className="text-gray-500 mb-6">We couldn't find any matches for your current filters.</p>
            <button 
              onClick={clearFilters}
              className="px-6 py-2 bg-[#3a5a40] text-white rounded-lg hover:bg-[#588157] transition"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ds) => (
              <DatasetCard key={ds.id || ds.name} dataset={ds} onPreview={setSelected} />
            ))}
          </div>
        )}
      </div>

      {/* --- PREVIEW MODAL --- */}
      {selected && (
        <DatasetPreviewModal dataset={selected} onClose={() => setSelected(null)} />
      )}

      {/* --- CONTACT MODAL --- */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition bg-gray-100 p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FileText className="text-[#3a5a40]" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#344E41]">Request Data Access</h3>
              <p className="text-gray-500 text-sm mt-2">
                Contact us to request full access to high-resolution files and raw datasets. <br />
                Contact Number - Ms. Terai Alicaba (Program Coordinator)
              </p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <div className="group flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#3a5a40] hover:bg-green-50/30 transition">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Mail className="text-[#3a5a40] flex-shrink-0" size={20} />
                  <span className="text-gray-700 truncate text-sm sm:text-base font-medium">{email}</span>
                </div>
                <button
                  onClick={() => handleCopy(email, "email")}
                  className="p-2 text-gray-400 hover:text-[#3a5a40] transition"
                  title="Copy Email"
                >
                  {copiedField === "email" ? <span className="text-xs font-bold text-green-600">Copied</span> : <Copy size={18} />}
                </button>
              </div>

              {/* Phone */}
              <div className="group flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#3a5a40] hover:bg-green-50/30 transition">
                <div className="flex items-center gap-3 overflow-hidden">
                  <Phone className="text-[#3a5a40] flex-shrink-0" size={20} />
                  <span className="text-gray-700 truncate text-sm sm:text-base font-medium">{phone}</span>
                </div>
                <button
                  onClick={() => handleCopy(phone, "phone")}
                  className="p-2 text-gray-400 hover:text-[#3a5a40] transition"
                  title="Copy Phone"
                >
                  {copiedField === "phone" ? <span className="text-xs font-bold text-green-600">Copied</span> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button 
                 onClick={() => setShowContactModal(false)}
                 className="text-gray-400 hover:text-gray-600 text-sm font-medium transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Datasets;