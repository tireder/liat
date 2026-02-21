import styles from './Skeleton.module.css';

// Generic skeleton box
export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
    return <div className={`${styles.skeleton} ${className}`} style={style} />;
}

// Section header skeleton
export function SectionHeaderSkeleton() {
    return (
        <div className={styles.sectionHeader}>
            <div className={`${styles.skeleton} ${styles.badge}`} style={{ width: 100, height: 24 }} />
            <div className={`${styles.skeleton} ${styles.title}`} style={{ width: 200, height: 32 }} />
            <div className={`${styles.skeleton} ${styles.divider}`} style={{ width: 60, height: 4 }} />
        </div>
    );
}

// Service card skeleton
export function ServiceCardSkeleton() {
    return (
        <div className={styles.cardSkeleton}>
            <div className={`${styles.skeleton}`} style={{ width: 48, height: 48, borderRadius: '0.75rem' }} />
            <div className={`${styles.skeleton}`} style={{ width: '70%', height: 24 }} />
            <div className={`${styles.skeleton}`} style={{ width: '100%', height: 16 }} />
            <div className={`${styles.skeleton}`} style={{ width: '60%', height: 16 }} />
            <div className={styles.meta}>
                <div className={`${styles.skeleton}`} style={{ width: 80, height: 20, borderRadius: '1rem' }} />
                <div className={`${styles.skeleton}`} style={{ width: 60, height: 24 }} />
            </div>
        </div>
    );
}

// Services section skeleton - matches real Services section layout
export function ServicesSkeleton() {
    return (
        <section className={styles.section} id="services">
            <div className={styles.container}>
                <SectionHeaderSkeleton />
                <div className={styles.cardGrid}>
                    {[...Array(6)].map((_, i) => (
                        <ServiceCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Course card skeleton
export function CourseCardSkeleton() {
    return (
        <div className={styles.cardSkeleton} style={{ padding: '1.5rem' }}>
            <div className={`${styles.skeleton}`} style={{ width: '80%', height: 28 }} />
            <div className={`${styles.skeleton}`} style={{ width: '100%', height: 16 }} />
            <div className={`${styles.skeleton}`} style={{ width: '90%', height: 16 }} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div className={`${styles.skeleton}`} style={{ width: 100, height: 20 }} />
                <div className={`${styles.skeleton}`} style={{ width: 80, height: 20 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div className={`${styles.skeleton}`} style={{ width: 80, height: 28 }} />
                <div className={`${styles.skeleton}`} style={{ width: 100, height: 40, borderRadius: '2rem' }} />
            </div>
        </div>
    );
}

// Courses section skeleton - matches real Courses section layout
export function CoursesSkeleton() {
    return (
        <section className={styles.section} id="courses">
            <div className={styles.container}>
                <SectionHeaderSkeleton />
                <div className={styles.cardGrid}>
                    {[...Array(3)].map((_, i) => (
                        <CourseCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Reviews section skeleton
export function ReviewsSkeleton() {
    return (
        <section className={styles.section} id="reviews">
            <div className={styles.container}>
                <SectionHeaderSkeleton />
                <div className={styles.cardGrid}>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={styles.cardSkeleton}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div className={`${styles.skeleton}`} style={{ width: 80, height: 20 }} />
                                <div className={`${styles.skeleton}`} style={{ width: 100, height: 20 }} />
                            </div>
                            <div className={`${styles.skeleton}`} style={{ width: '100%', height: 16 }} />
                            <div className={`${styles.skeleton}`} style={{ width: '70%', height: 16 }} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Gallery skeleton - matches real Gallery section layout
export function GallerySkeleton() {
    return (
        <section className={styles.section} id="gallery">
            <div className={styles.container}>
                <SectionHeaderSkeleton />
                <div className={styles.gallerySkeleton}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`${styles.skeleton} ${styles.galleryItem}`} />
                    ))}
                </div>
            </div>
        </section>
    );
}

// Full page loading skeleton
export function PageLoadingSkeleton() {
    return (
        <div className={styles.pageLoading}>
            {/* Hero skeleton */}
            <div className={styles.heroSkeleton}>
                <div className={`${styles.skeleton}`} style={{ width: 120, height: 28, borderRadius: '1rem' }} />
                <div className={`${styles.skeleton}`} style={{ width: 300, height: 48, maxWidth: '90%' }} />
                <div className={`${styles.skeleton}`} style={{ width: 400, height: 24, maxWidth: '80%' }} />
                <div className={`${styles.skeleton}`} style={{ width: 180, height: 48, borderRadius: '2rem', marginTop: '1rem' }} />
            </div>

            {/* Reviews skeleton */}
            <ReviewsSkeleton />

            {/* Services skeleton */}
            <ServicesSkeleton />

            {/* Courses skeleton */}
            <CoursesSkeleton />
        </div>
    );
}
