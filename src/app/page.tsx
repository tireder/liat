import Hero from "@/components/landing/Hero";
import Services from "@/components/landing/Services";
import MyBookingsWidget from "@/components/ui/MyBookingsWidget";
import Courses from "@/components/landing/Courses";
import Gallery from "@/components/landing/Gallery";
import Reviews from "@/components/landing/Reviews";
import About from "@/components/landing/About";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import { createAdminClient } from "@/lib/supabase/server";

// Fetch all data in parallel on the server
async function getPageData() {
  try {
    const supabase = createAdminClient();

    // Parallel fetching for faster load - ALL landing page data
    const [settingsRes, servicesRes, coursesRes, registrationsRes, galleryRes, reviewsRes] = await Promise.all([
      supabase.from("settings").select("*"),
      supabase.from("services").select("*").eq("active", true).order("sort_order"),
      supabase.from("courses").select("*").eq("active", true).order("date"),
      supabase.from("course_registrations").select("course_id").eq("status", "confirmed"),
      supabase.from("gallery").select("id, image_url, title, description").eq("active", true).order("sort_order").limit(6),
      supabase.from("reviews")
        .select("id, rating, comment, created_at, clients(name)")
        .eq("public", true)
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    // Process settings
    let settings = null;
    if (settingsRes.data) {
      const settingsMap: Record<string, string> = {};
      settingsRes.data.forEach((s: { key: string; value: string }) => {
        settingsMap[s.key] = s.value;
      });
      settings = {
        businessName: settingsMap.business_name,
        heroTitle: settingsMap.hero_title,
        heroSubtitle: settingsMap.hero_subtitle,
        aboutName: settingsMap.about_name,
        aboutText: settingsMap.about_text,
        aboutYears: settingsMap.about_years,
        aboutClients: settingsMap.about_clients,
        aboutGraduates: settingsMap.about_graduates,
      };
    }

    // Process courses with enrollment counts
    const enrollmentMap: Record<string, number> = {};
    registrationsRes.data?.forEach((reg: { course_id: string }) => {
      enrollmentMap[reg.course_id] = (enrollmentMap[reg.course_id] || 0) + 1;
    });

    const coursesWithEnrollment = coursesRes.data?.map((course) => ({
      ...course,
      enrolled: enrollmentMap[course.id] || 0,
      capacity: course.max_participants || 10,
    })) || [];

    // Process gallery
    const gallery = galleryRes.data?.map((img) => ({
      id: img.id,
      url: img.image_url,
      alt: img.title || img.description,
      sort_order: 0,
    })) || [];

    // Process reviews with average rating
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = (reviewsRes.data || []).map((r: any) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      name: r.clients?.name || "לקוחה",
      date: r.created_at,
    }));

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0;

    return {
      settings,
      services: servicesRes.data || [],
      courses: coursesWithEnrollment,
      gallery,
      reviews: { reviews, averageRating },
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return { settings: null, services: [], courses: [], gallery: [], reviews: { reviews: [], averageRating: 0 } };
  }
}

export default async function Home() {
  const { settings, services, courses, gallery, reviews } = await getPageData();

  return (
    <main>
      <Hero settings={settings || undefined} />
      <MyBookingsWidget />
      <Reviews initialData={reviews} />
      <Services initialServices={services} />
      <Courses initialCourses={courses} />
      <Gallery initialImages={gallery} />
      <About settings={settings || undefined} />
      <Contact />
      <Footer />
    </main>
  );
}
