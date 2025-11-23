import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/HomeCarousel.module.css";

export default function HomeCarousel({ items = [] }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    checkScroll();
  }, [items]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className={styles.carouselWrapper}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scroll("left")}
          aria-label="Eelmised"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      )}

      {/* Scrollable Container */}
      <div ref={scrollRef} className={styles.carousel} onScroll={checkScroll}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.item}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className={styles.imageFrame}>
              <Image
                src={item.image}
                alt={item.artist}
                fill
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 280px"
                style={{ objectFit: "contain" }}
                className={styles.image}
              />

              {/* Overlay with artist name */}
              <div
                className={`${styles.overlay} ${
                  hoveredId === item.id ? styles.overlayVisible : ""
                }`}
              >
                <span className={styles.artistName}>{item.artist}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scroll("right")}
          aria-label="Järgmised"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6z" />
          </svg>
        </button>
      )}
    </div>
  );
}
