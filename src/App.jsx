import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Collaborators from "./pages/Collaborators";
import Contact from "./pages/Contact";
import WebMap from "./pages/WebMap";
import Datasets from "./pages/Datasets";
import Dashboard from "./pages/Dashboard";


import "./index.css";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-gray-50">
          <Routes>
            {/* Single-page (main site) */}
            <Route
              path="/"
              element={
                <>
                  <section id="home"><Home /></section>
                  <section id="about"><About /></section>
                  <section id="services"><Services /></section>
                  <section id="collaborators"><Collaborators /></section>
                  <section id="contact"><Contact /></section>
                </>
              }
            />

            {/* Separate Web Map page */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/datasets" element={<Datasets />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
