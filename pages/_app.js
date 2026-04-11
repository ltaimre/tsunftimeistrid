import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import Header from "@/components/Header";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const start = () => setLoading(true);
    const done  = () => setLoading(false);

    router.events.on("routeChangeStart",   start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError",    done);

    return () => {
      router.events.off("routeChangeStart",   start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError",    done);
    };
  }, [router]);

  return (
    <>
      {loading && (
        <>
          <div style={bar} />
          <div style={shimmer} />
        </>
      )}
      <Header />
      <Component {...pageProps} />
    </>
  );
}

const bar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 3,
  background: "linear-gradient(90deg, #3b82f6 0%, #93c5fd 40%, #3b82f6 100%)",
  backgroundSize: "200% 100%",
  zIndex: 9999,
  animation: "progress-bar 1.4s linear infinite",
};

const shimmer = {
  position: "fixed",
  top: 3,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(255,255,255,0.45)",
  zIndex: 9998,
  pointerEvents: "none",
};
