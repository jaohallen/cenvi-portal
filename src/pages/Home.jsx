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
    <div className="w-full relative">
      
      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[85vh] overflow-hidden group">
        
        {/* Carousel Images */}
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
                className="w-full h-full object-cover"
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#344E41] via-[#344E41]/40 to-transparent"></div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500 animate-pulse">
            Loading visual experience...
          </div>
        )}

        {/* Hero Content Overlay - BOTTOM */}
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 z-20 pb-24 md:pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <img src="/cenvi_logo.png" alt="CENVI Logo" className="w-32 md:w-48 h-auto mb-4 mx-auto drop-shadow-2xl brightness-110" />
            
            {/* NEW SUBTITLE / KICKER */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight drop-shadow-xl uppercase">
              Center for Environmental Informatics
            </h1>

            <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 tracking-wide drop-shadow-md">
              Data-Driven <span className="text-green-300">Resilience</span>
            </h2>
            
            <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto mb-6 font-light drop-shadow-md">
              Advancing environmental informatics through geospatial analytics, research, and community engagement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleNavigateToDatasets}
                className="px-6 py-3 bg-[#3a5a40] hover:bg-[#588157] text-white rounded-full font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-900/50"
              >
                <Database size={20} /> Explore Datasets
              </button>
              <a
                href="#projects"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
              >
                View Projects <ArrowRight size={20} />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <button
          onClick={() => setCurrent((prev) => (prev === 0 ? carousel.length - 1 : prev - 1))}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition backdrop-blur-sm z-30 hidden md:block"
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={() => setCurrent((prev) => (prev + 1) % carousel.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition backdrop-blur-sm z-30 hidden md:block"
        >
          <ChevronRight size={32} />
        </button>

        {/* Dots */}
        {carousel.length > 0 && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
            {carousel.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  current === index ? "bg-white w-8" : "bg-white/50 hover:bg-white"
                }`}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* --- WELCOME SECTION --- */}
      <section className="w-full px-6 lg:px-24 py-16 bg-white relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#344E41] mb-8 relative inline-block">
            Welcome to CENVI
            <span className="block h-1.5 w-1/2 bg-[#3a5a40] mx-auto mt-2 rounded-full"></span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-0">
            The center is dedicated to bridging the gap between 
            science and society. We utilize cutting-edge geospatial technology to visualize climate risks, 
            empower local government units, and foster sustainable development across the Philippines.
          </p>
        </div>
      </section>

      {/* --- HIGHLIGHTS SECTION --- */}
      <section className="w-full px-6 lg:px-24 py-20 bg-gray-50">
        <h3 className="text-3xl font-bold text-[#344E41] mb-12 text-center">
          Recent Highlights
        </h3>

        {highlights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {highlights.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedImage(item)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100"
              >
                <div className="h-64 overflow-hidden relative">
                   <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-bold text-[#344E41] mb-2 line-clamp-2">{item.title}</h4>
                  <p className="text-sm text-[#588157] font-medium flex items-center gap-1">
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
      </section>

      {/* --- LIGHTBOX MODAL --- */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-5 right-5 text-white/70 hover:text-white transition">
            <X size={40} />
          </button>
          
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] shadow-2xl flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="md:w-2/3 bg-black flex items-center justify-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[50vh] md:max-h-[90vh] w-full object-contain"
              />
            </div>
            
            {/* Details Side */}
            <div className="md:w-1/3 p-8 flex flex-col justify-center bg-white">
              <h4 className="text-2xl font-bold text-[#344E41] mb-4">
                {selectedImage.title}
              </h4>
              {selectedImage.description ? (
                <p className="text-gray-600 leading-relaxed">
                  {selectedImage.description}
                </p>
              ) : (
                <p className="text-gray-400 italic">No description available.</p>
              )}
              <div className="mt-8 pt-6 border-t border-gray-100">
                 <button 
                    onClick={() => setSelectedImage(null)}
                    className="text-sm font-semibold text-gray-500 hover:text-[#3a5a40] transition"
                 >
                    Close Preview
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;