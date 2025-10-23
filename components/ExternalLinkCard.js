// components/ExternalLinkCard.js
import { useMemo } from "react";
import styles from "../styles/ExternalLinkCard.module.css";

export default function ExternalLinkCard({
  // Sisu
  title = "Välise kirje placeholder",
  subtitle, // nt inventarinumber, kuupäev vms
  caption, // nt "Allikas: AISIS"
  link, // välise süsteemi URL (nõutav, kui tahad nupuga avada)
  ctaLabel = "Ava AISIS", // nupu tekst

  // Paigutus
  aspectRatio = "4/3", // "W/H" või number (W/H)
  size = "sm", // "xs" | "sm" | "md" | "lg"
  center = false, // keskjoondus wrapperile

  // Ligipääsetavus
  ariaLabel, // kui tahad eraldi aria-labeli nupule

  // Klassid
  className = "",
  cardClassName = "",
}) {
  const ratioPadding = useMemo(() => {
    if (typeof aspectRatio === "number") return `${(1 / aspectRatio) * 100}%`;
    const [w, h] = (aspectRatio || "4/3").split("/").map(Number);
    return `${(h / w) * 100}%`;
  }, [aspectRatio]);

  const hasLink = Boolean(link);
  const a11yLabel = ariaLabel || `${ctaLabel}${title ? `: ${title}` : ""}`;

  // Kaart tervikuna on navigeeritav Enter/Space'iga (role="button")
  const handleKeyDown = (e) => {
    if (!hasLink) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={[
        styles.wrap,
        styles[`wrap--${size}`] || "",
        center ? styles["wrap--center"] : "",
        className,
      ]
        .join(" ")
        .trim()}
    >
      <div
        className={[styles.frame, cardClassName].join(" ").trim()}
        style={{ paddingBottom: ratioPadding }}
        tabIndex={hasLink ? 0 : -1}
        role={hasLink ? "button" : undefined}
        aria-label={hasLink ? a11yLabel : undefined}
        onKeyDown={handleKeyDown}
        onClick={() =>
          hasLink && window.open(link, "_blank", "noopener,noreferrer")
        }
      >
        {/* Placeholderi sisu */}
        <div className={styles.placeholder}>
          <PlaceholderIcon className={styles.icon} />
          <div className={styles.texts}>
            {!!title && <div className={styles.title}>{title}</div>}
            {!!subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          </div>

          {hasLink && (
            <button
              type="button"
              className={styles.openBtn}
              aria-label={a11yLabel}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>

      {(caption || hasLink) && (
        <p className={styles.caption}>
          {caption && <span>{caption}</span>}
          {hasLink && (
            <>
              {" "}
              <a href={link} target="_blank" rel="noopener noreferrer">
                {ctaLabel}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function PlaceholderIcon({ className = "" }) {
  // Lihtne “link/external” ikoon SVG
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"></path>
      <path d="M5 5h6v2H7v10h10v-4h2v6H5V5z"></path>
    </svg>
  );
}
