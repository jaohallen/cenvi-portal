import React, { useEffect, useState } from "react";
import DatasetCard from "../components/DatasetCard";
import DatasetPreviewModal from "../components/DatasetPreviewModal";

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/data/datasets.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("Loaded datasets:", data);
        setDatasets(data);
        setFiltered(data);
      })
      .catch((err) => console.error("Error loading datasets:", err));
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

  const categories = ["All", ...new Set(datasets.map((d) => d.category))];

  return (
    <div className="pt-20 p-6">
      {/* Page Title */}
      <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-green-600 after:mx-auto after:mt-2">
          CENVI Datasets Repository
        </span>
      </h2>

      {/* ✅ Search + Filter Container with Max Width */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8 mx-auto w-full max-w-4xl">
        <input
          type="text"
          placeholder="🔍 Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700 placeholder-gray-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 sm:flex-none sm:w-1/4 px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none text-gray-700"
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

      {/* Preview Modal */}
      {selected && (
        <DatasetPreviewModal dataset={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default Datasets;
