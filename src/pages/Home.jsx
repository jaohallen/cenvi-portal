import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [carousel, setCarousel] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null); // ✅ new state
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const SHEET_JSON_URL =
    "https://script.google.com/macros/s/AKfycbwgR7Ct4i0LfrdXBGPL0ECOrt6JGmVqn_qqADdWuv6hMYuEs7p9buhYVVX0MANiSlkuCQ/exec";

  useEffect(() => {
    const fetchData = () => {
      fetch(SHEET_JSON_URL)
        .then((res) => res.json())
        .then((data) => {
          setCarousel(data.carousel || []);
          setHighlights(data.highlights || []);
          setLastUpdated(data.lastUpdated || null);
        })
        .catch((err) => console.error("Error loading content:", err));
    };

    fetchData();

    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (carousel.length === 0) return;
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % carousel.length),
      4000
    );
    return () => clearInterval(timer);
  }, [carousel]);

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="w-full relative">
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[400px] md:h-[550px] overflow-hidden group">
        {carousel.length > 0 ? (
          carousel.map((item, index) => (
            <img
              key={index}
              src={item.src}
              alt={item.label}
              className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                index === current ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading carousel...
          </div>
        )}

        <div
          onClick={() =>
            setCurrent((prev) => (prev === 0 ? carousel.length - 1 : prev - 1))
          }
          className="absolute left-0 top-0 h-full w-[10%] z-20 cursor-pointer flex items-center justify-center bg-transparent hover:bg-black/20 transition"
          title="Previous Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-8 h-8 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>

        <div
          onClick={() => setCurrent((prev) => (prev + 1) % carousel.length)}
          className="absolute right-0 top-0 h-full w-[10%] z-20 cursor-pointer flex items-center justify-center bg-transparent hover:bg-black/20 transition"
          title="Next Slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="white"
            className="w-8 h-8 drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {carousel.length > 0 && (
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {carousel.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`w-3 h-3 rounded-full ${
                  current === index ? "bg-[#3a5a40]" : "bg-gray-300"
                }`}
              ></button>
            ))}
          </div>
        )}
      </div>

      <section className="w-full px-8 lg:px-24 py-24 bg-gray-50 text-center flex flex-col items-center">
        <img
          src="/cenvi_logo.png"
          alt="CENVI Logo"
          className="w-60 h-auto mb-6 drop-shadow-md"
        />
        <h2 className="text-4xl md:text-5xl font-bold text-[#344E41] mb-10 text-center tracking-tight relative">
          <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
            Welcome to CENVI
          </span>
        </h2>
        <p className="text-lg text-gray-700 max-w-3xl mb-10">
          The Center for Environmental Informatics (CENVI) advances environmental
          resilience through data-driven research, geospatial analytics, and community
          engagement.
        </p>

        {/* Links */}
        <div className="flex flex-col items-center space-y-4">
          <a
            onClick={() => {
              const aboutSection = document.getElementById("about");
              if (aboutSection) aboutSection.scrollIntoView({ behavior: "smooth" });
            }}
            className="text-[#3a5a40] font-semibold text-lg cursor-pointer hover:text-[#588157] transition"
          >
            Learn more about CENVI ↓
          </a>

          <a
            onClick={() => navigate("/datasets")}
            className="text-[#3a5a40] font-semibold text-lg cursor-pointer hover:text-[#588157] transition"
          >
            Explore Datasets →
          </a>
        </div>
      </section>

      <section className="w-full px-8 lg:px-24 py-20 bg-white">
        <h3 className="text-3xl font-semibold text-[#3a5a40] mb-8 text-center">
          Project Highlights
        </h3>

        {highlights.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {highlights.map((item, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(item.src)}
                className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition group w-[500px] cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white text-center p-4 ">
                  <h4 className="text-lg font-semibold drop-shadow-md">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm opacity-90 mt-1">{item.description}</p>
                  )}
                </div>
              </div>

            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading highlights...</p>
        )}
      </section>

      <section className="w-full px-8 lg:px-24 py-10">
        <h3 className="text-3xl font-semibold text-[#3a5a40] mb-8 text-center">
          Interactive Web Map
        </h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
          Explore geospatial insights through our interactive map — showcasing datasets,
          research outputs, and field data for various environmental projects.
        </p>
        <div className="relative w-full">
          <arcgis-embedded-map
            style={{
              width: "100%",
              height: "70vh",
              minHeight: "400px",
              maxHeight: "800px",
              borderRadius: "12px",
            }}
            item-id="5af713038cf54283bbe8141d34a960d7"
            theme="light"
            center="124.02247309357192,10.96061178065168"
            scale="577790.554289"
            portal-url="https://upcenvi.maps.arcgis.com"
          ></arcgis-embedded-map>
        </div>
      </section>
      
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-500 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking image
          >
            <img
              src={selectedImage}
              alt="Preview"
              className="w-auto max-w-full h-auto max-h-[85vh] rounded-xl shadow-lg object-contain transition-transform duration-500 transform hover:scale-105"
            />
          </div>
        </div>
      )}


    </div>
  );
};

export default Home;
