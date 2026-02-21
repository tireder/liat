import { GallerySkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
    return (
        <div style={{ minHeight: '100vh', paddingTop: '2rem' }}>
            <GallerySkeleton />
        </div>
    );
}
