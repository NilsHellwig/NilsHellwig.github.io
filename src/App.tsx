import React, { ReactNode, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Lectures from "./pages/Lectures";
import Projects from "./pages/Projects";
import Publications from "./pages/Publications";
import Service from "./pages/Service";

// Components
import NavBar from "./components/Navbar";
import PageSelector from "./components/PageSelector";
import MountainBackground from "./components/MountainBackground";

const App: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div>
      <Router>
        <Routes>
          <Route
            path=""
            element={
              <StandardUI background="hero">
                <Home />
              </StandardUI>
            }
          />
          <Route
            path="about"
            element={
              <StandardUI background="subtle">
                <About />
              </StandardUI>
            }
          />
          <Route
            path="blog/*"
            element={
              <StandardUI background="subtle">
                <Blog />
              </StandardUI>
            }
          />
          <Route
            path="lectures"
            element={
              <StandardUI background="subtle">
                <Lectures />
              </StandardUI>
            }
          />
          <Route
            path="projects/:projectName?"
            element={
              <StandardUI background="subtle">
                <Projects showOverlay={showOverlay} setShowOverlay={setShowOverlay} />
              </StandardUI>
            }
          />
          <Route
            path="publications"
            element={
              <StandardUI background="subtle">
                <Publications />
              </StandardUI>
            }
          />
          <Route
            path="service"
            element={
              <StandardUI background="subtle">
                <Service />
              </StandardUI>
            }
          />
        </Routes>
      </Router>
      {showOverlay && (
        <div
          className="bg-gray-200 dark:bg-zinc-900 fixed flex w-screen h-screen top-0 bg-opacity-70 dark:bg-opacity-80 backdrop-blur-sm z-20"
          onClick={() => {
            setShowOverlay(false);
            if (document.body.style.overflow !== "hidden") {
              document.body.style.overflow = "hidden";
            } else {
              document.body.style.overflow = "scroll";
            }
          }}
        ></div>
      )}
    </div>
  );
};

const StandardUI: React.FC<{ children: ReactNode; background: "hero" | "subtle" }> = ({
  children,
  background,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="page-outer min-h-screen flex flex-col" style={{ fontFamily: "Inter" }}>
      <MountainBackground subtle={background === "subtle"} />
      <div className="flex-1 flex flex-col">
        <div
          className={`fixed w-screen pt-2 z-20 ${background === "subtle" ? "bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md" : "backdrop-blur-sm"}`}
        >
          <header className="max-w-[1100px] w-[100%] mx-auto px-4 mt-0 relative">
            <NavBar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
            <PageSelector mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          </header>
        </div>
        <div className="page-inner flex-1 max-w-[1100px] w-[100%] mx-auto p-4 py-40">
          {children}
        </div>
      </div>
    </div>
  );
};

export default App;
