import "../styles/globals.css"; // või './styles/globals.css' vastavalt failiasukohale

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
