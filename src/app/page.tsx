import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import Courses from "@/components/landing/Courses";
import Gallery from "@/components/landing/Gallery";
import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Services />
      <Courses />
      <Gallery />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
