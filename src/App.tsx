import React, { ReactNode, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Lectures from "./pages/Lectures";
import Projects from "./pages/Projects";
import Publications from "./pages/Publications";
import Skills from "./pages/Skills";

// Components
import NavBar from "./components/Navbar";
import PageSelector from "./components/PageSelector";

const App: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div>
      <Router>
        <Routes>
          <Route
            path=""
            element={
              <StandardUI transparentBackground={true}>
                <Home />
              </StandardUI>
            }
          />
          <Route
            path="about"
            element={
              <StandardUI transparentBackground={false}>
                <About />
              </StandardUI>
            }
          />
          <Route
            path="blog/*"
            element={
              <StandardUI transparentBackground={false}>
                <Blog />
              </StandardUI>
            }
          />
          <Route
            path="lectures"
            element={
              <StandardUI transparentBackground={false}>
                <Lectures />
              </StandardUI>
            }
          />
          <Route
            path="projects/:projectName?"
            element={
              <StandardUI transparentBackground={false}>
                <Projects showOverlay={showOverlay} setShowOverlay={setShowOverlay} />
              </StandardUI>
            }
          />
          <Route
            path="publications"
            element={
              <StandardUI transparentBackground={false}>
                <Publications />
              </StandardUI>
            }
          />
          <Route
            path="skills"
            element={
              <StandardUI transparentBackground={false}>
                <Skills />
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

const StandardUI: React.FC<{ children: ReactNode; transparentBackground: boolean }> = ({
  children,
  transparentBackground,
}) => {
  return (
    <div
      className={`page-outer min-h-screen flex flex-col ${transparentBackground ? "gradient-bg" : "bg-zinc-50 dark:bg-zinc-900"}`}
      style={{ fontFamily: "Inter" }}
    >
      <div className="flex-1 flex flex-col">
        <div
          className={`fixed w-screen ${!transparentBackground ? "bg-zinc-50 dark:bg-zinc-900" : ""} bg-opacity-90 backdrop-blur-sm pt-2 z-20`}
        >
          <header className="max-w-[1100px] w-[100%] mx-auto px-4 mt-0">
            <NavBar />
            <PageSelector />
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
