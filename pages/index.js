import { useState } from "react";
import Image from "next/image";
import { homeContent } from "../config/homeContent";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [searchName, setSearchName] = useState("");
  const [searchDetails, setSearchDetails] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Siin saad lisada otsinguloogika või suunata teisele lehele
    console.log("Otsing:", { searchName, searchDetails });
    // Näiteks: router.push(`/search?name=${searchName}&details=${searchDetails}`);
  };

  return (
    <div className={styles.container}>
      {/* Header logodega */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <Image
            src={homeContent.logos.left}
            alt="TLA"
            width={180}
            height={90}
            style={{ width: "auto", height: "auto", maxHeight: "75px" }}
          />
        </div>
        <div className={styles.logoCentre}>
          <Image
            src={homeContent.logos.center}
            alt="EKA"
            width={180}
            height={90}
            style={{ width: "auto", height: "auto", maxHeight: "75px" }}
          />
        </div>
        <div className={styles.logo}>
          <Image
            src={homeContent.logos.right}
            alt="EKM"
            width={180}
            height={90}
            style={{ width: "auto", height: "auto", maxHeight: "75px" }}
          />
        </div>
      </header>

      {/* Pealkiri */}
      <div className={styles.titleSection}>
        <h1 className={styles.mainTitle}>{homeContent.title}</h1>
        <h2 className={styles.subtitle}>{homeContent.subtitle}</h2>
      </div>

      {/* Otsing */}
      <form onSubmit={handleSearch} className={styles.searchSection}>
        <div className={styles.searchRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={homeContent.search.namePlaceholder}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
          <button type="submit" className={styles.searchButton}>
            🔍
          </button>
        </div>
        <div className={styles.searchRow}>
          <button type="button" className={styles.detailSearchButton}>
            {homeContent.search.detailsPlaceholder}
          </button>
        </div>
      </form>

      {/* Sisu sektsioon: kontakt ja annotatsioon */}
      <div className={styles.contentSection}>
        {/* Kontaktinfo */}
        <div className={styles.contact}>
          <h3>{homeContent.contact.title}</h3>
          <p className={styles.contactName}>{homeContent.contact.name}</p>
          <p>{homeContent.contact.organization}</p>
          <a href={`mailto:${homeContent.contact.email}`}>
            {homeContent.contact.email}
          </a>
        </div>

        {/* Annotatsioon */}
        <div className={styles.annotation}>
          <h3>{homeContent.annotation.title}</h3>
          <p>{homeContent.annotation.text}</p>
        </div>
      </div>

      {/* Galerii */}
      <div className={styles.gallery}>
        {homeContent.gallery.map((image, index) => (
          <div key={index} className={styles.galleryItem}>
            <Image
              src={image}
              alt={`Galerii pilt ${index + 1}`}
              width={150}
              height={200}
              objectFit="cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
