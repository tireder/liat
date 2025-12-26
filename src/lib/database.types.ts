import { createClient } from "@/lib/supabase/server";

// Database types (matching Supabase schema)
export type Service = {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type Course = {
    id: string;
    name: string;
    description: string | null;
    date: string;
    duration: string;
    price: number;
    capacity: number;
    active: boolean;
    created_at: string;
    updated_at: string;
};

export type Client = {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type BookingStatus =
    | "pending"
    | "confirmed"
    | "pending_change"
    | "cancelled"
    | "completed"
    | "no_show";

export type Booking = {
    id: string;
    client_id: string;
    service_id: string;
    date: string;
    start_time: string;
    end_time: string;
    status: BookingStatus;
    notes: string | null;
    requested_date: string | null;
    requested_time: string | null;
    locked_at: string | null;
    locked_until: string | null;
    created_at: string;
    updated_at: string;
    // Joined data
    client?: Client;
    service?: Service;
};

export type BookingLog = {
    id: string;
    booking_id: string;
    action: string;
    actor: string;
    details: Record<string, unknown> | null;
    created_at: string;
};

export type CourseRegistration = {
    id: string;
    client_id: string;
    course_id: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type OperatingHours = {
    id: string;
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
    active: boolean;
};

export type BlockedSlot = {
    id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    all_day: boolean;
    reason: string | null;
    created_at: string;
};

export type Setting = {
    key: string;
    value: string;
    updated_at: string;
};

// Helper to get supabase client in API routes
export async function getSupabase() {
    return await createClient();
}
