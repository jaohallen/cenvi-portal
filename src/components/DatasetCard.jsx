import React from "react";

const DatasetCard = ({ dataset, onPreview }) => {

  const placeholder = "/cenvi_logo.png";

  return (
    <div className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-white overflow-hidden">
      <img
        src={dataset.thumbnail || placeholder}
        alt={dataset.name}
        className="rounded-t-2xl h-48 w-full object-cover"
        onError={(e) => { e.currentTarget.src = placeholder; }}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{dataset.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{dataset.category}</p>
        {/* Remove line-clamp until plugin is added (see item #3) */}
        <p className="text-sm text-gray-700 mb-3">
          {dataset.description}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => onPreview(dataset)}
            className="flex-1 bg-green-700 hover:bg-green-600 text-white px-3 py-2 rounded-lg"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatasetCard;
