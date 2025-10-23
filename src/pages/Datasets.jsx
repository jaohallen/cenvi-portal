import React, { useEffect, useState } from "react";
import DatasetCard from "../components/DatasetCard";
import DatasetPreviewModal from "../components/DatasetPreviewModal";

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedField, setCopiedField] = useState("");

  const email = "upcebunicer@gmail.com";
  const phone = "+63 912 345 6789";

  useEffect(() => {
  const SHEET_JSON_URL =
    "https://script.google.com/macros/s/AKfycbyYEz7bD0eW5W24rBkw7rJUywF5QFehnXX_sImKWMV8vArhlsZpZEPhuWa0Tks_49FOVQ/exec";

  fetch(SHEET_JSON_URL)
    .then((res) => res.json())
    .then((data) => {
      const sheetData = data.datasets || [];
      console.log("Loaded datasets from sheet:", sheetData);
      setDatasets(sheetData);
      setFiltered(sheetData);
    })
    .catch((err) => console.error("Error loading datasets from sheet:", err));
}, []);


  useEffect(() => {
    let result = datasets;
    if (category !== "All")
      result = result.filter((d) => d.category === category);
    if (search)
      result = result.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(result);
  }, [category, search, datasets]);

  useEffect(() => {
    document.body.style.overflow = showContactModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showContactModal]);

  const categories = ["All", ...new Set(datasets.map((d) => d.category))];

  // ✅ Copy handler
  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 1500);
  };

  return (
    <div className="pt-20 p-6 relative">
      {/* Page Title */}
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mt-10 mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          CENVI Datasets Repository
        </span>
      </h2>

      {/* Contact Line */}
      <div className="mb-8 text-center text-gray-700 text-lg">
        {"If you are interested in acquiring the maps and datasets, "}
        <button
          onClick={() => setShowContactModal(true)}
          className="text-[#3a5a40] font-semibold hover:underline hover:text-[#588157] transition bg-transparent border-none cursor-pointer p-0 m-0 align-baseline"
          style={{ marginLeft: "-2px" }}
        >
          contact our office.
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 mx-auto w-full max-w-4xl">
        <input
          type="text"
          placeholder="🔍 Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-[#588157] focus:outline-none text-gray-700 placeholder-gray-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 sm:flex-none sm:w-1/4 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-[#588157] focus:outline-none text-gray-700"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ds) => (
          <DatasetCard key={ds.id} dataset={ds} onPreview={setSelected} />
        ))}
      </div>

      {/* Dataset Preview Modal */}
      {selected && (
        <DatasetPreviewModal dataset={selected} onClose={() => setSelected(null)} />
      )}

      {/* ✅ Contact Info Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowContactModal(false)} // close when clicking background
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

            {/* Email Row */}
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

            {/* Phone Row */}
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
