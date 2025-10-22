import React from "react";
import { motion } from "framer-motion";

// Grouped collaborator data
const collaborators = {
  "Government Agencies": [
    {
      name: "DOST",
      logo: "/Logos/dost_logo.png",
      url: "https://region7.dost.gov.ph",
    },
    {
      name: "DEPDev",
      logo: "/Logos/depdev_logo.png",
      url: "#", // update this once DepDEV has an official link
    },
  ],
  "Local Government Units (LGUs)": [
    {
      name: "Lapu-Lapu City",
      logo: "/Logos/lapulapucity_logo.png",
      url: "https://google.com",
    },
    {
      name: "Mandaue City",
      logo: "/Logos/mandauecity_logo.png",
      url: "https://google.com",
    },
  ],
  "State Universities and Colleges (SUCs)": [
    {
      name: "University of San Carlos",
      logo: "/Logos/usc_logo.png",
      url: "https://google.com",
    },
    {
      name: "Cebu Institute of Technology University",
      logo: "/Logos/citu_logo.png",
      url: "https://google.com",
    },
    {
      name: "Cebu Technological University",
      logo: "/Logos/ctu_logo.png",
      url: "https://google.com",
    },
    {
      name: "Negros Oriental State University",
      logo: "/Logos/norsu_logo.png",
      url: "https://google.com",
    },
  ],
};

const Collaborators = () => {
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
          Our Collaborators
        </span>
      </h2>

      {/* Render each group */}
      {Object.entries(collaborators).map(([group, items]) => (
        <div key={group} className="mb-12">
          <h3 className="text-2xl font-semibold text-[#588157] mb-6 text-center">
            {group}
          </h3>

          <div className="flex flex-wrap justify-center items-start gap-10">
            {items.map((col) => (
              <a
                key={col.name}
                href={col.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center hover:scale-105 transition-transform"
              >
                <img
                  src={col.logo}
                  alt={`${col.name} Logo`}
                  className="w-24 h-auto mb-2 drop-shadow-md"
                />
                <span className="text-md text-gray-700 text-center font-medium w-32">
                  {col.name}
                </span>
              </a>
            ))}
          </div>

        </div>
      ))}
    </motion.section>
  );
};

export default Collaborators;
