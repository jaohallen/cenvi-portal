import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Database, ChevronLeft, ChevronRight, X } from "lucide-react";

const Home = () => {
  const [carousel, setCarousel] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  const SHEET_JSON_URL = "https://script.google.com/macros/s/AKfycbx52GNkXWO-vpUES3hUoF6XGZvPSkLYj_8Bl2P4SdKvmEqqCr0fGneSC7Kn03FoSxOZ4A/exec";

  useEffect(() => {
    const fetchData = () => {
      fetch(SHEET_JSON_URL)
        .then((res) => res.json())
        .then((data) => {
          setCarousel(data.carousel || []);
          setHighlights(data.highlights || []);
        })
        .catch((err) => console.error("Error loading content:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carousel.length === 0) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % carousel.length), 5000);
    return () => clearInterval(timer);
  }, [carousel]);

  const handleNavigateToDatasets = () => {
    navigate("/datasets");
  };

  return (
    <div className="w-full relative overflow-x-hidden bg-white">
      
      {/* SECTION 1: HERO CAROUSEL (Logo & Title Only) */}
      <div className="relative w-screen left-1/2 -translate-x-1/2 aspect-video min-h-[350px] max-h-[80vh] overflow-hidden bg-gray-900 group">
        {carousel.length > 0 ? (
          carousel.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={item.src}
                alt={item.label}
                className="w-full h-full object-cover block"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400 animate-pulse">
            Loading imagery...
          </div>
        )}

        {/* Branding Overlay - MOVED TO BOTTOM */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-6 z-20 pb-12 md:pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <img 
              src="/cenvi_logo.png" 
              alt="CENVI Logo" 
              className="w-20 md:w-48 h-auto mb-4 mx-auto drop-shadow-2xl" 
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight uppercase leading-tight drop-shadow-lg">
              Center for <br className="sm:hidden" /> Environmental Informatics
            </h1>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={() => setCurrent((prev) => (prev === 0 ? carousel.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/50 transition z-30 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % carousel.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 text-white hover:bg-black/50 transition z-30 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* SECTION 2: WELCOME TO CENVI (Description & Actions) */}
      <section className="w-full px-6 lg:px-24 py-20 bg-white relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#344E41] mb-6">
              Welcome to CENVI
            </h2>
            <div className="h-1.5 w-20 bg-[#3a5a40] mx-auto mb-8 rounded-full"></div>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-10">
              Advancing environmental informatics through geospatial analytics, research, and community engagement. 
              The center is dedicated to bridging the gap between science and society. We utilize cutting-edge 
              geospatial technology to visualize climate risks, empower local government units, and foster 
              sustainable development across the Philippines.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleNavigateToDatasets}
                className="px-10 py-3 bg-[#3a5a40] hover:bg-[#588157] text-white rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Database size={20} /> Explore Datasets
              </button>
              <a
                href="#projects"
                className="px-10 py-3 bg-gray-100 hover:bg-gray-200 text-[#344E41] rounded-full font-semibold transition-all flex items-center justify-center gap-2"
              >
                View Projects <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: RECENT HIGHLIGHTS */}
      <section className="relative w-screen left-1/2 -translate-x-1/2 px-6 lg:px-24 py-20 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-[#344E41] mb-12 text-center">
            Recent Highlights
          </h3>

          {highlights.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedImage(item)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 flex flex-col h-full"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <h4 className="text-lg font-bold text-[#344E41] mb-2 line-clamp-2">
                      {item.title}
                    </h4>
                    <p className="text-sm text-[#588157] font-medium flex items-center gap-1 mt-4">
                      View Details <ArrowRight size={14} />
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-[#3a5a40] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-6xl w-full max-h-[90vh] shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="md:w-2/3 bg-black flex items-center justify-center h-[40vh] md:h-auto">
              <img src={selectedImage.src} alt={selectedImage.title} className="w-full h-full object-contain" />
            </div>
            <div className="md:w-1/3 p-8 flex flex-col bg-white overflow-y-auto">
              <h4 className="text-2xl font-bold text-[#344E41] mb-4">{selectedImage.title}</h4>
              <p className="text-gray-600 leading-relaxed mb-8">{selectedImage.description || "No description available."}</p>
              <button 
                onClick={() => setSelectedImage(null)}
                className="mt-auto w-full py-3 bg-gray-100 rounded-lg text-gray-600 font-semibold hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;