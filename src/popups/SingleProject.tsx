import { ArrowLeft, ArrowRight, ArrowSquareOut, X } from "phosphor-react";
import React, { MouseEventHandler, useEffect, useState } from "react";
import { PROJECTS } from "../data/projects";
import { PROGRAMMING_LANGUAGES, ProgrammingLanguage } from "../data/programming-languages";
import { openLinkInNewTab } from "../helper";
import { Modal, ModalContent } from "../components/Modal";
import { motion } from "framer-motion";

interface SingleProjectProps {
  showSingleProjectFct: MouseEventHandler<HTMLDivElement>;
  projectId: string;
}

const SingleProject: React.FC<SingleProjectProps> = ({ showSingleProjectFct, projectId }) => {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryFullView, setGalleryFullView] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const project = PROJECTS.find((p) => p.id === projectId);

  const getLanguageData = (name: string): ProgrammingLanguage | undefined =>
    PROGRAMMING_LANGUAGES.find((l) => l.name === name);

  useEffect(() => {
    if (project?.galleryImages?.[galleryIndex]) {
      const img = new Image();
      img.onload = () => setImageDimensions({ width: img.width, height: img.height });
      img.src = require(`../img/screenshots-projects/${project.galleryImages[galleryIndex]}`);
    }
  }, [project, galleryIndex]);

  const hasGallery = (project?.galleryImages?.length ?? 0) > 0;
  const hasLinks = (project?.links?.filter((l) => l.url).length ?? 0) > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={showSingleProjectFct}
      />

      {/* Modal panel */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={showSingleProjectFct}
      >
        <motion.div
          className="bg-white dark:bg-zinc-900 rounded-2xl border-[0.5px] border-zinc-300 dark:border-zinc-700 shadow-2xl w-full max-w-[960px] max-h-[88vh] flex flex-col overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-[0.5px] border-zinc-200 dark:border-zinc-700 p-1 flex-shrink-0">
                {project?.iconPath && (
                  <img
                    src={project.iconPath}
                    alt={project.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                {project?.title}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                {project?.type}
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex-shrink-0 ml-3"
              onClick={showSingleProjectFct}
            >
              <X size={16} weight="bold" className="text-zinc-600 dark:text-zinc-400" />
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto overflow-x-hidden flex-1 px-5 py-5 flex flex-col gap-6">
            {/* Hero: icon + title + subtitle */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-[0.5px] border-zinc-200 dark:border-zinc-700 p-3 flex-shrink-0">
                {project?.iconPath && (
                  <img
                    src={project.iconPath}
                    alt={project?.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="pt-1">
                <h2 className="font-bold text-xl text-zinc-900 dark:text-white leading-tight">
                  {project?.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {project?.subtitle}
                </p>
              </div>
            </div>

            {/* Gallery */}
            {hasGallery && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  Gallery
                </p>
                <div className="relative bg-zinc-100 dark:bg-zinc-800 rounded-xl border-[0.5px] border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  {galleryFullView && project?.galleryImages && (
                    <ModalContent
                      onClose={() => setGalleryFullView(false)}
                      screenshotUrl={require(
                        `../img/screenshots-projects/${project.galleryImages[galleryIndex]}`,
                      )}
                    />
                  )}
                  <div className="flex items-center justify-between gap-2 p-3">
                    {/* Prev arrow */}
                    <button
                      onClick={() => galleryIndex > 0 && setGalleryIndex(galleryIndex - 1)}
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        galleryIndex === 0
                          ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                          : "text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 shadow-sm cursor-pointer"
                      }`}
                    >
                      <ArrowLeft size={18} weight="bold" />
                    </button>

                    {/* Image */}
                    {project?.galleryImages?.[galleryIndex] && (
                      <Modal
                        onOpen={() => setGalleryFullView(true)}
                        className="flex-1 flex justify-center"
                      >
                        <img
                          className={`rounded-lg border-[0.5px] border-zinc-200 dark:border-zinc-600 cursor-zoom-in ${
                            imageDimensions.width > imageDimensions.height
                              ? "w-full max-h-[480px] object-contain"
                              : "max-h-[480px] object-contain"
                          }`}
                          src={require(
                            `../img/screenshots-projects/${project.galleryImages[galleryIndex]}`,
                          )}
                          alt={`${project.title} screenshot`}
                        />
                      </Modal>
                    )}

                    {/* Next arrow */}
                    <button
                      onClick={() =>
                        project?.galleryImages &&
                        galleryIndex < project.galleryImages.length - 1 &&
                        setGalleryIndex(galleryIndex + 1)
                      }
                      className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                        galleryIndex + 1 === project?.galleryImages?.length
                          ? "text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                          : "text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 shadow-sm cursor-pointer"
                      }`}
                    >
                      <ArrowRight size={18} weight="bold" />
                    </button>
                  </div>

                  {/* Counter */}
                  <div className="flex justify-center pb-3">
                    <span className="text-xs font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 rounded-full tabular-nums">
                      {galleryIndex + 1} / {project?.galleryImages?.length}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {project?.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  About
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            {/* Programming Languages */}
            {(project?.programmingLanguages?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  Languages
                </p>
                <div className="flex flex-wrap gap-2">
                  {project!.programmingLanguages!.map((lang, i) => {
                    const data = getLanguageData(lang);
                    return (
                      <div
                        key={i}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-[0.5px] border-zinc-200 dark:border-zinc-700"
                      >
                        {data?.iconPath && (
                          <img src={data.iconPath} alt={lang} className="w-4 h-4 object-contain" />
                        )}
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          {lang}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Technologies */}
            {(project?.technologies?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  Technologies
                </p>
                <div className="flex flex-wrap gap-2">
                  {project!.technologies!.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full border-[0.5px] border-zinc-200 dark:border-zinc-600"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {hasLinks && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
                  Links
                </p>
                <div className="flex flex-col gap-2">
                  {project!
                    .links!.filter((l) => l.url)
                    .map((link, i) => (
                      <button
                        key={i}
                        onClick={() => openLinkInNewTab(link.url)}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border-[0.5px] border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-700 transition-all text-left w-full"
                      >
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                          {link.name}
                        </span>
                        <ArrowSquareOut
                          size={15}
                          weight="bold"
                          className="text-zinc-400 dark:text-zinc-500 flex-shrink-0"
                        />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SingleProject;
