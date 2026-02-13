import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toolsRef = useRef(null);

  const isDatasetsPage = location.pathname === "/datasets";
  const isDashboardPage = location.pathname.startsWith("/dashboard");
  const isProjectDetailsPage = location.pathname === "/projectdetails";

  /* =========================
     NAVIGATION HANDLERS
  ========================= */

  const handleScrollToSection = (id) => {
    navigate("/");
    setTimeout(() => {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }, 500);

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
    navigate("/");
  };

  /* =========================
     SCROLL EFFECT
  ========================= */

  useEffect(() => {
    if (isDatasetsPage || isDashboardPage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      const carousel = document.querySelector("#home");
      if (carousel) {
        const carouselBottom =
          carousel.offsetTop + carousel.offsetHeight;
        setIsScrolled(window.scrollY + 80 >= carouselBottom);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDatasetsPage, isDashboardPage]);

  /* =========================
     CLICK OUTSIDE DROPDOWN
  ========================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setIsToolsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     RENDER
  ========================= */

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isDatasetsPage || isDashboardPage || isProjectDetailsPage || isScrolled
          ? "bg-[#344E41] backdrop-blur-md shadow-md text-white"
          : "bg-white/30 backdrop-blur-md"
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-24 py-2">

        {/* ================= LOGO ================= */}
        <div
          onClick={handleLogoClick}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <img
            src="/cenvi_logo.png"
            alt="CENVI Logo"
            className="h-9 md:h-10 w-auto object-contain"
          />
          <span
            className={`text-xl font-bold ${
              isDatasetsPage || isDashboardPage || isProjectDetailsPage || isScrolled
                ? "text-white"
                : "text-[#344e41]"
            }`}
          >
            CENVI
          </span>
        </div>

        {/* ================= HAMBURGER ================= */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden bg-transparent border-none focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 ${
              isDatasetsPage || isDashboardPage || isProjectDetailsPage || isScrolled
                ? "text-white"
                : "text-[#344e41]"
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
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* ================= DESKTOP LINKS ================= */}
        <div className="hidden lg:flex space-x-6 font-medium items-center">

          {["about", "services", "collaborators"].map((item) => (
            <span
              key={item}
              onClick={() => handleScrollToSection(item)}
              className="cursor-pointer capitalize transition hover:text-[#588157]"
            >
              {item}
            </span>
          ))}

          <span
            onClick={() => handleNavigate("/projectdetails")}
            className="cursor-pointer capitalize transition hover:text-[#588157]"
          >
            Research Projects
          </span>

          {/* ================= TOOLS DROPDOWN ================= */}
          <div className="relative" ref={toolsRef}>
            <span
              onClick={() => setIsToolsOpen((prev) => !prev)}
              className={`cursor-pointer capitalize flex items-center gap-1 transition hover:text-[#588157] ${
                isDatasetsPage || isDashboardPage
                  ? "font-semibold"
                  : ""
              }`}
            >
              Tools
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isToolsOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>

            {isToolsOpen && (
              <div className="absolute left-0 top-full mt-2 w-44 bg-white text-[#344e41] rounded-md shadow-lg z-50">
                <span
                  onClick={() => handleNavigate("/datasets")}
                  className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Datasets
                </span>
                <span
                  onClick={() => handleNavigate("/dashboard")}
                  className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  Dashboard
                </span>
              </div>
            )}
          </div>

          <span
            onClick={() => handleScrollToSection("resources")}
            className="cursor-pointer capitalize transition hover:text-[#588157]"
          >
            Resources
          </span>

          <span
            onClick={() => handleScrollToSection("contact")}
            className="cursor-pointer capitalize transition hover:text-[#588157]"
          >
            Contact
          </span>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {isOpen && (
        <div className="lg:hidden bg-[#3a5a40]/30 backdrop-blur-md border-t text-center px-6 py-4 space-y-3 font-medium shadow-md">

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
            onClick={() => handleNavigate("/projectdetails")}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Research Projects
          </span>

          <span
            onClick={() => handleNavigate("/datasets")}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Datasets
          </span>

          <span
            onClick={() => handleNavigate("/dashboard")}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Dashboard
          </span>

          <span
            onClick={() => handleScrollToSection("resources")}
            className="block text-lg capitalize cursor-pointer hover:text-[#588157]"
          >
            Resources
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
