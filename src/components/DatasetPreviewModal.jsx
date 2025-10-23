import React, { useEffect } from "react";

const DatasetPreviewModal = ({ dataset, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!dataset) return null;

  const getDisplayUrl = (url) => {
    if (!url) return "";
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/([^/]+)/);
      if (match && match[1]) {
        const id = match[1];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
      }
    }
    if (url.includes("drive.google.com/open?id=")) {
      const id = url.split("id=")[1];
      return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
    }
    return url;
  };

  const fileUrl = getDisplayUrl(dataset.thumbnail || dataset.source);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-11/12 md:w-3/4 lg:w-2/3 shadow-xl p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#3a5a40] hover:text-[#588157] text-l font-bold bg-transparent"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2 text-[#3a5a40]">
          {dataset.name}
        </h2>
        <p className="text-gray-600 mb-3">{dataset.description}</p>

        <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
          <img
            src={fileUrl}
            alt={dataset.name}
            className="max-h-[480px] max-w-full rounded-lg object-contain shadow-md"
            onError={(e) => (e.currentTarget.src = "/cenvi_logo.png")}
          />
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Available dataset format:{" "}
          <span className="font-semibold text-[#3a5a40]">
            {dataset.available_download || "N/A"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default DatasetPreviewModal;
