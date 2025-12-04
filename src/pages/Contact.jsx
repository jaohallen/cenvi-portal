import React from "react";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <motion.section
      className="w-full px-8 lg:px-24 py-16 bg-white"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-10 text-center tracking-tight relative">
        <span className="relative inline-block after:content-[''] after:block after:w-24 after:h-1 after:bg-[#3a5a40] after:mx-auto after:mt-2">
          Contact Us
        </span>
      </h2>

      <p className="text-lg text-gray-700 mb-10 text-center">
        Reach out to us for collaborations, partnerships, or inquiries about our environmental research and data services.
      </p>


      {/* Full-width card */}
      <motion.div
        className="p-8 w-full mx-auto space-y-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div>
          <h3 className="font-semibold text-[#588157] mb-1">Office Address</h3>
          <p className="text-gray-700">
            3rd Floor TIC Building, University of the Philippines Cebu, Gorordo Ave, Lahug, Cebu City
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-green-700 mb-1">Phone</h3>
          <p className="text-gray-700">+63 912 345 6789</p>
        </div>

        <div>
          <h3 className="font-semibold text-green-700 mb-1">Email</h3>
          <p className="text-gray-700">upcenvi@gmail.com</p>
        </div>
      </motion.div>
</motion.section>

  );
};

export default Contact;
