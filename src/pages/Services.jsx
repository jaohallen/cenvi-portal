import React from "react";
import { motion } from "framer-motion";
import { Map, Database, Activity, Users } from "lucide-react"; // icons

const services = [
  {
    icon: <Map className="w-10 h-10 text-[#588157]" />,
    title: "GIS and Mapping",
    description:
      "We provide geospatial mapping and spatial analysis services to visualize, understand, and manage environmental data effectively.",
  },
  {
    icon: <Database className="w-10 h-10 text-[#588157]" />,
    title: "Data Science and Analytics",
    description:
      "CENVI uses data-driven models, predictive analytics, and AI tools to support research and policy decision-making.",
  },
  {
    icon: <Activity className="w-10 h-10 text-[#588157]" />,
    title: "Disaster Risk Reduction",
    description:
      "We develop hazard maps and early warning systems to strengthen community resilience and local response capacity.",
  },
  {
    icon: <Users className="w-10 h-10 text-[#588157]" />,
    title: "Capacity Building and Training",
    description:
      "We conduct training programs and workshops on GIS, data science, and environmental management for students and professionals.",
  },
];

const Services = () => {
  return (
    <motion.section
      className="w-full px-8 lg:px-24 py-16 bg-gray-50"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-8 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          Our Services
        </span>
      </h2>

      <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto mb-12">
        CENVI delivers interdisciplinary solutions that combine data science,
        GIS, and environmental research to address real-world sustainability
        and resilience challenges.
      </p>

      {/* Service Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-transform hover:-translate-y-2 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold text-[#588157] mb-2">
              {service.title}
            </h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default Services;
