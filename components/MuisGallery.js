import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "../styles/MuisGallery.module.css";

export default function MuisGallery({ images = [], altPrefix = "Pilt" }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, currentIndex]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  // Määra lingi URL ja tekst vastavalt tüübile
  const getImageLink = (img) => {
    if (img.type === "wiki") {
      return { url: img.wikiLink, label: "Ava WikiCommons-is" };
    }
    return { url: img.muisLink, label: "Ava MUIS-is" };
  };

  const currentLink = getImageLink(currentImage);
  const getThumbLink = (img) => getImageLink(img);

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={styles.grid}>
        {images.map((img, idx) => {
          const thumbLink = getThumbLink(img);
          return (
            <div
              key={`thumb-${img.muisId || img.filename}-${idx}`}
              className={styles.thumbnail}
              onClick={() => openLightbox(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openLightbox(idx);
                }
              }}
              aria-label={`Vaata pilti ${idx + 1}`}
            >
              <div className={styles.thumbFrame}>
                <Image
                  src={img.url}
                  alt={`${altPrefix} ${idx + 1}`}
                  fill
                  sizes="(max-width: 600px) 50vw, (max-width: 1024px) 33vw, 280px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className={styles.thumbCaption}>
                <span className={styles.thumbCounter}>
                  {idx + 1}/{images.length}
                </span>
                <a
                  href={thumbLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.thumbLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  {thumbLink.label}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className={styles.lightbox}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxOpen(false);
          }}
        >
          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={() => setLightboxOpen(false)}
            aria-label="Sulge galerii"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                className={`${styles.navBtn} ${styles.navBtnPrev}`}
                onClick={goToPrevious}
                aria-label="Eelmine pilt"
                disabled={images.length === 1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="currentColor"
                >
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnNext}`}
                onClick={goToNext}
                aria-label="Järgmine pilt"
                disabled={images.length === 1}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="32"
                  height="32"
                  fill="currentColor"
                >
                  <path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6z" />
                </svg>
              </button>
            </>
          )}

          {/* Image container */}
          <div className={styles.imageContainer}>
            <img
              src={currentImage.url}
              alt={`${altPrefix} ${currentIndex + 1}`}
              className={styles.lightboxImg}
            />
          </div>

          {/* Info bar */}
          <div className={styles.infoBar}>
            <div className={styles.infoContent}>
              <div className={styles.infoLeft}>
                <span className={styles.counter}>
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
              <a
                href={currentLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.muisLink}
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                >
                  <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                </svg>
                {currentLink.label}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
