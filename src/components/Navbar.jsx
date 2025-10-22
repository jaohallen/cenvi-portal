import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isDatasetsPage = location.pathname === "/datasets";

  const handleScrollToSection = (id) => {
    if (isDatasetsPage) {
      navigate("/"); // Go home, then scroll
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 500);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const handleNavigateToDatasets = () => {
    setIsOpen(false);
    navigate("/datasets");
  };

  useEffect(() => {
    if (isDatasetsPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const carousel = document.querySelector("#home");
      if (carousel) {
        const carouselBottom = carousel.offsetTop + carousel.offsetHeight;
        setIsScrolled(window.scrollY + 80 >= carouselBottom);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDatasetsPage]);

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isDatasetsPage || isScrolled
          ? "bg-green-700 text-white shadow-md"
          : "bg-transparent text-white"
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-24 py-4">
        {/* Logo */}
        <div onClick={handleLogoClick} className="flex items-center space-x-3 cursor-pointer" role="link" aria-label="Go to home">
          <img src="/cenvi_logo.png" alt="CENVI Logo" className="w-10 h-10 rounded-full object-cover" />
          <span className="text-xl font-bold">CENVI</span>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden bg-transparent border-none focus:outline-none"
          aria-label="Toggle navigation menu"                 // ✅ a11y
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white hover:text-green-300 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Links (always visible) */}
        <div className="hidden lg:flex space-x-6 font-medium">
          {["home", "about", "services", "collaborators"].map((item) => (
            <span
              onClick={() => handleScrollToSection("about")}
              className="cursor-pointer capitalize transition text-white hover:text-green-300"
              role="button" tabIndex={0}                        // ✅ keyboard nav
              onKeyDown={(e) => e.key === "Enter" && handleScrollToSection("about")}
            >
              {item}
            </span>
          ))}

          <span
            onClick={handleNavigateToDatasets}
            className={`cursor-pointer capitalize transition text-white hover:text-green-300 ${
              isDatasetsPage ? "font-semibold" : ""
            }`}
          >
            Datasets
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className={`cursor-pointer capitalize transition text-white hover:text-green-300 ${
              activeSection === "contact" ? "font-semibold" : ""
            }`}
          >
            Contact
          </span>
        </div>

      </div>

      {/* ✅ Mobile Dropdown (always visible too) */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="lg:hidden bg-white/50 backdrop-blur-md px-6 py-4 space-y-3 font-medium shadow-md"
        >
          {["home", "about", "services", "collaborators"].map((item) => (
            <span
              key={item}
              onClick={() => handleScrollToSection(item)}
              className={`block text-lg capitalize cursor-pointer text-gray-900 hover:text-green-700 ${
                activeSection === item ? "font-semibold" : ""
              }`}
            >
              {item}
            </span>
          ))}

          <span
            onClick={handleNavigateToDatasets}
            className={`block text-lg capitalize cursor-pointer text-gray-900 hover:text-green-700 ${
              isDatasetsPage ? "font-semibold" : ""
            }`}
          >
            Datasets
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className={`block text-lg capitalize cursor-pointer text-gray-900 hover:text-green-700 ${
              activeSection === "contact" ? "font-semibold" : ""
            }`}
          >
            Contact
          </span>
        </div>
      )}

    </nav>
  );
};

export default Navbar;
