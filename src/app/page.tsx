import Hero from "@/components/landing/Hero";
import MyBookingsWidget from "@/components/ui/MyBookingsWidget";
import Courses from "@/components/landing/Courses";
import Gallery from "@/components/landing/Gallery";
import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import { createAdminClient } from "@/lib/supabase/server";

async function getSettings() {
  try {
    const supabase = createAdminClient();
    const { data: settings } = await supabase
      .from("settings")
      .select("key, value");

    if (!settings) return null;

    const settingsMap: Record<string, string> = {};
    settings.forEach((s: { key: string; value: string }) => {
      settingsMap[s.key] = s.value;
    });

    return {
      businessName: settingsMap.business_name,
      heroTitle: settingsMap.hero_title,
      heroSubtitle: settingsMap.hero_subtitle,
      aboutName: settingsMap.about_name,
      aboutText: settingsMap.about_text,
      aboutYears: settingsMap.about_years,
      aboutClients: settingsMap.about_clients,
      aboutGraduates: settingsMap.about_graduates,
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export default async function Home() {
  const settings = await getSettings();

  return (
    <main>
      <MyBookingsWidget />
      <Services />
      <Courses />
      <Gallery />
      <About settings={settings || undefined} />
      <Contact />
      <Footer />
    </main>
  );
}
