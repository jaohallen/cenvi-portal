import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDatasetsPage = location.pathname === "/datasets";
  const isDashboardPage = location.pathname.startsWith("/dashboard");

  const handleScrollToSection = (id) => {
    navigate("/");
    setTimeout(() => {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }, 500);
    setIsOpen(false);
  };

  const handleNavigateToDatasets = () => {
    setIsOpen(false);
    navigate("/datasets");
  };

  const handleNavigateToDashboard = () => {
    setIsOpen(false);
    navigate("/dashboard");
  };

  const handleLogoClick = () => {
    setIsOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (isDatasetsPage || isDashboardPage) {
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
  }, [isDatasetsPage, isDashboardPage]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isDatasetsPage || isDashboardPage || isScrolled
          ? "bg-[#344E41] backdrop-blur-md shadow-md text-white"
          : "bg-white/30 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-24 py-4">
        {/* 🔹 Logo */}
        <div
          onClick={handleLogoClick}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <img
            src="/cenvi_logo.png"
            alt="CENVI Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
          <span
            className={`text-xl font-bold ${
              isDatasetsPage || isDashboardPage || isScrolled
                ? "text-white"
                : "text-[#344e41]"
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
            className={`h-6 w-6 ${
              isDatasetsPage || isDashboardPage || isScrolled
                ? "text-white hover:text-[#588157]"
                : "text-[#344e41] hover:text-[#588157]"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>

        {/* 🔹 Desktop Links */}
        <div className="hidden lg:flex space-x-6 font-medium items-center">
          {["home", "about", "services", "collaborators"].map((item) => (
            <span
              key={item}
              onClick={() => handleScrollToSection(item)}
              className="cursor-pointer capitalize transition hover:text-[#588157]"
            >
              {item}
            </span>
          ))}

          <span
            onClick={handleNavigateToDatasets}
            className={`cursor-pointer capitalize transition hover:text-[#588157] ${
              isDatasetsPage ? "font-semibold" : ""
            }`}
          >
            Datasets
          </span>

          {/* ✅ Single Dashboard Link */}
          <span
            onClick={handleNavigateToDashboard}
            className={`cursor-pointer capitalize transition hover:text-[#588157] ${
              isDashboardPage ? "font-semibold" : ""
            }`}
          >
            Dashboard
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className="cursor-pointer capitalize transition hover:text-[#588157]"
          >
            Contact
          </span>
        </div>
      </div>

      {/* 🔹 Mobile Menu (no dropdowns, all visible) */}
      {isOpen && (
        <div
          className={`lg:hidden bg-[#3a5a40]/30 backdrop-blur-md border-t text-center px-6 py-4 space-y-3 font-medium shadow-md animate-fadeIn ${
            isDatasetsPage || isDashboardPage || isScrolled
              ? "text-white"
              : "text-black"
          }`}
        >
          {["home", "about", "services", "collaborators"].map((item) => (
            <span
              key={item}
              onClick={() => handleScrollToSection(item)}
              className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
            >
              {item}
            </span>
          ))}

          <span
            onClick={handleNavigateToDatasets}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Datasets
          </span>

          {/* ✅ Single Dashboard link (no dropdown) */}
          <span
            onClick={handleNavigateToDashboard}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Dashboard
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Contact
          </span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
