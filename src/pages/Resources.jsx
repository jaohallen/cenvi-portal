import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Contact = () => {
  const [publications, setPublications] = useState([]);
  const [presentations, setPresentations] = useState([]);

  // Google Apps Script URL that returns JSON from Google Sheets
  const SHEET_JSON_URL =
    "https://script.google.com/macros/s/AKfycbx52GNkXWO-vpUES3hUoF6XGZvPSkLYj_8Bl2P4SdKvmEqqCr0fGneSC7Kn03FoSxOZ4A/exec";

  useEffect(() => {
    fetch(SHEET_JSON_URL)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data from sheet:", data); // <-- Check this in browser console
        setPublications(data.publications || []);
        setPresentations(data.presentations || []);
      })
      .catch((err) => console.error("Error loading resources:", err));
  }, []);


  return (
    <motion.section
      className="w-full px-8 lg:px-24 py-16 bg-gray-50"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          Resources
        </span>
      </h2>

      <p className="text-lg text-gray-700 mb-10 text-center">
        Discover CENVI’s research outputs, presentations, and AVPs. Whether you’re looking for detailed publications, visual project summaries, or educational materials, these resources showcase our work in environmental informatics and disaster risk management.
      </p>

      {/* Two-column section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Left column - Publications */}
        
          <div className="rounded-xl p-6">
            <h3 className="text-xl font-semibold text-[#3a5a40] mb-4 text-center">
              Publications
            </h3>
            {publications.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-left">
                {publications.map((pub, i) => (
                  <li key={i} className="ml-0">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#344e41] hover:text-[#588157] underline"
                    >
                      {pub.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-600">Loading publications...</p>
            )}  
          </div>     

        {/* Right column - Presentations / AVPs */}
        <div className="rounded-xl p-6">
          <h3 className="text-xl font-semibold text-[#3a5a40] mb-4 text-center">
            Presentations
          </h3>
          {presentations.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-left">
              {presentations.map((item, i) => (
                <li key={i} className="ml-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#344e41] hover:text-[#588157] underline"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">Loading presentations...</p>
          )}  
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Contact;
