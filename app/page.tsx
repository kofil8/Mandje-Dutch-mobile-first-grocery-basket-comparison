import Header from "./components/Header";
import Hero from "./components/Hero";
import ComparisonEngine from "./components/ComparisonEngine";
import PageFooter from "./components/PageFooter";

export default function Home() {
  return (
    <main className="app-shell">
      <a className="skip-link" href="#shopping-list">
        Direct naar je boodschappenlijst
      </a>
      <Header />
      <Hero />
      <ComparisonEngine />
      <PageFooter />
    </main>
  );
}
