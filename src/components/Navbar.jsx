import React, { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  // Track which section is visible for highlighting
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const carousel = document.querySelector("#home");
      if (carousel) {
        const carouselBottom = carousel.offsetTop + carousel.offsetHeight;
        // Turn solid the moment we pass the carousel bottom
        setIsScrolled(window.scrollY + 80 >= carouselBottom);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize on load
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest("button")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogoClick = () => {
    if (location.pathname !== "/") {
      window.location.href = "/";
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? "bg-green-700 text-white shadow-md" : "bg-transparent text-white"
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-24 py-4">
        {/* Logo + Title */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center space-x-3"
        >
          <img
            src="/cenvi_logo.png"
            alt="CENVI Logo"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-xl font-bold">CENVI</span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden bg-transparent border-none focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white hover:text-green-300 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-6 font-medium">
          {["home", "about", "services", "collaborators", "contact"].map((item) => (
            <span
              key={item}
              onClick={() => handleScroll(item)}
              className={`cursor-pointer capitalize transition ${
                activeSection === item
                  ? "text-green-300 font-semibold"
                  : "hover:text-green-300"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="lg:hidden bg-white/50 backdrop-blur-md px-6 py-4 space-y-3 text-gray-900 font-medium shadow-md"
        >
          {["home", "about", "services", "collaborators", "contact"].map((item) => (
            <span
              key={item}
              onClick={() => handleScroll(item)}
              className={`block text-lg capitalize cursor-pointer transition ${
                activeSection === item
                  ? "text-green-700 font-semibold"
                  : "hover:text-green-700"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
