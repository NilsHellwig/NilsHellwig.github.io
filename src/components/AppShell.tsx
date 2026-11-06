"use client";

import React, { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import NavBar from "./Navbar";
import PageSelector from "./PageSelector";
import MountainBackground from "./MountainBackground";

const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const background = pathname === "/" ? "hero" : "subtle";

  return (
    <div className="page-outer min-h-screen flex flex-col" style={{ fontFamily: "Inter" }}>
      <MountainBackground key={pathname} subtle={background === "subtle"} />
      <div className="flex-1 flex flex-col">
        <div
          className={`fixed w-screen pt-2 z-20 ${background === "subtle" ? "bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md" : "backdrop-blur-xs"}`}
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

export default AppShell;
