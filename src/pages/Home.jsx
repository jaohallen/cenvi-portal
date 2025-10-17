import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
];

const highlights = [
  {
    src: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=80",
    label: "FireCheck 2.0 Community Mapping",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    label: "Research Collaboration Workshop",
  },
  {
    src: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80",
    label: "GIS Capacity Building",
  },
  {
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    label: "Andam Lapu-Lapu",
  },
];

const Home = () => {
  const [current, setCurrent] = useState(0);

  // Auto slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative">
      {/* Carousel Section */}
      <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] h-[400px] md:h-[550px] overflow-hidden group">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`slide-${index}`}
            className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* 🔹 Left Navigation */}
        <div
          onClick={() =>
            setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
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

        {/* 🔹 Right Navigation */}
        <div
          onClick={() =>
            setCurrent((prev) => (prev + 1) % images.length)
          }
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

        {/* 🔹 Dots Navigation */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full ${
                current === index ? "bg-green-600" : "bg-gray-300"
              }`}
            ></button>
          ))}
        </div>
</div>


      {/* Welcome Section */}
      <section className="w-full px-8 lg:px-24 py-24 bg-gray-50">
        <motion.div
          className="text-center flex flex-col items-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="/cenvi_logo.png"
            alt="CENVI Logo"
            className="w-60 h-auto mb-6 drop-shadow-md"
          />
          <h2 className="text-4xl md:text-5xl font-bold text-green-800 mb-10 text-center tracking-tight relative">
            <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-green-600 after:mx-auto after:mt-2">
              Welcome to CENVI
            </span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl">
            The Center for Environmental Informatics (CENVI) advances environmental resilience
            through data-driven research, geospatial analytics, and community engagement.
          </p>
        </motion.div>
        
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.a
            onClick={() => {
              const aboutSection = document.getElementById("about");
              if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-block text-green-700 font-semibold text-lg cursor-pointer hover:text-green-800"
            whileHover={{
              y: -3,
              transition: { type: "spring", stiffness: 300 },
            }}
          >
            Learn more about CENVI ↓
          </motion.a>
        </motion.div>


      </section>

      {/* Highlights Section */}
      <motion.section
        className="w-full px-8 lg:px-24 py-20 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-semibold text-green-700 mb-8 text-center">
          Project Highlights
        </h3>

        <div className="flex flex-wrap justify-center gap-8">
          {highlights.map((item, i) => (
            <motion.div
              key={i}
              className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition group w-[500px]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              {/* Image */}
              <img
                src={item.src}
                alt={item.label}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />

              {/* Label overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-center p-4">
                <h4 className="text-lg font-semibold drop-shadow-md">{item.label}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Web Map*/}
      <motion.section
        className="w-full px-8 lg:px-24 py-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="text-3xl font-semibold text-green-700 mb-8 text-center">
          Interactive Web Map
        </h3>
        <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
          Explore geospatial insights through our interactive map — showcasing datasets, research outputs, and field data for various environmental projects.
        </p>

        {/* Full-width map container with margins */}
        <div className="relative w-full">
          <arcgis-embedded-map
            style={{
              width: "100%",
              height: "70vh", // scales with screen height
              minHeight: "400px", // prevents it from being too small
              maxHeight: "800px", // prevents it from being too tall on large screens
              borderRadius: "12px",
            }}
            item-id="5af713038cf54283bbe8141d34a960d7"
            theme="light"
            center="124.02247309357192,10.96061178065168"
            scale="577790.554289"
            portal-url="https://upcenvi.maps.arcgis.com"
          ></arcgis-embedded-map>
        </div>
      </motion.section>

    </div>
  );
};

export default Home;
