import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DownloadSimple, FilePdf, Books, CaretUp, CaretDown, GithubLogo } from "phosphor-react";
import { lectureFiles } from "../downloadable-files/lectures/lectureFiles";

type LectureProps = {
  lecture: {
    title: string;
    lecturer: string;
    term: string;
    iconPath?: string;
    icon?: React.ComponentType<any>;
    description: string;
    competences: string[];
    materials: { name: string; description: string; documentPath: string }[];
    githubUrl?: string;
  };
};

const Lecture: React.FC<LectureProps> = ({ lecture }) => {
  const [showMaterials, setShowMaterials] = useState(false);

  const handleDownload = (filePath: string) => {
    try {
      const pdfUrl = lectureFiles[filePath];
      if (!pdfUrl) {
        alert("Datei nicht gefunden. Bitte versuchen Sie es später erneut.");
        return;
      }
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filePath.split("/").pop() || "document.pdf";
      link.target = "_blank";
      link.click();
    } catch (error) {
      alert("Fehler beim Herunterladen der Datei. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <motion.div
      className="border-[0.5px] border-zinc-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden hover:shadow-md dark:hover:shadow-zinc-900/50 transition-all duration-150"
      whileHover={{ y: -2 }}
    >
      <div className="p-5">
        {/* Header: icon + title + meta */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-[0.5px] border-zinc-300 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 p-2">
            {lecture.icon ? (
              <lecture.icon size={28} weight="duotone" className="text-zinc-700 dark:text-zinc-300" />
            ) : (
              <img
                src={lecture.iconPath}
                alt={lecture.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug mb-2">
              {lecture.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {lecture.lecturer}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">{lecture.term}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
          {lecture.description}
        </p>

        {/* Topic pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {lecture.competences.map((competence, index) => (
            <span
              key={index}
              className="text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full border-[0.5px] border-zinc-200 dark:border-zinc-600"
            >
              {competence}
            </span>
          ))}
        </div>

        {/* Footer button row */}
        <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-700">
          {lecture.materials.length > 0 && (
            <button
              onClick={() => setShowMaterials(!showMaterials)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all duration-150"
            >
              <Books size={12} weight="bold" />
              Materials ({lecture.materials.length})
              {showMaterials ? (
                <CaretUp size={10} weight="bold" className="ml-0.5" />
              ) : (
                <CaretDown size={10} weight="bold" className="ml-0.5" />
              )}
            </button>
          )}
          {lecture.githubUrl && (
            <a
              href={lecture.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-all duration-150 shadow-sm"
            >
              <GithubLogo size={12} weight="fill" />
              View on GitHub
            </a>
          )}
        </div>
      </div>

      {/* Expandable materials list */}
      <AnimatePresence initial={false}>
        {showMaterials && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 px-5 py-4 flex flex-col gap-2">
              {lecture.materials.map((material, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800 border-[0.5px] border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {material.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      {material.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownload(material.documentPath)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-all duration-150 flex-shrink-0"
                  >
                    <DownloadSimple size={12} weight="bold" />
                    <FilePdf size={12} weight="bold" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Lecture;
