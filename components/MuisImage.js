// components/MuisImage.js
import { useState, useMemo } from "react";
import Image from "next/image";
import styles from "../styles/MuisImage.module.css";

export default function MuisImage({
  src,
  alt = "MUIS pilt",
  aspectRatio = "4/3",
  caption,
  link,
  // uued mugavuspropid
  size = "sm", // "xs" | "sm" | "md" | "lg"
  center = false, // keskjoondus wrapperile
  quality = 70, // Next/Image'i kvaliteet (fail väiksem)
  sizes, // kui tahad 'sizes' üle kirjutada
  className, // lisa klass wrapperile
  imgClassName, // lisa klass pildile
}) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  // Aspect ratio -> padding-bottom %
  const ratioPadding = useMemo(() => {
    if (typeof aspectRatio === "number") return `${(1 / aspectRatio) * 100}%`;
    const [w, h] = (aspectRatio || "4/3").split("/").map(Number);
    return `${(h / w) * 100}%`;
  }, [aspectRatio]);

  // Blur placeholder (väike SVG skeleton)
  const blurSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='32' height='24'>
      <defs>
        <linearGradient id='g'>
          <stop stop-color='#eee' offset='20%'/><stop stop-color='#ddd' offset='50%'/><stop stop-color='#eee' offset='70%'/>
        </linearGradient>
      </defs>
      <rect width='32' height='24' fill='#eee'/>
      <rect id='r' width='32' height='24' fill='url(#g)'/>
      <animate xlink:href='#r' attributeName='x' from='-32' to='32' dur='1s' repeatCount='indefinite'/>
    </svg>`;
  const blurDataURL = "data:image/svg+xml;utf8," + encodeURIComponent(blurSvg);

  // eelseadistatud max-laiused (peegelduvad teie CSS-i .wrap--* klassidega)
  const sizeMap = { xs: 220, sm: 280, md: 360, lg: 480 };
  const widthPx = sizeMap[size] ?? sizeMap.sm;

  // vaikimisi sizes: mobiilis 100vw, muidu valitud max px
  const computedSizes = sizes || `(max-width: 768px) 100vw, ${widthPx}px`;

  return (
    <div
      className={[
        styles.wrap,
        styles[`wrap--${size}`] || "",
        center ? styles["wrap--center"] : "",
        className || "",
      ]
        .join(" ")
        .trim()}
    >
      <div className={styles.frame} style={{ paddingBottom: ratioPadding }}>
        {!failed ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={computedSizes}
            quality={quality}
            placeholder="blur"
            blurDataURL={blurDataURL}
            className={[styles.img, imgClassName || ""].join(" ").trim()}
            onError={() => setFailed(true)}
            // NB: 'unoptimized' on eemaldatud, et Next optimeeriks faili väiksemaks
          />
        ) : (
          <img
            src={src}
            alt={alt}
            className={[styles.img, imgClassName || ""].join(" ").trim()}
            style={{ width: "100%", height: "auto" }}
            onError={() => setFailed(true)}
          />
        )}

        <button
          type="button"
          aria-label="Ava suurelt"
          onClick={() => setOpen(true)}
          className={styles.zoomBtn}
        >
          Vaata
        </button>
      </div>

      {(caption || link) && (
        <p className={styles.caption}>
          {caption && <span>{caption}</span>}
          {link && (
            <>
              {" "}
              <a href={link} target="_blank" rel="noopener noreferrer">
                Ava MUIS-is
              </a>
            </>
          )}
        </p>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className={styles.lightbox}
        >
          <img src={src} alt={alt} className={styles.lightboxImg} />
          <button
            onClick={() => setOpen(false)}
            aria-label="Sulge"
            className={styles.closeBtn}
          >
            Sulge
          </button>
        </div>
      )}
    </div>
  );
}
