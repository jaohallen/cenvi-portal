import React from "react";
import { motion } from "framer-motion";

const WebMap = () => {
  return (
    <motion.section
      className="w-full px-4 md:px-12 lg:px-24 py-16 bg-gray-50 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
        CENVI Interactive Web Map
      </h2>
      <p className="text-lg text-gray-700 leading-relaxed text-center max-w-3xl mx-auto mb-10">
        Explore our geospatial datasets — including shapefiles, raster imagery, and other
        geoinformatics data used in hazard modeling, environmental planning, and research projects.
      </p>

      {/* Full ArcGIS Online Map Viewer with tools (legend, layer list, basemap gallery) */}
      <div className="w-full h-[75vh] rounded-xl overflow-hidden shadow-lg">
        <iframe
          src="https://www.arcgis.com/apps/mapviewer/index.html?webmap=5af713038cf54283bbe8141d34a960d7&portalUrl=https://upcenvi.maps.arcgis.com"
          width="100%"
          height="100%"
          title="CENVI Full Web Map"
          style={{ border: "none" }}
          allowFullScreen
        ></iframe>
      </div>
    </motion.section>
  );
};

export default WebMap;
