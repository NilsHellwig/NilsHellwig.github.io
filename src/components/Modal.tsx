"use client";

import { X } from "@phosphor-icons/react";
import React, { ReactNode, useEffect, useState } from "react";

interface ModalProps {
  onOpen: () => void;
  className?: string; // Neue Option für CSS-Klassen
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ onOpen, className, children }) => {
  return (
    <div className={` ${className}`} onClick={onOpen}>
      {children}
    </div>
  );
};

interface ModalContentProps {
  onClose: () => void;
  screenshotUrl: string;
}

export const ModalContent: React.FC<ModalContentProps> = ({ onClose, screenshotUrl }) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const loadImage = async () => {
      // Überprüfen Sie, ob screenshotUrl definiert ist
      if (screenshotUrl) {
        const image = new Image();

        image.onload = () => {
          setImageDimensions({ width: image.width, height: image.height });
        };

        image.src = screenshotUrl;
      }
    };

    // Laden Sie das Bild, wenn screenshotUrl definiert ist
    loadImage();
  }, [screenshotUrl]);

  return (
    <div
      className="fixed z-50 inset-0 overflow-auto bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <span className="absolute top-4 right-4 text-white cursor-pointer">
        <X size={24} weight="bold" />
      </span>
      <div className="flex items-center h-full justify-center">
        {/* Verwenden Sie die Bildabmessungen für die Gestaltung */}
        <img
          src={screenshotUrl}
          alt=""
          className={`rounded-xl ${imageDimensions.width > imageDimensions.height ? "w-4/5" : "h-full"}`}
        />
      </div>
    </div>
  );
};
