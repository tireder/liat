import Image from "next/image";
import DownloadButtons from "./DownloadButtons";

export default function AppPromotion() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left: Text & CTA */}
                    <div className="max-w-2xl text-center lg:text-right mx-auto lg:mx-0 relative z-10">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--foreground)] mb-6">
                            לקבוע תור מעולם לא היה
                            <br />
                            <span className="text-[var(--color-primary-dark)]">פשוט ונוח כל כך</span>
                        </h2>
                        <p className="text-lg md:text-xl text-[var(--foreground-muted)] mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                            הורידי את האפליקציה החדשה שלנו ותהני מחווית שירות חלקה ומהירה יותר.
                            בחרי את הטיפול, קבעי תור בקליק, צפי בגלריה והכל ישר מהנייד.
                        </p>

                        <DownloadButtons />
                    </div>

                    {/* Right: Mockup Image */}
                    <div className="relative mx-auto w-full max-w-sm lg:max-w-md pt-8 lg:pt-0">
                        {/* Background Blob / Glow for the phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-pink-200/40 rounded-full blur-3xl -z-10" />

                        <Image
                            src="/images/app-mockup-v2.png"
                            alt="Liat Nail Artist Mobile App Preview"
                            width={600}
                            height={800}
                            priority
                            className="w-full h-auto drop-shadow-2xl relative z-10 animate-fade-in-up"
                            style={{
                                width: '100%',
                                maxHeight: '600px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}
