import React from "react";

const DatasetCard = ({ dataset, onPreview }) => {
  const placeholder = "/cenvi_logo.png";

  const getDisplayUrl = (url) => {
    if (!url) return placeholder;
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/([^/]+)/);
      if (match && match[1]) {
        const id = match[1];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
      }
    }
    if (url.includes("drive.google.com/open?id=")) {
      const id = url.split("id=")[1];
      return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
    }
    return url;
  };

  const thumbnailUrl = getDisplayUrl(dataset.thumbnail || dataset.source);

  return (
    <div className="rounded-2xl shadow-md hover:shadow-xl transition-all bg-white overflow-hidden">
      <img
        src={thumbnailUrl}
        alt={dataset.name}
        className="rounded-t-2xl h-48 w-full object-cover"
        onError={(e) => (e.currentTarget.src = placeholder)}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{dataset.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{dataset.category}</p>
        <p className="text-sm text-gray-700 mb-3">{dataset.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#3a5a40] bg-[#eaf1ed] px-2 py-1 rounded-full">
            {dataset.available_download || "Preview only"}
          </span>
          <button
            onClick={() => onPreview(dataset)}
            className="bg-[#3a5a40] hover:bg-[#588157] text-white text-sm px-3 py-2 rounded-lg"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatasetCard;
