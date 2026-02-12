import React from "react";
import { motion } from "framer-motion";
import ProjectCard from "../components/ProjectCard";
import { projects } from "../data/projects";

const About = () => {
  return (
    <motion.section
      className="w-full px-8 lg:px-24 py-16 bg-white"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          About CENVI
        </span>
      </h2>
      <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
        The Center for Environmental Informatics (CENVI) at the University of the Philippines Cebu
        serves as a hub for innovation in environmental data science. We harness the power of GIS,
        remote sensing, and analytics to address climate change, disaster resilience, and
        sustainable development challenges.
      </p>
      <div className="flex justify-center mb-8">
        <img
          src="/Logos/upc_cenvi_logo.png"
          alt="UP Cebu Logo"
          className="w-55 h-auto"
        />
      </div>
      <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
        Our team collaborates with local governments, national agencies, and communities to
        transform environmental data into actionable knowledge. Through research, training, and
        technology development, CENVI empowers stakeholders to make evidence-based decisions.
      </p>

      <p className="text-lg text-gray-700 leading-relaxed text-center">
        From hazard mapping to community capacity building, our projects aim to bridge science,
        technology, and policy for a more resilient future.
      </p>
      <p>
        <div className="max-w-6xl mx-auto px-6 py-16">
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
      </p>
    
    </motion.section>
  );
};

export default About;
