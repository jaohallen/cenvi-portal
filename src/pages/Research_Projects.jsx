import React from "react";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Research_Projects = () => {
  // Duplicate array for seamless infinite scroll
  const scrollingProjects = [...projects, ...projects];

  return (
    <section className="w-full py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-6 tracking-tight relative inline-block">
            Our Research Projects
            <span className="block h-1 w-24 bg-[#3a5a40] mx-auto mt-3 rounded-full"></span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
             Collaborative initiatives focusing on hazard mapping, environmental sustainability, and data resilience.
          </p>
        </motion.div>

        {/* Infinite Scroll Container */}
        <div className="relative w-full overflow-hidden mask-image-linear-gradient">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10"></div>
          
          <motion.div
            className="flex gap-16 items-center py-8"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 30,
              ease: "linear",
            }}
            style={{ width: "fit-content" }}
          >
            {scrollingProjects.map((project, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-40 h-40 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-500 hover:shadow-md hover:scale-110"
              >
                <img
                  src={project.logo}
                  alt={project.title}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>

        <div className="mt-16 text-center">
          <Link
            to="/projectdetails"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#3a5a40] text-white rounded-full font-semibold hover:bg-[#588157] transition shadow-lg hover:shadow-green-900/20"
          >
            View Project Details <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Research_Projects;