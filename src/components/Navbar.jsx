import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toolsRef = useRef(null);

  // Determine if we are on a page that needs a dark/solid navbar immediately
  const isDarkPage = 
    location.pathname === "/datasets" || 
    location.pathname.startsWith("/dashboard") || 
    location.pathname === "/projectdetails";

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleScrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
    setIsToolsOpen(false);
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    setIsToolsOpen(false);
    navigate(path);
  };

  const handleLogoClick = () => {
    setIsOpen(false);
    setIsToolsOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  // Scroll detection
  useEffect(() => {
    if (isDarkPage) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); 
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDarkPage]);

  // Click outside to close DESKTOP dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-[999] transition-all duration-300 ${
        isDarkPage || isScrolled
          ? "bg-[#344E41] shadow-lg py-2"
          : "bg-gradient-to-b from-black/60 to-transparent py-4"
      }`}
    >
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <div
          onClick={handleLogoClick}
          className="flex items-center space-x-3 cursor-pointer group z-[1001] relative"
        >
          <img
            src="/cenvi_logo.png"
            alt="CENVI Logo"
            className="h-10 w-auto object-contain drop-shadow-md transition-transform group-hover:scale-105"
          />
          <span className="text-xl font-bold text-white tracking-wide drop-shadow-md">
            CENVI
          </span>
        </div>

        {/* ================= HAMBURGER ICON ================= */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white focus:outline-none p-2 z-[1001] relative"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* ================= DESKTOP LINKS ================= */}
        <div className="hidden lg:flex items-center space-x-8 text-sm font-medium text-white/90">
          
          <span
            onClick={() => handleScrollToSection("about")}
            className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all"
          >
            About
          </span>
          
          <span
            onClick={() => handleScrollToSection("services")}
            className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all"
          >
            Services
          </span>

          <span
            onClick={() => handleScrollToSection("collaborators")}
            className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all"
          >
            Collaborators
          </span>

          <span
            onClick={() => handleNavigate("/projectdetails")}
            className="cursor-pointer hover:text-white hover:underline underline-offset-4 transition-all"
          >
            Research Projects
          </span>

          {/* --- TOOLS DROPDOWN --- */}
          <div className="relative group" ref={toolsRef}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="flex items-center gap-1 cursor-pointer hover:text-white transition-all focus:outline-none"
            >
              Tools
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${isToolsOpen ? "rotate-180" : ""}`} 
              />
            </button>

            {isToolsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-48 bg-white text-gray-800 rounded-lg shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200 border border-gray-100 overflow-hidden">
                <span
                  onClick={() => handleNavigate("/datasets")}
                  className="block px-4 py-3 hover:bg-green-50 hover:text-[#344E41] cursor-pointer transition-colors"
                >
                  Datasets
                </span>
                <div className="h-px bg-gray-100 mx-2"></div>
                <span
                  onClick={() => handleNavigate("/dashboard")}
                  className="block px-4 py-3 hover:bg-green-50 hover:text-[#344E41] cursor-pointer transition-colors"
                >
                  Dashboard
                </span>
              </div>
            )}
          </div>

          <span
            onClick={() => handleScrollToSection("contact")}
            className="px-5 py-2 bg-white text-[#344E41] rounded-full font-semibold hover:bg-[#dad7cd] transition-colors cursor-pointer"
          >
            Contact Us
          </span>
        </div>
      </div>

      {/* ================= MOBILE SIDEBAR MENU ================= */}
      <div 
        className={`fixed inset-0 z-[1000] lg:hidden transition-visibility duration-300 ${
          isOpen ? "visible" : "invisible delay-300"
        }`}
      >
         {/* 1. THE BACKDROP */}
         <div 
            onClick={() => setIsOpen(false)}
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
         ></div>

         {/* 2. THE DRAWER */}
         <div 
           className={`absolute top-0 right-0 h-full w-3/4 max-w-sm bg-[#344E41] shadow-2xl transition-transform duration-300 ease-out flex flex-col pt-24 px-6 ${
             isOpen ? "translate-x-0" : "translate-x-full"
           }`}
         >
            <div className="flex flex-col space-y-4 text-white text-lg font-medium text-left">
              {["home", "about", "services", "collaborators"].map((item) => (
                <span
                  key={item}
                  onClick={() => handleScrollToSection(item)}
                  className="capitalize cursor-pointer border-b border-white/10 pb-3 hover:text-green-200 transition-colors"
                >
                  {item}
                </span>
              ))}

              <span
                onClick={() => handleNavigate("/projectdetails")}
                className="cursor-pointer border-b border-white/10 pb-3 hover:text-green-200 transition-colors"
              >
                Research Projects
              </span>

              <span
                onClick={() => handleNavigate("/datasets")}
                className="cursor-pointer border-b border-white/10 pb-3 hover:text-green-200 transition-colors"
              >
                Datasets
              </span>

              <span
                onClick={() => handleNavigate("/dashboard")}
                className="cursor-pointer border-b border-white/10 pb-3 hover:text-green-200 transition-colors"
              >
                Dashboard
              </span>

              {/* Updated Contact Link to match others */}
              <span
                onClick={() => handleScrollToSection("contact")}
                className="capitalize cursor-pointer border-b border-white/10 pb-3 hover:text-green-200 transition-colors"
              >
                Contact Us
              </span>
            </div>
         </div>
      </div>
    </nav>
  );
};

export default Navbar;