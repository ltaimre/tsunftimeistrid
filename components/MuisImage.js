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
}) {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const ratioPadding = useMemo(() => {
    if (typeof aspectRatio === "number") return `${(1 / aspectRatio) * 100}%`;
    const [w, h] = (aspectRatio || "4/3").split("/").map(Number);
    return `${(h / w) * 100}%`;
  }, [aspectRatio]);

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

  return (
    <div className={styles.wrap}>
      <div className={styles.frame} style={{ paddingBottom: ratioPadding }}>
        {!failed ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            placeholder="blur"
            blurDataURL={blurDataURL}
            className={styles.img}
            onError={() => setFailed(true)}
            unoptimized
          />
        ) : (
          <img
            src={src}
            alt={alt}
            className={styles.img}
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

      {/* Caption ja link */}
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
