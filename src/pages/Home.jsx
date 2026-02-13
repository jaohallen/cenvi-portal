import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [carousel, setCarousel] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const SHEET_JSON_URL =
    "https://script.google.com/macros/s/AKfycbx52GNkXWO-vpUES3hUoF6XGZvPSkLYj_8Bl2P4SdKvmEqqCr0fGneSC7Kn03FoSxOZ4A/exec";

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
    const timer = setInterval(
      () => setCurrent((prev) => (prev + 1) % carousel.length),
      4000
    );
    return () => clearInterval(timer);
  }, [carousel]);

  const [selectedImage, setSelectedImage] = useState(null); // same variable, but store an object

  const handleNavigateToDashboard = () => {
    navigate("/dashboard"); // same as navbar click
  };

  return (
    <div className="w-full relative">
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[500px] md:h-[750px] overflow-hidden group">
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

      <section className="w-full px-8 lg:px-24 py-14 bg-gray-50 text-center flex flex-col items-center">
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
        <p className="text-lg text-gray-700 max-w-3xl mb-0">
          The Center for Environmental Informatics (CENVI) advances environmental
          resilience through data-driven research, geospatial analytics, and community
          engagement.
        </p>

      </section>

      <section className="w-full px-8 lg:px-24 py-20 bg-white">
        <h3 className="text-3xl font-semibold text-[#3a5a40] mb-8 text-center">
          Highlights
        </h3>

        {highlights.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8">
            {highlights.map((item, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(item)}
                className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition group w-[500px] cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white text-center p-4 ">
                  <h4 className="text-m font-semibold drop-shadow-md">{item.title}</h4>
                </div>
              </div>

            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">Loading highlights...</p>
        )}
      </section>
      {/*  
      <section className="w-full px-8 lg:px-24 py-20 bg-gray-50">
        <h3 className="text-3xl font-semibold text-[#3a5a40] mb-8 text-center">
          CENVI Portal Features
        </h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-10 text-center max-w-3xl mx-auto">
          Explore geospatial insights through our interactive web map and visualization dashboard.
        </p>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="w-full aspect-video overflow-hidden">
              <img
                src="/site-images/portal_webmap.png"
                alt="Interactive AGOL Web Map"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 text-center">
              <h4 className="text-xl font-semibold text-[#3a5a40] mb-2">
                ArcGIS Online Web Map
              </h4>
              <p className="text-gray-700 text-sm mb-4">
                Access the CENVI interactive map powered by ArcGIS Online, integrating hazard layers, 
                infrastructure datasets, and geospatial analyses.
              </p>
              <button
                onClick={() => window.open("https://upcenvi.maps.arcgis.com", "_blank")}
                className="px-4 py-2 bg-[#3a5a40] text-white rounded-lg hover:bg-[#588157] transition"
              >
                Open Map →
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer">
            <div className="w-full aspect-video overflow-hidden">
              <img
                src="/site-images/portal_dataset_dashboard.png"
                alt="Dashboard for Georeferenced Datasets"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-6 text-center">
              <h4 className="text-xl font-semibold text-[#3a5a40] mb-2">
                Dataset Dashboard
              </h4>
              <p className="text-gray-700 text-sm mb-4">
                Visualize and analyze your georeferenced datasets and view charts, maps, and key indicators for immediate summary.
              </p>
              <button
                onClick={handleNavigateToDashboard}
                className="px-4 py-2 bg-[#3a5a40] text-white rounded-lg hover:bg-[#588157] transition"
              >
                View Dashboard →
              </button>
            </div>
          </div>
        </div>

      </section>*/}
      

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* WRAPPER THAT LOCKS WIDTH */}
            <div className="relative inline-block">
              
              {/* IMAGE */}
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[85vh] rounded-xl shadow-lg object-contain"
              />

              {/* CAPTION MATCHES EXACT WIDTH OF IMAGE */}
              <div className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-sm text-white text-center p-4 rounded-b-xl">
                <h4 className="text-lg font-semibold drop-shadow-md">
                  {selectedImage.title}
                </h4>
                {selectedImage.description && (
                  <p className="text-m opacity-90 mt-1">
                    {selectedImage.description}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Home;
