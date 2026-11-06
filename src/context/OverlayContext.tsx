"use client";

import React, { createContext, useContext, useState } from "react";

interface OverlayContextType {
  showOverlay: boolean;
  setShowOverlay: React.Dispatch<React.SetStateAction<boolean>>;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <OverlayContext.Provider value={{ showOverlay, setShowOverlay }}>
      {children}
      {showOverlay && (
        <div
          className="bg-gray-200/70 dark:bg-zinc-900/80 fixed flex w-screen h-screen top-0 backdrop-blur-xs z-20"
          onClick={() => {
            setShowOverlay(false);
            document.body.style.overflow =
              document.body.style.overflow !== "hidden" ? "hidden" : "scroll";
          }}
        ></div>
      )}
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) throw new Error("useOverlay must be used within OverlayProvider");
  return context;
};
