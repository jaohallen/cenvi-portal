import React from "react";
import { motion } from "framer-motion";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const Research_Projects = () => {
  return (
    <motion.section
      className="w-full px-8 lg:px-24 py-16 bg-white"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-10 text-center tracking-tight relative">
            <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
              Our Research Projects
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                logo={project.logo}
                title={project.title}
                description={project.description}
              />
            ))}
          </div>
        </div>
    
    </motion.section>
  );
};

export default Research_Projects;
