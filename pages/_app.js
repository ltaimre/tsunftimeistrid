import "../styles/globals.css"; // või './styles/globals.css' vastavalt failiasukohale
import Header from "@/components/Header";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  );
}
