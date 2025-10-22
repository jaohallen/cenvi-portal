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
          ? "bg-green-700/60 backdrop-blur-md shadow-md text-white"
          : "bg-white/30 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-24 py-4">
        {/* 🔹 Logo */}
        <div
          onClick={handleLogoClick}
          className="flex items-center space-x-3 cursor-pointer"
          role="link"
          aria-label="Go to home"
        >
          <img
            src="/cenvi_logo.png"
            alt="CENVI Logo"
            className="h-10 md:h-12 w-auto object-contain"
            style={{ maxHeight: "48px" }}
          />
          <span
            className={`text-xl font-bold transition-colors duration-500 ${
              isDatasetsPage || isScrolled ? "text-white" : "text-black"
            }`}
          >
            CENVI
          </span>
        </div>

        {/* 🔹 Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden bg-transparent border-none focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition ${
              isDatasetsPage || isScrolled
                ? "text-white hover:text-green-300"
                : "text-black hover:text-green-900"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isOpen
                  ? "M6 18L18 6M6 6l12 12" // X icon
                  : "M4 6h16M4 12h16M4 18h16" // Hamburger
              }
            />
          </svg>
        </button>

        {/* 🔹 Desktop Links */}
        <div className="hidden lg:flex space-x-6 font-medium">
          {["home", "about", "services", "collaborators"].map((item) => (
            <span
              key={item}
              onClick={() => handleScrollToSection(item)}
              className="cursor-pointer capitalize transition hover:text-green-700"
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && handleScrollToSection(item)
              }
            >
              {item}
            </span>
          ))}

          <span
            onClick={handleNavigateToDatasets}
            className={`cursor-pointer capitalize transition hover:text-green-700 ${
              isDatasetsPage ? "font-semibold" : ""
            }`}
          >
            Datasets
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className={`cursor-pointer capitalize transition hover:text-green-700 ${
              activeSection === "contact" ? "font-semibold" : ""
            }`}
          >
            Contact
          </span>
        </div>
      </div>

      {/* 🔹 Mobile Dropdown — adaptive text color */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`lg:hidden bg-white/30 backdrop-blur-md border-t text-center px-6 py-4 space-y-3 font-medium shadow-md animate-fadeIn ${
            isDatasetsPage || isScrolled ? "text-white" : "text-black"
          }`}
        >
          {["home", "about", "services", "collaborators"].map((item) => (
            <span
              key={item}
              onClick={() => handleScrollToSection(item)}
              className={`block text-lg capitalize cursor-pointer hover:text-green-700 ${
                activeSection === item ? "font-semibold" : ""
              }`}
            >
              {item}
            </span>
          ))}

          <span
            onClick={handleNavigateToDatasets}
            className={`block text-lg capitalize cursor-pointer hover:text-green-700 ${
              isDatasetsPage ? "font-semibold" : ""
            }`}
          >
            Datasets
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className={`block text-lg capitalize cursor-pointer hover:text-green-700 ${
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
