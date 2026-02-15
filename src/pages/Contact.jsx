import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";

const Contact = () => {
  return (
    <section className="w-full bg-white py-24 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#3a5a40]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#3a5a40]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* --- Header --- */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#344e41] mb-6 tracking-tight">
            Get in Touch
          </h2>
          <div className="h-1.5 w-24 bg-[#3a5a40] mx-auto rounded-full mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Reach out to us for collaborations, partnerships, or inquiries about our environmental research and data services.
          </p>
        </div>

        {/* =========================================
            MOBILE VIEW: Single Combined Card
            (Visible only on small screens)
           ========================================= */}
        <div className="md:hidden bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          
          {/* Address Section */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <MapPin className="text-[#3a5a40]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#344e41] mb-2">Visit Us</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              3rd Floor TIC Building, UP Cebu, <br />
              Gorordo Ave, Lahug, Cebu City
            </p>
          </div>

          {/* Phone Section */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Phone className="text-[#3a5a40]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#344e41] mb-2">Call Us</h3>
            <p className="text-[#344e41] font-semibold text-base">
              +63 908 353 3727
            </p>
            <p className="text-xs text-gray-500 mt-1">Ms. Terai Alicaba (Program Coordinator)</p>
          </div>

          {/* Email Section */}
          <div className="p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-[#3a5a40]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#344e41] mb-2">Email Us</h3>
            <p className="text-[#344e41] font-semibold text-base">
              upcenvi@gmail.com
            </p>
            <p className="text-xs text-gray-500 mt-1">For general inquiries</p>
          </div>

        </div>

        {/* =========================================
            DESKTOP VIEW: 3 Grid Cards
            (Hidden on mobile, visible on medium+ screens)
           ========================================= */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          
          {/* Address Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <MapPin className="text-[#3a5a40]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#344e41] mb-3">Visit Us</h3>
            <p className="text-gray-600 leading-relaxed">
              3rd Floor TIC Building, <br />
              UP Cebu, Gorordo Ave, <br />
              Lahug, Cebu City
            </p>
          </div>

          {/* Phone Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Phone className="text-[#3a5a40]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#344e41] mb-3">Call Us</h3>
            <p className="text-[#344e41] font-semibold text-lg mt-2">
              +63 908 353 3727
            </p>
            <p className="text-sm text-gray-500 mt-1">Ms. Terai Alicaba (Program Coordinator)</p>
          </div>

          {/* Email Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Mail className="text-[#3a5a40]" size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#344e41] mb-3">Email Us</h3>
            <p className="text-gray-600">
              For general inquiries and data requests
            </p>
            <p className="text-[#344e41] font-semibold text-lg mt-2">
              upcenvi@gmail.com
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Contact;