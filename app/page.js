import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LiveDetector from "../components/LiveDetector";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-void">
      <Navbar />
      <Hero />
      <LiveDetector />
      <HowItWorks />
      <Footer />
    </main>
  );
}
