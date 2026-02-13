import React from "react";
import { motion } from "framer-motion";
import { projects } from "../data/projects";
import { Link } from "react-router-dom";

const Research_Projects = () => {
  // Duplicate array for seamless infinite scroll
  const scrollingProjects = [...projects, ...projects];

  return (
    <section className="w-full py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-16 text-center tracking-tight relative">
          <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
            Our Research Projects
          </span>
        </h2>
        <div className="relative w-full overflow-hidden">
          <motion.div
            className="flex gap-12 items-center"
            animate={{ x: ["0%", "-80%"] }}
            transition={{
              repeat: Infinity,
              duration: 20,
              ease: "linear",
            }}
          >
            {scrollingProjects.map((project, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-32 h-32 flex items-center justify-center"
              >
                <img
                  src={project.logo}
                  alt={project.title}
                  className="max-h-28 object-contain opacity-80 hover:opacity-100 transition duration-300"
                />
              </div>
            ))}
          </motion.div>
            <div className="mt-12 text-center">
                <Link
                    to="/projectdetails"
                    className="inline-block text-[#3a5a40] font-medium hover:text-[#588157] transition duration-300 underline underline-offset-4"
                >
                    View All Research Projects →
                </Link>
            </div>

        </div>
        
      </div>
    </section>
  );
};

export default Research_Projects;
