"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import {
    CalendarIcon, ClockIcon, CheckIcon, XIcon,
    NailPolishIcon, HomeIcon, SettingsIcon, LogoutIcon, EditIcon, TrashIcon, PlusIcon, BookIcon, ImageIcon, PhoneIcon, StarIcon
} from "@/components/icons";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import NailPreviewView from "@/components/admin/NailPreviewView";
import styles from "./page.module.css";
import reviewsStyles from "./reviews.module.css";

interface DashboardData {
    todayBookings: Array<{
        id: string;
        time: string;
        client: string;
        phone: string;
        service: string;
        status: string;
    }>;
    pendingApprovals: Array<{
        id: string;
        client: string;
        originalDate: string;
        requestedDate: string | null;
        requestedTime: string | null;
        type: string;
    }>;
    weekStats: {
        total: number;
        confirmed: number;
        completed: number;
        cancelled: number;
        pending: number;
    };
}

interface Booking {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    notes: string | null;
    client: { id: string; name: string | null; phone: string } | null;
    service: { id: string; name: string; duration: number; price: number } | null;
}

interface Service {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    active: boolean;
    sort_order: number;
    reminder_days: number | null;
}

export default function AdminDashboard() {
    return (
        <ToastProvider>
            <AdminContent />
        </ToastProvider>
    );
}

function AdminContent() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "services" | "courses" | "gallery" | "clients" | "reviews" | "settings" | "nail-preview" | "artists">("dashboard");
    // Artist profile & role
    const [artistProfile, setArtistProfile] = useState<{ artistId: string; name: string; role: string } | null>(null);
    const isOwner = artistProfile?.role === "owner";
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [authChecked, setAuthChecked] = useState(false);
    const [statsPopup, setStatsPopup] = useState<{
        isOpen: boolean;
        title: string;
        bookings: { id: string; date: string; time: string; client: string; phone: string; service: string; status: string }[];
        loading: boolean;
    }>({ isOpen: false, title: "", bookings: [], loading: false });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = supabaseUrl && supabaseAnonKey
        ? createBrowserClient(supabaseUrl, supabaseAnonKey)
        : null;

    // Check authentication on mount
    useEffect(() => {
        async function checkAuth() {
            if (!supabase) {
                router.replace("/admin-login");
                return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace("/admin-login");
            } else {
                // Fetch artist profile
                try {
                    const res = await fetch("/api/admin/me");
                    if (res.ok) {
                        const profile = await res.json();
                        setArtistProfile(profile);
                    }
                } catch (e) {
                    console.error("Error fetching artist profile:", e);
                }
                setAuthChecked(true);
            }
        }
        checkAuth();
    }, [router, supabase]);

    async function handleLogout() {
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.replace("/admin-login");
    }

    useEffect(() => {
        if (authChecked && activeTab === "dashboard") {
            fetchDashboard();
        }
    }, [activeTab, authChecked]);

    async function fetchDashboard() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/dashboard");
            if (res.ok) {
                const data = await res.json();
                setDashboardData(data);
            }
        } catch (error) {
            console.error("Error fetching dashboard:", error);
        }
        setLoading(false);
    }

    async function handleApproval(bookingId: string, action: "approve" | "deny") {
        try {
            const res = await fetch("/api/admin/dashboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, action }),
            });
            if (res.ok) {
                fetchDashboard(); // Refresh
            }
        } catch (error) {
            console.error("Error handling approval:", error);
        }
    }

    const todayBookings = dashboardData?.todayBookings || [];
    const pendingApprovals = dashboardData?.pendingApprovals || [];
    const weekStats = dashboardData?.weekStats || { total: 0, confirmed: 0, completed: 0, cancelled: 0, pending: 0 };

    async function fetchStatsBookings(period: "week" | "month") {
        setStatsPopup(prev => ({ ...prev, isOpen: true, loading: true, title: period === "week" ? "תורים השבוע" : "תורים החודש", bookings: [] }));
        try {
            const res = await fetch(`/api/admin/bookings?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                setStatsPopup(prev => ({ ...prev, bookings: data, loading: false }));
            } else {
                setStatsPopup(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error("Error fetching stats bookings:", error);
            setStatsPopup(prev => ({ ...prev, loading: false }));
        }
    }

    function handleStatCardKeyDown(event: React.KeyboardEvent<HTMLDivElement>, period: "week" | "month") {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            fetchStatsBookings(period);
        }
    }

    // Don't render until auth is verified
    if (!authChecked) {
        return (
            <div className={styles.page} dir="rtl" lang="he">
                <div className={styles.loading}>בודק הרשאות...</div>
            </div>
        );
    }

    return (
        <div className={styles.page} dir="rtl" lang="he">
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <NailPolishIcon size={24} color="var(--color-primary)" />
                    <h1 className={styles.headerTitle}>ניהול</h1>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/" className={styles.homeBtn}>
                        <HomeIcon size={20} />
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutBtn} title="יציאה">
                        <LogoutIcon size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.content}>
                {activeTab === "dashboard" && (
                    <>
                        {loading ? (
                            <div className={styles.loading}>טוען...</div>
                        ) : (
                            <>
                                {/* Stats Grid */}
                                <section className={styles.stats}>
                                    <div className={styles.statCard}>
                                        <span className={styles.statNumber}>{todayBookings.length}</span>
                                        <span className={styles.statLabel}>תורים היום</span>
                                    </div>
                                    <div className={styles.statCard} data-highlight={pendingApprovals.length > 0}>
                                        <span className={styles.statNumber}>{pendingApprovals.length}</span>
                                        <span className={styles.statLabel}>ממתינים לאישור</span>
                                    </div>
                                    <div
                                        className={`${styles.statCard} ${styles.clickable}`}
                                        onClick={() => fetchStatsBookings("week")}
                                        onKeyDown={(event) => handleStatCardKeyDown(event, "week")}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="הצג תורים לשבוע"
                                    >
                                        <span className={styles.statNumber}>{weekStats.confirmed}</span>
                                        <span className={styles.statLabel}>השבוע</span>
                                    </div>
                                    <div
                                        className={`${styles.statCard} ${styles.clickable}`}
                                        onClick={() => fetchStatsBookings("month")}
                                        onKeyDown={(event) => handleStatCardKeyDown(event, "month")}
                                        role="button"
                                        tabIndex={0}
                                        aria-label="הצג תורים לחודש"
                                    >
                                        <span className={styles.statNumber}>{weekStats.total}</span>
                                        <span className={styles.statLabel}>סה״כ החודש</span>
                                    </div>
                                </section>

                                {/* Pending Approvals */}
                                {pendingApprovals.length > 0 && (
                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>
                                            <span className={styles.alertDot} />
                                            ממתינים לאישור
                                        </h2>
                                        <div className={styles.pendingList}>
                                            {pendingApprovals.map((item) => (
                                                <div key={item.id} className={styles.pendingCard}>
                                                    <div className={styles.pendingInfo}>
                                                        <span className={styles.pendingClient}>{item.client}</span>
                                                        <span className={styles.pendingType}>
                                                            {item.type === "cancel" ? "בקשת ביטול" : "בקשת שינוי מועד"}
                                                        </span>
                                                        <span className={styles.pendingDates}>
                                                            {item.type === "reschedule"
                                                                ? `${item.originalDate} ← ${item.requestedDate}`
                                                                : item.originalDate}
                                                        </span>
                                                    </div>
                                                    <div className={styles.pendingActions}>
                                                        <button
                                                            className={styles.approveBtn}
                                                            aria-label="אישור"
                                                            onClick={() => handleApproval(item.id, "approve")}
                                                        >
                                                            <CheckIcon size={18} />
                                                        </button>
                                                        <button
                                                            className={styles.denyBtn}
                                                            aria-label="דחייה"
                                                            onClick={() => handleApproval(item.id, "deny")}
                                                        >
                                                            <XIcon size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Today's Bookings */}
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>תורים להיום</h2>
                                    {todayBookings.length === 0 ? (
                                        <p className={styles.emptyStateText}>אין תורים להיום</p>
                                    ) : (
                                        <div className={styles.bookingList}>
                                            {todayBookings.map((booking) => (
                                                <div key={booking.id} className={styles.bookingCard}>
                                                    <div className={styles.bookingTime}>{booking.time}</div>
                                                    <div className={styles.bookingInfo}>
                                                        <span className={styles.bookingClient}>{booking.client}</span>
                                                        <span className={styles.bookingService}>{booking.service}</span>
                                                    </div>
                                                    <div className={styles.bookingMeta}>
                                                        <a href={`tel:${booking.phone}`} className={styles.bookingPhone}>
                                                            {booking.phone}
                                                        </a>
                                                        <span
                                                            className={styles.bookingStatus}
                                                            data-status={booking.status}
                                                        >
                                                            {booking.status === "confirmed" ? "מאושר" : "ממתין"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                    </>
                )}

                {activeTab === "bookings" && <BookingsView artistId={isOwner ? undefined : artistProfile?.artistId} isOwner={isOwner} />}
                {activeTab === "services" && <ServicesView />}
                {activeTab === "courses" && <CoursesView />}
                {activeTab === "gallery" && <GalleryView />}
                {activeTab === "clients" && <ClientsView />}
                {isOwner && activeTab === "settings" && <SettingsView />}
                {activeTab === "reviews" && <ReviewsView />}
                {activeTab === "nail-preview" && <NailPreviewView />}
                {isOwner && activeTab === "artists" && <ArtistsView />}
            </main>

            {/* Stats Popup Modal */}
            {statsPopup.isOpen && (
                <div className={styles.modalOverlay} onClick={() => setStatsPopup(prev => ({ ...prev, isOpen: false }))}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{statsPopup.title}</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setStatsPopup(prev => ({ ...prev, isOpen: false }))}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            {statsPopup.loading ? (
                                <div className={styles.loading}>טוען...</div>
                            ) : statsPopup.bookings.length === 0 ? (
                                <p style={{ textAlign: "center", color: "var(--foreground-muted)" }}>אין תורים</p>
                            ) : (
                                <div className={styles.bookingList}>
                                    {statsPopup.bookings.map((booking) => (
                                        <div key={booking.id} className={styles.bookingCard}>
                                            <div className={styles.bookingTime}>
                                                <span>{new Date(booking.date).toLocaleDateString("he-IL", { weekday: "short", day: "numeric", month: "short" })}</span>
                                                <span>{booking.time}</span>
                                            </div>
                                            <div className={styles.bookingInfo}>
                                                <span className={styles.bookingClient}>{booking.client}</span>
                                                <span className={styles.bookingService}>{booking.service}</span>
                                            </div>
                                            <div className={styles.bookingMeta}>
                                                <a href={`tel:${booking.phone}`} className={styles.bookingPhone}>
                                                    {booking.phone}
                                                </a>
                                                <span className={styles.bookingStatus} data-status={booking.status}>
                                                    {booking.status === "confirmed" ? "מאושר" : booking.status === "pending" ? "ממתין" : booking.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className={styles.bottomNav} aria-label="ניווט ניהול">
                <button
                    className={`${styles.navItem} ${activeTab === "dashboard" ? styles.active : ""}`}
                    onClick={() => setActiveTab("dashboard")}
                    aria-label="לוח בקרה"
                    aria-current={activeTab === "dashboard" ? "page" : undefined}
                >
                    <CalendarIcon size={22} />
                    <span>לוח בקרה</span>
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === "bookings" ? styles.active : ""}`}
                    onClick={() => setActiveTab("bookings")}
                    aria-label="תורים"
                    aria-current={activeTab === "bookings" ? "page" : undefined}
                >
                    <ClockIcon size={22} />
                    <span>תורים</span>
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === "services" ? styles.active : ""}`}
                    onClick={() => setActiveTab("services")}
                    aria-label="שירותים"
                    aria-current={activeTab === "services" ? "page" : undefined}
                >
                    <NailPolishIcon size={22} />
                    <span>שירותים</span>
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === "courses" ? styles.active : ""}`}
                    onClick={() => setActiveTab("courses")}
                    aria-label="קורסים"
                    aria-current={activeTab === "courses" ? "page" : undefined}
                >
                    <BookIcon size={22} />
                    <span>קורסים</span>
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === "gallery" ? styles.active : ""}`}
                    onClick={() => setActiveTab("gallery")}
                    aria-label="גלריה"
                    aria-current={activeTab === "gallery" ? "page" : undefined}
                >
                    <ImageIcon size={22} />
                    <span>גלריה</span>
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === "clients" ? styles.active : ""}`}
                    onClick={() => setActiveTab("clients")}
                    aria-label="לקוחות"
                    aria-current={activeTab === "clients" ? "page" : undefined}
                >
                    <PhoneIcon size={22} />
                    <span>לקוחות</span>
                </button>
                <button
                    className={`${styles.navItem} ${activeTab === "reviews" ? styles.active : ""}`}
                    onClick={() => setActiveTab("reviews")}
                    aria-label="ביקורות"
                    aria-current={activeTab === "reviews" ? "page" : undefined}
                >
                    <StarIcon size={22} />
                    <span>ביקורות</span>
                </button>
                {/* Temporarily hidden - nail detection not perfect yet
                <button
                    className={`${styles.navItem} ${activeTab === "nail-preview" ? styles.active : ""}`}
                    onClick={() => setActiveTab("nail-preview")}
                >
                    <span style={{ fontSize: "1.25rem" }}>🎨</span>
                    <span>צבעים</span>
                </button>
                */}
                {isOwner && (
                    <button
                        className={`${styles.navItem} ${activeTab === "settings" ? styles.active : ""}`}
                        onClick={() => setActiveTab("settings")}
                        aria-label="הגדרות"
                        aria-current={activeTab === "settings" ? "page" : undefined}
                    >
                        <SettingsIcon size={22} />
                        <span>הגדרות</span>
                    </button>
                )}
                {isOwner && (
                    <button
                        className={`${styles.navItem} ${activeTab === "artists" ? styles.active : ""}`}
                        onClick={() => setActiveTab("artists")}
                        aria-label="אמניות"
                        aria-current={activeTab === "artists" ? "page" : undefined}
                    >
                        <span style={{ fontSize: "1.25rem" }}>👩‍🎨</span>
                        <span>אמניות</span>
                    </button>
                )}
            </nav>
        </div >
    );
}

// Bookings View Component - Now fetches real data
function BookingsView({ artistId, isOwner }: { artistId?: string; isOwner?: boolean }) {
    const { showToast } = useToast();
    const [filter, setFilter] = useState<"all" | "confirmed" | "pending" | "cancelled" | "completed">("all");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit modal state
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [editDate, setEditDate] = useState("");
    const [editTime, setEditTime] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter !== "all") {
                params.set("status", filter);
            }
            if (artistId) {
                params.set("artistId", artistId);
            }
            const res = await fetch(`/api/admin/bookings?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            showToast("שגיאה בטעינת התורים", "error");
        }
        setLoading(false);
    }, [filter, showToast]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    async function updateBookingStatus(bookingId: string, newStatus: string, previousStatus: string) {
        try {
            const res = await fetch("/api/admin/bookings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, status: newStatus, previousStatus }),
            });
            if (res.ok) {
                showToast("הסטטוס עודכן בהצלחה", "success");
                fetchBookings();
            } else {
                showToast("שגיאה בעדכון הסטטוס", "error");
            }
        } catch (error) {
            console.error("Error updating booking:", error);
            showToast("שגיאה בעדכון הסטטוס", "error");
        }
    }

    function openEditModal(booking: Booking) {
        setEditingBooking(booking);
        setEditDate(booking.date);
        setEditTime(booking.start_time.slice(0, 5));
    }

    async function rescheduleBooking() {
        if (!editingBooking || !editDate || !editTime) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/bookings/${editingBooking.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    changeType: "changed",
                    newDate: editDate,
                    newTime: editTime,
                }),
            });

            if (res.ok) {
                showToast("התור עודכן ונשלחה הודעה ללקוח", "success");
                setEditingBooking(null);
                fetchBookings();
            } else {
                showToast("שגיאה בעדכון התור", "error");
            }
        } catch (error) {
            console.error("Error rescheduling booking:", error);
            showToast("שגיאה בעדכון התור", "error");
        }
        setSaving(false);
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
    }

    function getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            confirmed: "מאושר",
            pending: "ממתין",
            pending_change: "ממתין לאישור",
            cancelled: "בוטל",
            completed: "הושלם",
            no_show: "לא הגיע",
        };
        return labels[status] || status;
    }

    return (
        <div className={styles.viewContainer}>
            <div className={styles.filters}>
                {[
                    { key: "all", label: "הכל" },
                    { key: "confirmed", label: "מאושר" },
                    { key: "pending", label: "ממתין" },
                    { key: "completed", label: "הושלם" },
                    { key: "cancelled", label: "בוטל" },
                ].map((f) => (
                    <button
                        key={f.key}
                        className={`${styles.filterBtn} ${filter === f.key ? styles.active : ""}`}
                        onClick={() => setFilter(f.key as typeof filter)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>טוען תורים...</div>
            ) : bookings.length === 0 ? (
                <p style={{ color: "var(--foreground-muted)", textAlign: "center", padding: "2rem" }}>
                    אין תורים להצגה
                </p>
            ) : (
                <div className={styles.bookingList}>
                    {bookings.map((booking) => (
                        <div key={booking.id} className={styles.bookingCard}>
                            <div className={styles.bookingDate}>
                                <span>{formatDate(booking.date)}</span>
                                <span>{booking.start_time.slice(0, 5)}</span>
                            </div>
                            <div className={styles.bookingInfo}>
                                <span className={styles.bookingClient}>
                                    {booking.client?.name || booking.client?.phone || "לקוח לא ידוע"}
                                </span>
                                <span className={styles.bookingService}>
                                    {booking.service?.name || "שירות לא ידוע"}
                                </span>
                            </div>
                            <div className={styles.bookingMeta}>
                                {booking.client?.phone && (
                                    <a href={`tel:${booking.client.phone}`} className={styles.bookingPhone}>
                                        {booking.client.phone}
                                    </a>
                                )}
                                <select
                                    value={booking.status}
                                    onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking.status)}
                                    className={styles.statusSelect}
                                    data-status={booking.status}
                                >
                                    <option value="pending">ממתין</option>
                                    <option value="confirmed">מאושר</option>
                                    <option value="completed">הושלם</option>
                                    <option value="cancelled">בוטל</option>
                                    <option value="no_show">לא הגיע</option>
                                </select>
                                <button
                                    className={styles.editBtn}
                                    onClick={() => openEditModal(booking)}
                                    title="ערוך תור"
                                >
                                    ✏️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingBooking && (
                <div className={styles.modalOverlay} onClick={() => setEditingBooking(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>עריכת תור</h3>
                        <p className={styles.modalInfo}>
                            {editingBooking.client?.name || editingBooking.client?.phone} - {editingBooking.service?.name}
                        </p>
                        <div className={styles.modalField}>
                            <label>תאריך</label>
                            <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className={styles.textInput}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>
                        <div className={styles.modalField}>
                            <label>שעה</label>
                            <input
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setEditingBooking(null)}
                            >
                                ביטול
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={rescheduleBooking}
                                disabled={saving}
                            >
                                {saving ? "שומר..." : "שמור ושלח הודעה"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Services View Component - Now fetches real data with CRUD
function ServicesView() {
    const { showToast } = useToast();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        duration: "60",
        price: "100",
        active: true,
        reminder_days: "",
    });

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/services");
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
            showToast("שגיאה בטעינת השירותים", "error");
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    function openAddModal() {
        setEditingService(null);
        setFormData({
            name: "",
            description: "",
            duration: "60",
            price: "100",
            active: true,
            reminder_days: "",
        });
        setIsModalOpen(true);
    }

    function openEditModal(service: Service) {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || "",
            duration: service.duration.toString(),
            price: service.price.toString(),
            active: service.active,
            reminder_days: service.reminder_days?.toString() || "",
        });
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const url = "/api/admin/services";
            const method = editingService ? "PUT" : "POST";
            const body = editingService
                ? { id: editingService.id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                showToast(editingService ? "השירות עודכן בהצלחה" : "השירות נוסף בהצלחה", "success");
                setIsModalOpen(false);
                fetchServices();
            } else {
                const error = await res.json();
                showToast(error.error || "שגיאה בשמירה", "error");
            }
        } catch (error) {
            console.error("Error saving service:", error);
            showToast("שגיאה בשמירה", "error");
        }
    }

    async function toggleServiceActive(service: Service) {
        try {
            const res = await fetch("/api/admin/services", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: service.id, active: !service.active }),
            });
            if (res.ok) {
                showToast(service.active ? "השירות הושבת" : "השירות הופעל", "success");
                fetchServices();
            }
        } catch (error) {
            console.error("Error toggling service:", error);
            showToast("שגיאה בעדכון השירות", "error");
        }
    }

    async function deleteService(service: Service) {
        if (!confirm(`האם למחוק את השירות "${service.name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/services?id=${service.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast("השירות נמחק", "success");
                fetchServices();
            } else {
                const error = await res.json();
                showToast(error.error || "שגיאה במחיקה", "error");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            showToast("שגיאה במחיקה", "error");
        }
    }

    return (
        <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
                <h2>שירותים</h2>
                <button
                    className="btn btn-primary"
                    style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={openAddModal}
                >
                    <PlusIcon size={16} />
                    הוספה
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>טוען שירותים...</div>
            ) : services.length === 0 ? (
                <p style={{ color: "var(--foreground-muted)", textAlign: "center", padding: "2rem" }}>
                    אין שירותים. לחצי על &quot;הוספה&quot; כדי להוסיף שירות חדש.
                </p>
            ) : (
                <div className={styles.serviceList}>
                    {services.map((service) => (
                        <div key={service.id} className={styles.serviceCard} data-inactive={!service.active}>
                            <div className={styles.serviceInfo}>
                                <span className={styles.serviceName}>{service.name}</span>
                                <span className={styles.serviceMeta}>
                                    {service.duration} דק׳ • ₪{service.price}
                                </span>
                            </div>
                            <div className={styles.serviceActions}>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={service.active}
                                        onChange={() => toggleServiceActive(service)}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                                <button className={styles.editBtn} onClick={() => openEditModal(service)}>
                                    <EditIcon size={16} />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => deleteService(service)}>
                                    <TrashIcon size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {editingService ? "עריכת שירות" : "הוספת שירות"}
                        </h3>
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formField}>
                                <label>שם השירות</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className={styles.textInput}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>תיאור (אופציונלי)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className={styles.textInput}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>משך (דקות)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        required
                                        min="5"
                                        className={styles.numberInput}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>מחיר (₪)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                        min="0"
                                        className={styles.numberInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    />
                                    שירות פעיל
                                </label>
                            </div>
                            <div className={styles.formField}>
                                <label>תזכורת אוטומטית (ימים אחרי תור)</label>
                                <input
                                    type="number"
                                    value={formData.reminder_days}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reminder_days: e.target.value }))}
                                    min="1"
                                    placeholder="השאר ריק לביטול"
                                    className={styles.numberInput}
                                />
                                <span className={styles.fieldHint}>אם ריק - לא תישלח תזכורת. אם 21 - תישלח SMS ללקוח 21 יום אחרי התור האחרון.</span>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                    ביטול
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingService ? "שמירה" : "הוספה"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Settings View Component
function SettingsView() {
    const { showToast } = useToast();
    const dayNames = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

    const [hours, setHours] = useState([
        { day_of_week: 0, day: "ראשון", open_time: "09:00", close_time: "20:00", active: true },
        { day_of_week: 1, day: "שני", open_time: "09:00", close_time: "20:00", active: true },
        { day_of_week: 2, day: "שלישי", open_time: "09:00", close_time: "20:00", active: true },
        { day_of_week: 3, day: "רביעי", open_time: "09:00", close_time: "20:00", active: true },
        { day_of_week: 4, day: "חמישי", open_time: "09:00", close_time: "20:00", active: true },
        { day_of_week: 5, day: "שישי", open_time: "09:00", close_time: "14:00", active: true },
        { day_of_week: 6, day: "שבת", open_time: "", close_time: "", active: false },
    ]);

    const [holidays, setHolidays] = useState<{ id: string; date: string; reason: string }[]>([]);
    const [newHoliday, setNewHoliday] = useState({ startDate: "", endDate: "", reason: "" });
    const [settings, setSettings] = useState({
        cancel_hours_before: "24",
        buffer_minutes: "15",
        phone: "",
        address: "",
        instagram: "",
        facebook: "",
        tiktok: "",
        whatsapp: "",
        otp_method: "sms4free" as "supabase" | "sms4free",
        business_name: "ליאת",
        sms_sender: "",
        sms_enabled: "true",
        calendar_token: "",
        // Hero section
        hero_title: "יופי בקצות האצבעות",
        hero_subtitle: "טיפולי ציפורניים מקצועיים בסביבה אינטימית ומפנקת. כל ביקור הוא חוויה.",
        // About section
        about_name: "ליאת",
        about_text: "מזה למעלה מ-8 שנים אני עוסקת באמנות הציפורניים מתוך אהבה אמיתית למקצוע.",
        about_years: "8",
        about_clients: "500",
        about_graduates: "50",
    });
    const [calendarLink, setCalendarLink] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingHours, setEditingHours] = useState<number | null>(null);

    // Load settings from database on mount
    useEffect(() => {
        async function loadSettings() {
            try {
                // Load settings and operating hours
                const settingsRes = await fetch("/api/admin/settings");
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (data.settings) {
                        setSettings(prev => ({
                            ...prev,
                            cancel_hours_before: data.settings.cancel_hours_before || prev.cancel_hours_before,
                            buffer_minutes: data.settings.buffer_minutes || prev.buffer_minutes,
                            phone: data.settings.phone || "",
                            address: data.settings.address || "",
                            instagram: data.settings.instagram || "",
                            facebook: data.settings.facebook || "",
                            tiktok: data.settings.tiktok || "",
                            whatsapp: data.settings.whatsapp || "",
                            otp_method: data.settings.otp_method || "sms4free",
                            business_name: data.settings.business_name || "ליאת",
                            sms_sender: data.settings.sms_sender || "",
                            sms_enabled: data.settings.sms_enabled || "true",
                            calendar_token: data.settings.calendar_token || "",
                            // Hero section
                            hero_title: data.settings.hero_title || prev.hero_title,
                            hero_subtitle: data.settings.hero_subtitle || prev.hero_subtitle,
                            // About section
                            about_name: data.settings.about_name || prev.about_name,
                            about_text: data.settings.about_text || prev.about_text,
                            about_years: data.settings.about_years || prev.about_years,
                            about_clients: data.settings.about_clients || prev.about_clients,
                            about_graduates: data.settings.about_graduates || prev.about_graduates,
                        }));
                    }
                    if (data.operatingHours && data.operatingHours.length > 0) {
                        setHours(data.operatingHours.map((h: { day_of_week: number; open_time: string | null; close_time: string | null; active: boolean }) => ({
                            day_of_week: h.day_of_week,
                            day: dayNames[h.day_of_week],
                            open_time: h.open_time || "09:00",
                            close_time: h.close_time || "20:00",
                            active: h.active,
                        })));
                    }
                    if (data.settings && data.settings.calendar_token) {
                        setCalendarLink(`${window.location.origin}/api/calendar/feed?token=${data.settings.calendar_token}`);
                    }
                }

                // Load holidays
                const holidaysRes = await fetch("/api/admin/holidays");
                if (holidaysRes.ok) {
                    const holidaysData = await holidaysRes.json();
                    setHolidays(holidaysData.map((h: { id: string; date: string; reason: string }) => ({
                        id: h.id,
                        date: h.date,
                        reason: h.reason || "חופשה",
                    })));
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            }
            setLoading(false);
        }
        loadSettings();
    }, []);

    const updateHours = (index: number, field: string, value: string | boolean) => {
        setHours(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
    };

    const addHoliday = () => {
        if (!newHoliday.startDate) return;

        const start = new Date(newHoliday.startDate);
        const end = newHoliday.endDate ? new Date(newHoliday.endDate) : start;
        const datesToAdd: { id: string; date: string; reason: string }[] = [];

        // Generate all dates in range
        const current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            // Check if date already exists
            if (!holidays.find(h => h.date === dateStr)) {
                datesToAdd.push({
                    id: `${Date.now()}-${dateStr}`,
                    date: dateStr,
                    reason: newHoliday.reason || "חופשה"
                });
            }
            current.setDate(current.getDate() + 1);
        }

        if (datesToAdd.length > 0) {
            setHolidays(prev => [...prev, ...datesToAdd]);
        }
        setNewHoliday({ startDate: "", endDate: "", reason: "" });
    };

    const removeHoliday = (id: string) => {
        setHolidays(prev => prev.filter(h => h.id !== id));
    };

    const generateCalendarToken = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setSettings(prev => ({ ...prev, calendar_token: token }));
        setCalendarLink(`${window.location.origin}/api/calendar/feed?token=${token}`);
        showToast("נוצר טוקן חדש - יש לשמור את ההגדרות", "success");
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const settingsRes = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    settings,
                    operatingHours: hours.map(h => ({
                        day_of_week: h.day_of_week,
                        open_time: h.active ? h.open_time : null,
                        close_time: h.active ? h.close_time : null,
                        active: h.active,
                    })),
                }),
            });

            if (!settingsRes.ok) {
                throw new Error("Failed to save settings");
            }

            // Save holidays as blocked slots
            for (const holiday of holidays) {
                const holidayRes = await fetch("/api/admin/holidays", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        date: holiday.date,
                        all_day: true,
                        reason: holiday.reason,
                    }),
                });
                if (!holidayRes.ok) {
                    console.error("Failed to save holiday:", holiday.date);
                }
            }
            showToast("השינויים נשמרו בהצלחה", "success");
        } catch (error) {
            console.error("Error saving:", error);
            showToast("שגיאה בשמירת ההגדרות", "error");
        }
        setSaving(false);
    };

    return (
        <div className={styles.viewContainer}>
            {loading ? (
                <div className={styles.loading}>טוען הגדרות...</div>
            ) : (
                <>
                    {/* Operating Hours */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>שעות פעילות</h3>
                        <div className={styles.hoursGrid}>
                            {hours.map((h, index) => (
                                <div key={h.day_of_week} className={styles.hoursRow}>
                                    <label className={styles.hoursToggle}>
                                        <input
                                            type="checkbox"
                                            checked={h.active}
                                            onChange={(e) => updateHours(index, "active", e.target.checked)}
                                        />
                                        <span className={styles.hoursDay}>{h.day}</span>
                                    </label>
                                    {h.active ? (
                                        editingHours === index ? (
                                            <div className={styles.hoursEdit}>
                                                <input
                                                    type="time"
                                                    value={h.open_time}
                                                    onChange={(e) => updateHours(index, "open_time", e.target.value)}
                                                    className={styles.timeInput}
                                                />
                                                <span>-</span>
                                                <input
                                                    type="time"
                                                    value={h.close_time}
                                                    onChange={(e) => updateHours(index, "close_time", e.target.value)}
                                                    className={styles.timeInput}
                                                />
                                                <button
                                                    className={styles.doneBtn}
                                                    onClick={() => setEditingHours(null)}
                                                >
                                                    ✓
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className={styles.hoursTime}
                                                onClick={() => setEditingHours(index)}
                                            >
                                                {h.open_time} - {h.close_time}
                                            </button>
                                        )
                                    ) : (
                                        <span className={styles.hoursClosed}>סגור</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Holidays / Blocked Days */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>חופשות וימים חסומים</h3>
                        <div className={styles.holidayAdd}>
                            <div className={styles.holidayDateRange}>
                                <div className={styles.dateField}>
                                    <label>מתאריך</label>
                                    <input
                                        type="date"
                                        value={newHoliday.startDate}
                                        onChange={(e) => setNewHoliday(prev => ({ ...prev, startDate: e.target.value }))}
                                        className={styles.dateInput}
                                    />
                                </div>
                                <div className={styles.dateField}>
                                    <label>עד תאריך</label>
                                    <input
                                        type="date"
                                        value={newHoliday.endDate}
                                        min={newHoliday.startDate}
                                        onChange={(e) => setNewHoliday(prev => ({ ...prev, endDate: e.target.value }))}
                                        className={styles.dateInput}
                                    />
                                </div>
                            </div>
                            <input
                                type="text"
                                placeholder="סיבה (אופציונלי)"
                                value={newHoliday.reason}
                                onChange={(e) => setNewHoliday(prev => ({ ...prev, reason: e.target.value }))}
                                className={styles.textInput}
                            />
                            <button
                                className={styles.addHolidayBtn}
                                onClick={addHoliday}
                                disabled={!newHoliday.startDate}
                            >
                                {newHoliday.endDate && newHoliday.startDate !== newHoliday.endDate ? "+ הוסף טווח" : "+"}
                            </button>
                        </div>
                        {holidays.length > 0 && (
                            <div className={styles.holidayList}>
                                {holidays.map((h) => (
                                    <div key={h.id} className={styles.holidayItem}>
                                        <span className={styles.holidayDate}>
                                            {new Date(h.date).toLocaleDateString("he-IL")}
                                        </span>
                                        <span className={styles.holidayReason}>{h.reason}</span>
                                        <button
                                            className={styles.removeHolidayBtn}
                                            onClick={() => removeHoliday(h.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* OTP / SMS Settings */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>הגדרות SMS</h3>
                        <div className={styles.settingsField}>
                            <label>שם העסק (מוצג בהודעות ובאתר)</label>
                            <input
                                type="text"
                                value={settings.business_name}
                                onChange={(e) => setSettings(prev => ({ ...prev, business_name: e.target.value }))}
                                className={styles.textInput}
                                placeholder="ליאת"
                            />
                            <span className={styles.fieldHint}>השם שמוצג בהודעות SMS, ביומן ובאתר</span>
                        </div>
                        <div className={styles.settingsField}>
                            <label>שם שולח SMS (SMS4Free)</label>
                            <input
                                type="text"
                                value={settings.sms_sender}
                                onChange={(e) => setSettings(prev => ({ ...prev, sms_sender: e.target.value }))}
                                className={styles.textInput}
                                placeholder="Liat"
                            />
                            <span className={styles.fieldHint}>שם השולח המאושר ב-SMS4Free (באנגלית, עד 11 תווים)</span>
                        </div>
                        <div className={styles.settingsField}>
                            <label>הודעות SMS</label>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <button
                                    type="button"
                                    onClick={() => setSettings(prev => ({ ...prev, sms_enabled: prev.sms_enabled === "true" ? "false" : "true" }))}
                                    style={{
                                        width: "3rem",
                                        height: "1.5rem",
                                        borderRadius: "1rem",
                                        border: "none",
                                        cursor: "pointer",
                                        position: "relative",
                                        transition: "background 0.2s",
                                        backgroundColor: settings.sms_enabled === "true" ? "#4ade80" : "#d1d5db",
                                    }}
                                >
                                    <span style={{
                                        position: "absolute",
                                        top: "2px",
                                        left: settings.sms_enabled === "true" ? "calc(100% - 1.25rem - 2px)" : "2px",
                                        width: "1.25rem",
                                        height: "1.25rem",
                                        borderRadius: "50%",
                                        backgroundColor: "white",
                                        transition: "left 0.2s",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                    }} />
                                </button>
                                <span style={{ color: settings.sms_enabled === "true" ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                                    {settings.sms_enabled === "true" ? "פעיל ✓" : "מושבת ✕"}
                                </span>
                            </div>
                            <span className={styles.fieldHint}>כבי הודעות SMS בזמן בדיקות כדי לחסוך בשליחות. כשמושבת, ההודעות נרשמות בלוג במקום להישלח.</span>
                        </div>
                        <div className={styles.settingsField}>
                            <label>שיטת אימות OTP</label>
                            <select
                                value={settings.otp_method}
                                onChange={(e) => setSettings(prev => ({ ...prev, otp_method: e.target.value as "supabase" | "sms4free" }))}
                                className={styles.selectInput}
                            >
                                <option value="sms4free">SMS4Free (מומלץ)</option>
                                <option value="supabase">Supabase Auth</option>
                            </select>
                            <span className={styles.fieldHint}>
                                {settings.otp_method === "sms4free"
                                    ? "שליחת SMS דרך SMS4Free.co.il"
                                    : "שימוש ב-Supabase Auth לאימות OTP"}
                            </span>
                        </div>
                    </div>

                    {/* Hero Section Settings */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>הגדרות עמוד ראשי (Hero)</h3>
                        <div className={styles.settingsField}>
                            <label>כותרת ראשית</label>
                            <input
                                type="text"
                                value={settings.hero_title}
                                onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                                className={styles.textInput}
                                placeholder="יופי בקצות האצבעות"
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>תת-כותרת</label>
                            <textarea
                                value={settings.hero_subtitle}
                                onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                                className={styles.textArea}
                                placeholder="טיפולי ציפורניים מקצועיים..."
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* About Section Settings */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>הגדרות אודות</h3>
                        <div className={styles.settingsField}>
                            <label>שם (להצגה בעמוד אודות)</label>
                            <input
                                type="text"
                                value={settings.about_name}
                                onChange={(e) => setSettings(prev => ({ ...prev, about_name: e.target.value }))}
                                className={styles.textInput}
                                placeholder="ליאת"
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>טקסט אודות</label>
                            <textarea
                                value={settings.about_text}
                                onChange={(e) => setSettings(prev => ({ ...prev, about_text: e.target.value }))}
                                className={styles.textArea}
                                placeholder="ספרי על עצמך..."
                                rows={4}
                            />
                        </div>
                        <div className={styles.settingsRow}>
                            <div className={styles.settingsField}>
                                <label>שנות ניסיון</label>
                                <input
                                    type="number"
                                    value={settings.about_years}
                                    onChange={(e) => setSettings(prev => ({ ...prev, about_years: e.target.value }))}
                                    className={styles.numberInput}
                                />
                            </div>
                            <div className={styles.settingsField}>
                                <label>מספר לקוחות</label>
                                <input
                                    type="number"
                                    value={settings.about_clients}
                                    onChange={(e) => setSettings(prev => ({ ...prev, about_clients: e.target.value }))}
                                    className={styles.numberInput}
                                />
                            </div>
                            <div className={styles.settingsField}>
                                <label>בוגרות קורסים</label>
                                <input
                                    type="number"
                                    value={settings.about_graduates}
                                    onChange={(e) => setSettings(prev => ({ ...prev, about_graduates: e.target.value }))}
                                    className={styles.numberInput}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calendar Sync */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>סנכרון יומן (Google / Apple Calendar)</h3>
                        <div className={styles.calendarSync} style={{ padding: "1rem", background: "var(--background-secondary)", borderRadius: "var(--radius-md)" }}>
                            <p className={styles.infoText} style={{ marginBottom: "1rem", color: "var(--foreground-muted)" }}>
                                העתיקי את הקישור למטה והוסיפי אותו כ"יומן רשום" (Subscribed Calendar) ב-iPhone או ב-Google Calendar כדי לראות את כל התורים ביומן האישי שלך.
                            </p>

                            {calendarLink ? (
                                <div className={styles.linkBox} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                                    <input
                                        readOnly
                                        value={calendarLink}
                                        dir="ltr"
                                        onClick={e => e.currentTarget.select()}
                                        className={styles.textInput}
                                        style={{ flex: 1 }}
                                    />
                                    <button type="button" className="btn btn-secondary" onClick={() => {
                                        navigator.clipboard.writeText(calendarLink);
                                        showToast("הקישור הועתק!", "success");
                                    }}>
                                        העתק
                                    </button>
                                </div>
                            ) : (
                                <button type="button" className="btn btn-secondary" onClick={generateCalendarToken}>
                                    צור קישור לסנכרון יומן
                                </button>
                            )}

                            <div className={styles.warningBox}>
                                <small style={{ display: "block", color: "var(--color-warning)", marginBottom: "0.5rem" }}>⚠️ הקישור הזה הוא אישי וסודי. אל תשתפי אותו עם אחרים.</small>
                                <button type="button" className={styles.textLink} style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "0.875rem" }} onClick={generateCalendarToken}>
                                    {calendarLink ? "צור קישור חדש (יבטל את הקודם)" : ""}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Policy Settings */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>מדיניות</h3>
                        <div className={styles.settingsField}>
                            <label>שעות לפני שדרוש אישור לביטול</label>
                            <input
                                type="number"
                                value={settings.cancel_hours_before}
                                onChange={(e) => setSettings(prev => ({ ...prev, cancel_hours_before: e.target.value }))}
                                className={styles.numberInput}
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>זמן בין תורים (דקות)</label>
                            <input
                                type="number"
                                value={settings.buffer_minutes}
                                onChange={(e) => setSettings(prev => ({ ...prev, buffer_minutes: e.target.value }))}
                                className={styles.numberInput}
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>פרטי קשר</h3>
                        <div className={styles.settingsField}>
                            <label>טלפון</label>
                            <input
                                type="tel"
                                value={settings.phone}
                                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>כתובת</label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                                className={styles.textInput}
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className={styles.settingsSection}>
                        <h3 className={styles.settingsSectionTitle}>רשתות חברתיות</h3>
                        <div className={styles.settingsField}>
                            <label>Instagram</label>
                            <input
                                type="url"
                                value={settings.instagram}
                                onChange={(e) => setSettings(prev => ({ ...prev, instagram: e.target.value }))}
                                placeholder="https://instagram.com/your_handle"
                                dir="ltr"
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>Facebook</label>
                            <input
                                type="url"
                                value={settings.facebook}
                                onChange={(e) => setSettings(prev => ({ ...prev, facebook: e.target.value }))}
                                placeholder="https://facebook.com/your_page"
                                dir="ltr"
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>TikTok</label>
                            <input
                                type="url"
                                value={settings.tiktok}
                                onChange={(e) => setSettings(prev => ({ ...prev, tiktok: e.target.value }))}
                                placeholder="https://tiktok.com/@your_handle"
                                dir="ltr"
                                className={styles.textInput}
                            />
                        </div>
                        <div className={styles.settingsField}>
                            <label>WhatsApp</label>
                            <input
                                type="tel"
                                value={settings.whatsapp}
                                onChange={(e) => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                                placeholder="+972501234567"
                                dir="ltr"
                                className={styles.textInput}
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: "100%", marginTop: "1rem" }}
                        onClick={saveSettings}
                        disabled={saving}
                    >
                        {saving ? "שומר..." : "שמירת שינויים"}
                    </button>
                </>
            )}
        </div>
    );
}

// Courses View Component
interface Course {
    id: string;
    name: string;
    description: string | null;
    date: string;
    duration: string;
    price: number;
    capacity: number;
    active: boolean;
    enrolled: number;
    waitlist: number;
    location?: string | null;
    schedule_info?: string | null;
    whatsapp_group_link?: string | null;
}

function CoursesView() {
    const { showToast } = useToast();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        duration: "",
        price: "0",
        capacity: "10",
        active: true,
        location: "",
        schedule_info: "",
        whatsapp_group_link: "",
    });

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            showToast("שגיאה בטעינת הקורסים", "error");
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    function openAddModal() {
        setEditingCourse(null);
        setFormData({
            name: "",
            description: "",
            date: "",
            duration: "4 שעות",
            price: "0",
            capacity: "10",
            active: true,
            location: "",
            schedule_info: "",
            whatsapp_group_link: "",
        });
        setIsModalOpen(true);
    }

    function openEditModal(course: Course) {
        setEditingCourse(course);
        setFormData({
            name: course.name,
            description: course.description || "",
            date: course.date,
            duration: course.duration,
            price: course.price.toString(),
            capacity: course.capacity.toString(),
            active: course.active,
            location: course.location || "",
            schedule_info: course.schedule_info || "",
            whatsapp_group_link: course.whatsapp_group_link || "",
        });
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const url = "/api/admin/courses";
            const method = editingCourse ? "PUT" : "POST";
            const body = editingCourse
                ? { id: editingCourse.id, ...formData }
                : formData;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                showToast(editingCourse ? "הקורס עודכן בהצלחה" : "הקורס נוסף בהצלחה", "success");
                setIsModalOpen(false);
                fetchCourses();
            } else {
                const error = await res.json();
                showToast(error.error || "שגיאה בשמירה", "error");
            }
        } catch (error) {
            console.error("Error saving course:", error);
            showToast("שגיאה בשמירה", "error");
        }
    }

    async function toggleCourseActive(course: Course) {
        try {
            const res = await fetch("/api/admin/courses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: course.id, active: !course.active }),
            });
            if (res.ok) {
                showToast(course.active ? "הקורס הושבת" : "הקורס הופעל", "success");
                fetchCourses();
            }
        } catch (error) {
            console.error("Error toggling course:", error);
            showToast("שגיאה בעדכון הקורס", "error");
        }
    }

    async function deleteCourse(course: Course) {
        if (!confirm(`האם למחוק את הקורס "${course.name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/courses?id=${course.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast("הקורס נמחק", "success");
                fetchCourses();
            } else {
                const error = await res.json();
                showToast(error.error || "שגיאה במחיקה", "error");
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            showToast("שגיאה במחיקה", "error");
        }
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
    }

    return (
        <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
                <h2>קורסים</h2>
                <button
                    className="btn btn-primary"
                    style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={openAddModal}
                >
                    <PlusIcon size={16} />
                    הוספה
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>טוען קורסים...</div>
            ) : courses.length === 0 ? (
                <p style={{ color: "var(--foreground-muted)", textAlign: "center", padding: "2rem" }}>
                    אין קורסים. לחצי על &quot;הוספה&quot; כדי להוסיף קורס חדש.
                </p>
            ) : (
                <div className={styles.serviceList}>
                    {courses.map((course) => (
                        <div key={course.id} className={styles.serviceCard} data-inactive={!course.active}>
                            <div className={styles.serviceInfo}>
                                <span className={styles.serviceName}>{course.name}</span>
                                <span className={styles.serviceMeta}>
                                    {formatDate(course.date)} • {course.duration} • ₪{course.price}
                                </span>
                                <span className={styles.serviceMeta} style={{ fontSize: "0.75rem", color: "var(--color-primary-dark)" }}>
                                    {course.enrolled}/{course.capacity} נרשמים
                                </span>
                            </div>
                            <div className={styles.serviceActions}>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={course.active}
                                        onChange={() => toggleCourseActive(course)}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                                <button className={styles.editBtn} onClick={() => openEditModal(course)}>
                                    <EditIcon size={16} />
                                </button>
                                <button className={styles.deleteBtn} onClick={() => deleteCourse(course)}>
                                    <TrashIcon size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {editingCourse ? "עריכת קורס" : "הוספת קורס"}
                        </h3>
                        <form onSubmit={handleSubmit} className={styles.modalForm}>
                            <div className={styles.formField}>
                                <label>שם הקורס</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    className={styles.textInput}
                                />
                            </div>
                            <div className={styles.formField}>
                                <label>תיאור (אופציונלי)</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className={styles.textInput}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>תאריך</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                        className={styles.textInput}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>משך (טקסט)</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        required
                                        placeholder="4 שעות"
                                        className={styles.textInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <label>מחיר (₪)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                        min="0"
                                        className={styles.numberInput}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>קיבולת</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                                        required
                                        min="1"
                                        className={styles.numberInput}
                                    />
                                </div>
                            </div>
                            <div className={styles.formField}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                                    />
                                    קורס פעיל
                                </label>
                            </div>

                            {/* Post-Registration Details */}
                            <div style={{ marginTop: "1.5rem", padding: "1rem", backgroundColor: "var(--background-secondary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                                <h4 style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "var(--color-primary-dark)" }}>מידע לנרשמות (לאחר הרשמה)</h4>

                                <div className={styles.formField}>
                                    <label>מיקום / סטודיו</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="סטודיו ליאת, רחוב הרצל 1, תל אביב"
                                        className={styles.textInput}
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>לו"ז / סדר יום</label>
                                    <textarea
                                        value={formData.schedule_info}
                                        onChange={(e) => setFormData(prev => ({ ...prev, schedule_info: e.target.value }))}
                                        className={styles.textInput}
                                        rows={4}
                                        placeholder="10:00 - תיאוריה&#10;12:00 - הפסקת צהריים&#10;13:00 - סדנה מעשית"
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <label>קישור לקבוצת ווצאפ</label>
                                    <input
                                        type="url"
                                        dir="ltr"
                                        value={formData.whatsapp_group_link}
                                        onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_group_link: e.target.value }))}
                                        placeholder="https://chat.whatsapp.com/..."
                                        className={styles.textInput}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions} style={{ marginTop: "1.5rem" }}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                    ביטול
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCourse ? "שמירה" : "הוספה"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Gallery View Component
interface GalleryImage {
    id: string;
    url: string;
    alt: string | null;
    category: string;
    sort_order: number;
    active: boolean;
}

const GALLERY_CATEGORIES = [
    { id: "all", label: "הכל" },
    { id: "general", label: "כללי" },
    { id: "gel", label: "ג'ל" },
    { id: "acrylic", label: "אקריליק" },
    { id: "nail_art", label: "נייל ארט" },
    { id: "natural", label: "טבעי" },
    { id: "pedicure", label: "פדיקור" },
];

function GalleryView() {
    const { showToast } = useToast();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [uploadCategory, setUploadCategory] = useState("general");

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/gallery");
            if (res.ok) {
                const data = await res.json();
                setImages(data);
            }
        } catch (error) {
            console.error("Error fetching images:", error);
            showToast("שגיאה בטעינת התמונות", "error");
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("alt", file.name.split(".")[0]);
                formData.append("category", uploadCategory);

                const res = await fetch("/api/admin/gallery", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || "Upload failed");
                }
            }
            showToast("התמונות הועלו בהצלחה", "success");
            fetchImages();
        } catch (error) {
            console.error("Error uploading:", error);
            showToast("שגיאה בהעלאת תמונות", "error");
        }
        setUploading(false);
        e.target.value = "";
    }

    async function toggleActive(image: GalleryImage) {
        try {
            const res = await fetch("/api/admin/gallery", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: image.id, active: !image.active }),
            });
            if (res.ok) {
                showToast(image.active ? "התמונה הוסתרה" : "התמונה מוצגת", "success");
                fetchImages();
            }
        } catch (error) {
            console.error("Error toggling image:", error);
            showToast("שגיאה בעדכון", "error");
        }
    }

    async function deleteImage(image: GalleryImage) {
        if (!confirm("האם למחוק את התמונה?")) return;
        try {
            const res = await fetch(`/api/admin/gallery?id=${image.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                showToast("התמונה נמחקה", "success");
                fetchImages();
            } else {
                const error = await res.json();
                showToast(error.error || "שגיאה במחיקה", "error");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            showToast("שגיאה במחיקה", "error");
        }
    }

    return (
        <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
                <h2>גלריה</h2>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <select
                        value={uploadCategory}
                        onChange={e => setUploadCategory(e.target.value)}
                        className={styles.categorySelect}
                    >
                        {GALLERY_CATEGORIES.filter(c => c.id !== "all").map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                    <label className="btn btn-primary" style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                        <PlusIcon size={16} />
                        {uploading ? "מעלה..." : "העלאת תמונות"}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleUpload}
                            disabled={uploading}
                            style={{ display: "none" }}
                        />
                    </label>
                </div>
            </div>

            {/* Category filter tabs */}
            <div className={styles.categoryTabs}>
                {GALLERY_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.categoryTab} ${categoryFilter === cat.id ? styles.active : ""}`}
                        onClick={() => setCategoryFilter(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>טוען תמונות...</div>
            ) : images.length === 0 ? (
                <p style={{ color: "var(--foreground-muted)", textAlign: "center", padding: "2rem" }}>
                    אין תמונות בגלריה. לחצי על &quot;העלאת תמונות&quot; כדי להוסיף.
                </p>
            ) : (
                <div className={styles.galleryGrid}>
                    {images
                        .filter(img => categoryFilter === "all" || img.category === categoryFilter)
                        .map((image) => (
                            <div key={image.id} className={styles.galleryCard} data-inactive={!image.active}>
                                <img src={image.url} alt={image.alt || "תמונה"} className={styles.galleryImage} />
                                <div className={styles.galleryCategoryBadge}>
                                    {GALLERY_CATEGORIES.find(c => c.id === image.category)?.label || image.category}
                                </div>
                                <div className={styles.galleryActions}>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={image.active}
                                            onChange={() => toggleActive(image)}
                                        />
                                        <span className={styles.toggleSlider} />
                                    </label>
                                    <button className={styles.deleteBtn} onClick={() => deleteImage(image)}>
                                        <TrashIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

// Clients View Component - List clients and send bulk SMS
interface Client {
    id: string;
    phone: string;
    name: string;
    notes: string | null;
    created_at: string;
    booking_count: number;
}

interface ClientNote {
    id: string;
    note: string;
    created_by: string;
    created_at: string;
}

const SMS_TEMPLATES = [
    { id: "holiday", label: "הודעת חופשה", message: "שלום! 💅\nהסלון יהיה סגור בתאריכים: [תאריכים]\nנחזור לפעילות ב[תאריך].\nליאת" },
    { id: "discount", label: "הנחה מיוחדת", message: "שלום! 🎁\nרק להיום - 20% הנחה על כל הטיפולים!\nהזמיני עכשיו: [קישור]\nליאת" },
    { id: "reminder", label: "תזכורת כללית", message: "שלום! 💕\nלא ראינו אותך הרבה זמן!\nבואי לפנק את הציפורניים 💅\nליאת" },
    { id: "custom", label: "הודעה מותאמת", message: "" },
];

function ClientsView() {
    const { showToast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [smsMessage, setSmsMessage] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("custom");
    const [sending, setSending] = useState(false);

    // Notes state
    const [notesModal, setNotesModal] = useState<{ isOpen: boolean; client: Client | null; notes: ClientNote[]; loading: boolean; newNote: string }>(
        { isOpen: false, client: null, notes: [], loading: false, newNote: "" }
    );

    const fetchClients = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/clients");
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            showToast("שגיאה בטעינת לקוחות", "error");
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === clients.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(clients.map(c => c.id));
        }
    };

    const handleTemplateChange = (templateId: string) => {
        setSelectedTemplate(templateId);
        const template = SMS_TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setSmsMessage(template.message);
        }
    };

    const sendSms = async (sendToAll: boolean) => {
        if (!smsMessage.trim()) {
            showToast("יש להזין הודעה", "error");
            return;
        }

        setSending(true);
        try {
            const res = await fetch("/api/admin/sms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: smsMessage,
                    clientIds: sendToAll ? null : selectedIds,
                    sendToAll,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                showToast(`ההודעה נשלחה ל-${data.sent_to} לקוחות`, "success");
                setShowSmsModal(false);
                setSmsMessage("");
                setSelectedIds([]);
            } else {
                showToast(data.error || "שגיאה בשליחת SMS", "error");
            }
        } catch {
            showToast("שגיאה בשליחת SMS", "error");
        }
        setSending(false);
    };

    // Notes functions
    const openNotesModal = async (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotesModal({ isOpen: true, client, notes: [], loading: true, newNote: "" });
        try {
            const res = await fetch(`/api/admin/clients/${client.id}/notes`);
            if (res.ok) {
                const notes = await res.json();
                setNotesModal(prev => ({ ...prev, notes, loading: false }));
            } else {
                setNotesModal(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            console.error("Error fetching notes:", error);
            setNotesModal(prev => ({ ...prev, loading: false }));
        }
    };

    const addNote = async () => {
        if (!notesModal.client || !notesModal.newNote.trim()) return;
        try {
            const res = await fetch(`/api/admin/clients/${notesModal.client.id}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: notesModal.newNote.trim() }),
            });
            if (res.ok) {
                const newNote = await res.json();
                setNotesModal(prev => ({
                    ...prev,
                    notes: [newNote, ...prev.notes],
                    newNote: "",
                }));
                showToast("ההערה נוספה", "success");
            } else {
                showToast("שגיאה בהוספת הערה", "error");
            }
        } catch (error) {
            console.error("Error adding note:", error);
            showToast("שגיאה בהוספת הערה", "error");
        }
    };

    return (
        <div className={styles.view}>
            <div className={styles.viewHeader}>
                <h2>לקוחות</h2>
                <div className={styles.viewActions}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowSmsModal(true)}
                        disabled={selectedIds.length === 0 && clients.length === 0}
                    >
                        📱 שליחת SMS
                    </button>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>טוען לקוחות...</div>
            ) : clients.length === 0 ? (
                <div className={styles.empty}>אין לקוחות רשומות</div>
            ) : (
                <>
                    <div className={styles.clientsHeader}>
                        <label className={styles.selectAll}>
                            <input
                                type="checkbox"
                                checked={selectedIds.length === clients.length}
                                onChange={selectAll}
                            />
                            {selectedIds.length > 0 ? `נבחרו ${selectedIds.length}` : "בחירת הכל"}
                        </label>
                        <span className={styles.clientCount}>{clients.length} לקוחות</span>
                    </div>

                    <div className={styles.clientsList}>
                        {clients.map(client => (
                            <div
                                key={client.id}
                                className={`${styles.clientCard} ${selectedIds.includes(client.id) ? styles.selected : ""}`}
                                onClick={() => toggleSelect(client.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(client.id)}
                                    onChange={() => toggleSelect(client.id)}
                                    onClick={e => e.stopPropagation()}
                                />
                                <div className={styles.clientInfo}>
                                    <span className={styles.clientName}>{client.name}</span>
                                    <span className={styles.clientPhone}>{client.phone}</span>
                                </div>
                                <button
                                    className={styles.notesBtn}
                                    onClick={(e) => openNotesModal(client, e)}
                                    title="הערות"
                                >
                                    📝
                                </button>
                                <span className={styles.clientBookings}>
                                    {client.booking_count} תורים
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* SMS Modal */}
            {showSmsModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>שליחת SMS</h3>
                            <button onClick={() => setShowSmsModal(false)}>
                                <XIcon size={20} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>תבנית</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={e => handleTemplateChange(e.target.value)}
                                >
                                    {SMS_TEMPLATES.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>הודעה ({smsMessage.length} תווים)</label>
                                <textarea
                                    value={smsMessage}
                                    onChange={e => setSmsMessage(e.target.value)}
                                    placeholder="כתבי את ההודעה..."
                                    rows={5}
                                />
                            </div>

                            <div className={styles.smsRecipients}>
                                {selectedIds.length > 0
                                    ? `ישלח ל-${selectedIds.length} לקוחות נבחרות`
                                    : `ישלח לכל ${clients.length} הלקוחות`}
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowSmsModal(false)}
                            >
                                ביטול
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => sendSms(selectedIds.length === 0)}
                                disabled={sending || !smsMessage.trim()}
                            >
                                {sending ? "שולח..." : "שלחי SMS"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Modal */}
            {notesModal.isOpen && notesModal.client && (
                <div className={styles.modalOverlay} onClick={() => setNotesModal(prev => ({ ...prev, isOpen: false }))}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>הערות - {notesModal.client.name}</h3>
                            <button className={styles.closeBtn} onClick={() => setNotesModal(prev => ({ ...prev, isOpen: false }))}>
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalContent}>
                            {/* Add new note */}
                            <div className={styles.addNoteSection}>
                                <textarea
                                    value={notesModal.newNote}
                                    onChange={e => setNotesModal(prev => ({ ...prev, newNote: e.target.value }))}
                                    placeholder="הוספת הערה חדשה..."
                                    rows={2}
                                    className={styles.noteInput}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={addNote}
                                    disabled={!notesModal.newNote.trim()}
                                    style={{ marginTop: "0.5rem" }}
                                >
                                    הוסף הערה
                                </button>
                            </div>

                            {/* Notes timeline */}
                            {notesModal.loading ? (
                                <div className={styles.loading}>טוען הערות...</div>
                            ) : notesModal.notes.length === 0 ? (
                                <p style={{ textAlign: "center", color: "var(--foreground-muted)", padding: "1rem" }}>אין הערות קודמות</p>
                            ) : (
                                <div className={styles.notesTimeline}>
                                    {notesModal.notes.map(note => (
                                        <div key={note.id} className={styles.noteItem}>
                                            <div className={styles.noteDate}>
                                                {new Date(note.created_at).toLocaleDateString("he-IL", {
                                                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                                                })}
                                            </div>
                                            <div className={styles.noteText}>{note.note}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ReviewsView() {
    const { showToast } = useToast();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/reviews");
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
            showToast("שגיאה בטעינת ביקורות", "error");
        }
        setLoading(false);
    }, [showToast]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    async function updateReview(id: string, approved: boolean) {
        try {
            const res = await fetch("/api/admin/reviews", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, approved, public: approved })
            });

            if (res.ok) {
                showToast(approved ? "הביקורת אושרה" : "הביקורת נדחתה", "success");
                fetchReviews();
            } else {
                showToast("שגיאה בעדכון הביקורת", "error");
            }
        } catch {
            showToast("שגיאה בעדכון הביקורת", "error");
        }
    }

    async function deleteReview(id: string) {
        if (!confirm("האם למחוק את הביקורת לצמיתות?")) return;

        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("הביקורת נמחקה", "success");
                setReviews(prev => prev.filter(r => r.id !== id));
            } else {
                showToast("שגיאה במחיקת הביקורת", "error");
            }
        } catch {
            showToast("שגיאה במחיקת הביקורת", "error");
        }
    }

    if (loading) return <div className={styles.loading}>טוען ביקורות...</div>;

    return (
        <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
                <h2>ניהול ביקורות</h2>
                <button className={styles.refreshBtn} onClick={fetchReviews}>
                    <ClockIcon size={20} /> רענן
                </button>
            </div>

            <div className={reviewsStyles.reviewsList}>
                {reviews.map(review => (
                    <div key={review.id} className={reviewsStyles.reviewCard}>
                        <div className={reviewsStyles.reviewHeader}>
                            <div className={`${reviewsStyles.statusBadge} ${review.approved ? reviewsStyles.statusApproved : reviewsStyles.statusPending}`}>
                                {review.approved ? "מאושר" : "ממתין לאישור"}
                            </div>
                            <button
                                className={reviewsStyles.deleteReviewBtn}
                                onClick={() => deleteReview(review.id)}
                                title="מחק ביקורת"
                            >
                                <TrashIcon size={18} />
                            </button>
                        </div>

                        <div className={reviewsStyles.reviewInfo}>
                            <span className={reviewsStyles.reviewClient}>
                                {review.client?.name || "לקוח"}
                                {review.client?.phone && <span style={{ fontSize: "0.8em", color: "#888", marginRight: "5px" }}>({review.client.phone})</span>}
                            </span>
                            <div className={reviewsStyles.reviewRating}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} className={star <= review.rating ? reviewsStyles.starFilled : reviewsStyles.starEmpty}>★</span>
                                ))}
                            </div>
                        </div>

                        <div className={reviewsStyles.metaInfo}>
                            <div>{new Date(review.created_at).toLocaleDateString("he-IL")} בשעה {new Date(review.created_at).toLocaleTimeString("he-IL", { hour: '2-digit', minute: '2-digit' })}</div>
                            {review.booking && (
                                <div>טיפול: {review.booking?.service?.name} ({review.booking?.date})</div>
                            )}
                        </div>

                        <p className={reviewsStyles.reviewComment}>
                            {review.comment || "אין תוכן"}
                        </p>

                        <div className={reviewsStyles.reviewActions}>
                            {!review.approved ? (
                                <button className={reviewsStyles.approveBtn} onClick={() => updateReview(review.id, true)}>
                                    <CheckIcon size={16} /> אשר
                                </button>
                            ) : (
                                <button className={reviewsStyles.rejectBtn} onClick={() => updateReview(review.id, false)}>
                                    <XIcon size={16} /> הסר מפרסום
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>אין ביקורות להצגה</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Artists View Component (Owner Only)
interface Artist {
    id: string;
    name: string;
    phone: string | null;
    role: string;
    active: boolean;
    calendar_token: string;
    sort_order: number;
    auth_user_id: string | null;
    serviceIds: string[];
}

function ArtistsView() {
    const { showToast } = useToast();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        serviceIds: [] as string[],
    });

    const fetchArtists = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/artists");
            if (res.ok) {
                const data = await res.json();
                setArtists(data);
            }
        } catch (error) {
            console.error("Error fetching artists:", error);
            showToast("שגיאה בטעינת אמניות", "error");
        }
        setLoading(false);
    }, [showToast]);

    const fetchServices = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/services");
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    }, []);

    useEffect(() => {
        fetchArtists();
        fetchServices();
    }, [fetchArtists, fetchServices]);

    function openAddModal() {
        setEditingArtist(null);
        setFormData({ name: "", phone: "", email: "", password: "", serviceIds: [] });
        setIsModalOpen(true);
    }

    function openEditModal(artist: Artist) {
        setEditingArtist(artist);
        setFormData({
            name: artist.name,
            phone: artist.phone || "",
            email: "",
            password: "",
            serviceIds: artist.serviceIds || [],
        });
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editingArtist) {
                // Update
                const body: Record<string, unknown> = {
                    id: editingArtist.id,
                    name: formData.name,
                    phone: formData.phone,
                    serviceIds: formData.serviceIds,
                };
                if (formData.password) {
                    body.newPassword = formData.password;
                }
                const res = await fetch("/api/admin/artists", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });
                if (res.ok) {
                    showToast("האמנית עודכנה בהצלחה", "success");
                    setIsModalOpen(false);
                    fetchArtists();
                } else {
                    const err = await res.json();
                    showToast(err.error || "שגיאה בעדכון", "error");
                }
            } else {
                // Create
                if (!formData.email || !formData.password) {
                    showToast("יש למלא אימייל וסיסמה", "error");
                    return;
                }
                const res = await fetch("/api/admin/artists", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (res.ok) {
                    showToast("האמנית נוספה בהצלחה", "success");
                    setIsModalOpen(false);
                    fetchArtists();
                } else {
                    const err = await res.json();
                    showToast(err.error || "שגיאה בהוספה", "error");
                }
            }
        } catch (error) {
            console.error("Error saving artist:", error);
            showToast("שגיאה בשמירה", "error");
        }
    }

    async function toggleActive(artist: Artist) {
        try {
            const res = await fetch("/api/admin/artists", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: artist.id, active: !artist.active }),
            });
            if (res.ok) {
                showToast(artist.active ? "האמנית הושבתה" : "האמנית הופעלה", "success");
                fetchArtists();
            }
        } catch (error) {
            console.error("Error toggling artist:", error);
        }
    }

    function toggleService(serviceId: string) {
        setFormData(prev => ({
            ...prev,
            serviceIds: prev.serviceIds.includes(serviceId)
                ? prev.serviceIds.filter(id => id !== serviceId)
                : [...prev.serviceIds, serviceId],
        }));
    }

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div className={styles.viewContainer}>
            <div className={styles.viewHeader}>
                <h2>ניהול אמניות</h2>
                <button className={styles.addBtn} onClick={openAddModal}>
                    <PlusIcon size={18} /> הוספת אמנית
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>טוען...</div>
            ) : (
                <div className={styles.bookingList}>
                    {artists.map((artist) => (
                        <div key={artist.id} className={styles.bookingCard} style={{ cursor: "pointer" }} onClick={() => openEditModal(artist)}>
                            <div className={styles.bookingTime}>
                                <span style={{ fontSize: "1.5rem" }}>👩‍🎨</span>
                            </div>
                            <div className={styles.bookingInfo}>
                                <span className={styles.bookingClient}>
                                    {artist.name}
                                    {artist.role === "owner" && " (בעלים)"}
                                </span>
                                <span className={styles.bookingService}>
                                    {artist.phone || "ללא טלפון"} • {artist.serviceIds?.length || 0} שירותים
                                </span>
                            </div>
                            <div className={styles.bookingMeta}>
                                <span
                                    className={styles.bookingStatus}
                                    data-status={artist.active ? "confirmed" : "cancelled"}
                                    onClick={(e) => { e.stopPropagation(); if (artist.role !== "owner") toggleActive(artist); }}
                                >
                                    {artist.active ? "פעילה" : "מושבתת"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{editingArtist ? "עריכת אמנית" : "הוספת אמנית חדשה"}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.modalContent}>
                            <div className={styles.modalField}>
                                <label>שם</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className={styles.textInput}
                                    required
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>טלפון</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className={styles.textInput}
                                    dir="ltr"
                                />
                            </div>
                            {!editingArtist && (
                                <>
                                    <div className={styles.modalField}>
                                        <label>אימייל (לכניסה)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className={styles.textInput}
                                            dir="ltr"
                                            required
                                        />
                                    </div>
                                    <div className={styles.modalField}>
                                        <label>סיסמה</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            className={styles.textInput}
                                            dir="ltr"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </>
                            )}
                            {editingArtist && (
                                <div className={styles.modalField}>
                                    <label>סיסמה חדשה (השאירי ריק אם אין שינוי)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        className={styles.textInput}
                                        dir="ltr"
                                        minLength={6}
                                    />
                                </div>
                            )}

                            {/* Service Assignment */}
                            <div className={styles.modalField}>
                                <label>שירותים</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                                    {services.map((service) => (
                                        <label
                                            key={service.id}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                cursor: "pointer",
                                                padding: "0.25rem 0",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.serviceIds.includes(service.id)}
                                                onChange={() => toggleService(service.id)}
                                            />
                                            <span>{service.name}</span>
                                            <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>₪{service.price}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Calendar Link */}
                            {editingArtist && editingArtist.calendar_token && (
                                <div className={styles.modalField}>
                                    <label>קישור לוח שנה (ICS)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`${siteUrl}/api/calendar/feed?token=${editingArtist.calendar_token}`}
                                        className={styles.textInput}
                                        dir="ltr"
                                        onFocus={(e) => e.target.select()}
                                        style={{ fontSize: "0.8rem" }}
                                    />
                                </div>
                            )}

                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                                    ביטול
                                </button>
                                <button type="submit" className={styles.saveBtn}>
                                    {editingArtist ? "שמור" : "הוסף"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
