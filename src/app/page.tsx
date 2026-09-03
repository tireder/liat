import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Services from "@/components/landing/Services";
import Gallery from "@/components/landing/Gallery";
import Reviews from "@/components/landing/Reviews";
import Courses from "@/components/landing/Courses";
import About from "@/components/landing/About";
import AppPromotion from "@/components/landing/AppPromotion";
import Contact from "@/components/landing/Contact";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import MyBookingsWidget from "@/components/ui/MyBookingsWidget";
import { createAdminClient } from "@/lib/supabase/server";
import type { CourseItem, GalleryImage, ReviewSummary, ServiceItem, SiteInfo } from "@/lib/landing";

// Refresh landing data every minute without blocking the request path
export const revalidate = 60;

const brand = (id: string, file: string, alt: string): GalleryImage => ({ id, url: `/images/brand/${file}`, alt });
const BRAND = {
  hero: [
    brand("brand-hero-1", "nails-1.jpg", "מניקור בגוון ניוד עם אצבע כרום"),
    brand("brand-hero-2", "nails-2.jpg", "מניקור צרפתי עדין"),
    brand("brand-hero-3", "nails-3.jpg", "ציפורניים שקדיות בגוון ורוד עדין"),
  ],
  about: [
    brand("brand-about-1", "salon-2.jpg", "חלל הסלון"),
    brand("brand-about-2", "work-1.jpg", "עבודת ציפורניים מהסטודיו"),
  ],
  cta: brand("brand-cta", "work-2.jpg", ""),
};

interface PageData {
  settings: SiteInfo;
  services: ServiceItem[];
  courses: CourseItem[];
  gallery: GalleryImage[];
  reviews: ReviewSummary;
}

const EMPTY: PageData = {
  settings: {},
  services: [],
  courses: [],
  gallery: [],
  reviews: { reviews: [], averageRating: 0, totalReviews: 0 },
};

async function getPageData(): Promise<PageData> {
  try {
    const supabase = createAdminClient();

    const [settingsRes, hoursRes, servicesRes, coursesRes, registrationsRes, galleryRes, reviewsRes, ratingsRes] =
      await Promise.all([
        supabase.from("settings").select("key, value"),
        supabase.from("operating_hours").select("day_of_week, open_time, close_time, active").order("day_of_week"),
        supabase.from("services").select("id, name, description, duration, price").eq("active", true).order("sort_order"),
        supabase.from("courses").select("*").eq("active", true).order("date"),
        supabase.from("course_registrations").select("course_id").eq("status", "confirmed"),
        supabase.from("gallery_images").select("id, url, alt, category").eq("active", true).order("sort_order").limit(12),
        supabase
          .from("reviews")
          .select("id, rating, comment, created_at, clients(name)")
          .eq("public", true)
          .eq("approved", true)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase.from("reviews").select("rating").eq("public", true).eq("approved", true),
      ]);

    // Settings map → typed site info
    const map: Record<string, string> = {};
    settingsRes.data?.forEach((s: { key: string; value: string }) => {
      map[s.key] = s.value;
    });

    const settings: SiteInfo = {
      businessName: map.business_name,
      heroTitle: map.hero_title,
      heroSubtitle: map.hero_subtitle,
      aboutName: map.about_name,
      aboutText: map.about_text,
      aboutYears: map.about_years,
      aboutClients: map.about_clients,
      aboutGraduates: map.about_graduates,
      phone: map.phone,
      address: map.address,
      whatsapp: map.whatsapp || map.phone,
      instagram: map.instagram,
      facebook: map.facebook,
      tiktok: map.tiktok,
      operatingHours: (hoursRes.data || []).map((h) => ({
        dayOfWeek: h.day_of_week,
        openTime: h.open_time,
        closeTime: h.close_time,
        active: h.active,
      })),
    };

    // Courses with confirmed enrollment counts
    const enrollmentMap: Record<string, number> = {};
    registrationsRes.data?.forEach((reg: { course_id: string }) => {
      enrollmentMap[reg.course_id] = (enrollmentMap[reg.course_id] || 0) + 1;
    });

    const courses: CourseItem[] = (coursesRes.data || []).map((course) => ({
      id: course.id,
      name: course.name,
      description: course.description,
      date: course.date,
      duration: course.duration,
      price: course.price,
      capacity: Number(course.capacity) || 0,
      enrolled: enrollmentMap[course.id] || 0,
      location: course.location ?? null,
      schedule_info: course.schedule_info ?? null,
    }));

    const gallery: GalleryImage[] = (galleryRes.data || []).map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      category: img.category ?? null,
    }));

    // Reviews: show first names only, average across every approved review
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewItems = (reviewsRes.data || []).map((r: any) => {
      const fullName: string = r.clients?.name || "";
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        name: fullName ? fullName.split(" ")[0] : "לקוחה",
        date: r.created_at,
      };
    });

    const allRatings = (ratingsRes.data || []).map((r: { rating: number }) => r.rating);
    const averageRating =
      allRatings.length > 0 ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length : 0;

    return {
      settings,
      services: servicesRes.data || [],
      courses,
      gallery,
      reviews: {
        reviews: reviewItems,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: allRatings.length,
      },
    };
  } catch (error) {
    console.error("Error fetching page data:", error);
    return EMPTY;
  }
}

export default async function Home() {
  const { settings, services, courses, gallery, reviews } = await getPageData();

  const rating = { average: reviews.averageRating, count: reviews.totalReviews };
  // Brand photography used until the gallery has uploads of its own
  const hasGallery = gallery.length > 0;
  const heroImages = hasGallery ? gallery.slice(0, 3) : BRAND.hero;
  const galleryImages = gallery.slice(0, 8);
  const aboutImages = gallery.length > 4 ? gallery.slice(3, 5) : hasGallery ? gallery.slice(0, 2) : BRAND.about;
  const ctaImage = hasGallery ? gallery[gallery.length > 5 ? 5 : 0] : BRAND.cta;

  return (
    <>
      <Header businessName={settings.businessName} />
      <main id="main">
        <Hero settings={settings} images={heroImages} rating={rating} />
        <TrustBar
          rating={rating}
          years={settings.aboutYears}
          clients={settings.aboutClients}
          graduates={settings.aboutGraduates}
        />
        <MyBookingsWidget />
        <Services initialServices={services} />
        <Gallery initialImages={galleryImages} />
        <Reviews initialData={reviews} />
        <Courses initialCourses={courses} />
        <About settings={settings} images={aboutImages} />
        <AppPromotion />
        <Contact initialSettings={settings} />
        <CTASection image={ctaImage} whatsapp={settings.whatsapp} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
