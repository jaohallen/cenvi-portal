import React from "react";
import { motion } from "framer-motion";
import { Map, Database, Activity, Users } from "lucide-react";

const services = [
  {
    icon: Map, // Passing component reference for dynamic styling
    title: "GIS and Mapping",
    description:
      "We provide geospatial mapping and spatial analysis services to visualize, understand, and manage environmental data effectively.",
  },
  {
    icon: Database,
    title: "Data Science and Analytics",
    description:
      "CENVI uses data-driven models, predictive analytics, and AI tools to support research and policy decision-making.",
  },
  {
    icon: Activity,
    title: "Disaster Risk Reduction",
    description:
      "We develop hazard maps and early warning systems to strengthen community resilience and local response capacity.",
  },
  {
    icon: Users,
    title: "Capacity Building",
    description:
      "We conduct training programs and workshops on GIS, data science, and environmental management for students and professionals.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Services = () => {
  return (
    <section className="w-full py-24 bg-gray-50 relative overflow-hidden">
      {/* Optional Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3a5a40]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-[#344e41] mb-6 tracking-tight"
          >
            Our Services
          </motion.h2>
          <div className="h-1.5 w-24 bg-[#3a5a40] mx-auto rounded-full mb-6"></div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            CENVI delivers interdisciplinary solutions that combine data science,
            GIS, and environmental research to address real-world sustainability
            and resilience challenges.
          </motion.p>
        </div>

        {/* --- Service Cards Grid --- */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#3a5a40]/30 transition-all duration-300 flex flex-col items-center text-center relative"
            >
              {/* Icon Container with Hover Effect */}
              <div className="w-16 h-16 bg-[#3a5a40]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#3a5a40] group-hover:scale-110 transition-all duration-300">
                <service.icon 
                  className="text-[#3a5a40] group-hover:text-white transition-colors duration-300" 
                  size={32} 
                />
              </div>

              <h3 className="text-xl font-bold text-[#344e41] mb-3 group-hover:text-[#3a5a40] transition-colors">
                {service.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed text-sm">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
};

export default Services;