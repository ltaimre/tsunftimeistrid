import Link from "next/link";
import { useRouter } from "next/router";
import styles from "../styles/Header.module.css";

export default function Header() {
  const router = useRouter();
  const isHome = router.pathname === "/";

  // Avalehel ei näita headerit
  if (isHome) return null;

  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logoLink}>
        <span className={styles.logo}>T</span>
        <span className={styles.title}>Tsunftimeistrid</span>
      </Link>
    </header>
  );
}
