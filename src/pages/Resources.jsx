import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, PlayCircle, ExternalLink } from "lucide-react";

const Resources = () => {
  const [publications, setPublications] = useState([]);
  const [presentations, setPresentations] = useState([]);

  const SHEET_JSON_URL = "https://script.google.com/macros/s/AKfycbx52GNkXWO-vpUES3hUoF6XGZvPSkLYj_8Bl2P4SdKvmEqqCr0fGneSC7Kn03FoSxOZ4A/exec";

  useEffect(() => {
    fetch(SHEET_JSON_URL)
      .then((res) => res.json())
      .then((data) => {
        setPublications(data.publications || []);
        setPresentations(data.presentations || []);
      })
      .catch((err) => console.error("Error loading resources:", err));
  }, []);

  return (
    <motion.section
      className="w-full px-6 lg:px-24 py-20 bg-gray-50"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-6 text-center tracking-tight">
          Resources
          <span className="block h-1 w-24 bg-[#3a5a40] mx-auto mt-3 rounded-full"></span>
        </h2>

        <p className="text-lg text-gray-700 mb-16 text-center max-w-3xl mx-auto">
          Access CENVI’s research outputs, presentations, and educational materials.
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          
          <div>
            <h3 className="text-2xl font-semibold text-[#3a5a40] mb-6 flex items-center gap-2">
              <PlayCircle className="text-[#588157]" /> Presentations & Media
            </h3>
            {presentations.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {presentations.map((item, i) => (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-all">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg scale-100 group-hover:scale-110 transition">
                           <PlayCircle className="text-[#344e41] w-8 h-8" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-bold text-[#344e41] line-clamp-2 group-hover:text-[#588157] transition">
                        {item.title}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-xl text-center text-gray-400 border border-dashed">
                Loading media...
              </div>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-[#344e41] mb-6 flex items-center gap-2">
              <FileText className="text-[#588157]" /> Publications
            </h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {publications.length > 0 ? (
                <ul className="space-y-4">
                  {publications.map((pub, i) => (
                    <li key={i} className="pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition"
                      >
                        <ExternalLink size={18} className="text-[#588157] mt-1 flex-shrink-0" />
                        <span className="text-gray-700 font-medium group-hover:text-[#3a5a40] transition">
                          {pub.title}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-gray-400 italic">Loading publications...</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  );
};

export default Resources; 