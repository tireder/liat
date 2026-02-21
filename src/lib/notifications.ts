// Notification utility – sends push notifications via Expo Push API
// Falls back to SMS if app notifications are disabled for the user

import { createAdminClient } from "./supabase/server";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

export type NotificationType =
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_UPDATED"
    | "APPOINTMENT_CANCELED"
    | "REVIEW_REQUEST";

export interface NotificationPayload {
    clientId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>; // deep link info, booking_id, etc.
}

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    sound: "default";
    channelId?: string;
}

interface ExpoPushTicket {
    id?: string;
    status: "ok" | "error";
    message?: string;
    details?: { error?: string };
}

/**
 * Check if a client has app notifications enabled and has active push tokens.
 */
export async function hasAppNotifications(clientId: string): Promise<boolean> {
    const supabase = createAdminClient();

    const { data: client } = await supabase
        .from("clients")
        .select("app_notifications_enabled")
        .eq("id", clientId)
        .single();

    if (!client?.app_notifications_enabled) return false;

    const { data: tokens } = await supabase
        .from("push_tokens")
        .select("id")
        .eq("client_id", clientId)
        .eq("active", true)
        .limit(1);

    return !!(tokens && tokens.length > 0);
}

/**
 * Send a push notification to all of a client's active devices.
 * Also logs the notification in the notifications table.
 * Returns true if at least one push was sent successfully.
 */
export async function sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    const supabase = createAdminClient();

    // Get active push tokens for this client
    const { data: tokens } = await supabase
        .from("push_tokens")
        .select("id, token")
        .eq("client_id", payload.clientId)
        .eq("active", true);

    if (!tokens || tokens.length === 0) {
        console.log(`[Notifications] No active push tokens for client ${payload.clientId}`);
        return false;
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = tokens.map((t) => ({
        to: t.token,
        title: payload.title,
        body: payload.body,
        data: payload.data,
        sound: "default" as const,
        channelId: "default",
    }));

    try {
        // Send in batches of 100 (Expo limit)
        const batches: ExpoPushMessage[][] = [];
        for (let i = 0; i < messages.length; i += 100) {
            batches.push(messages.slice(i, i + 100));
        }

        let successCount = 0;
        const invalidTokenIds: string[] = [];

        for (const batch of batches) {
            const res = await fetch(EXPO_PUSH_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(batch),
            });

            if (!res.ok) {
                console.error(`[Notifications] Expo push failed: HTTP ${res.status}`);
                continue;
            }

            const result = await res.json();
            const tickets: ExpoPushTicket[] = result.data || [];

            tickets.forEach((ticket, idx) => {
                if (ticket.status === "ok") {
                    successCount++;
                } else {
                    console.error(`[Notifications] Push error:`, ticket.message, ticket.details);
                    // Mark invalid tokens (DeviceNotRegistered) as inactive
                    if (ticket.details?.error === "DeviceNotRegistered") {
                        const tokenRecord = tokens.find((t) => t.token === batch[idx].to);
                        if (tokenRecord) invalidTokenIds.push(tokenRecord.id);
                    }
                }
            });
        }

        // Deactivate invalid tokens
        if (invalidTokenIds.length > 0) {
            await supabase
                .from("push_tokens")
                .update({ active: false })
                .in("id", invalidTokenIds);
            console.log(`[Notifications] Deactivated ${invalidTokenIds.length} invalid tokens`);
        }

        // Log notification in DB
        await supabase.from("notifications").insert({
            client_id: payload.clientId,
            type: payload.type,
            title: payload.title,
            body: payload.body,
            data: payload.data || null,
        });

        console.log(`[Notifications] Sent ${successCount}/${tokens.length} push notifications`);
        return successCount > 0;
    } catch (error) {
        console.error("[Notifications] Error sending push notification:", error);
        return false;
    }
}

/**
 * Helper: Send notification for a booking event.
 * If client has app notifications → push; otherwise returns false (caller should SMS).
 */
export async function notifyBookingEvent(
    clientId: string,
    type: NotificationType,
    title: string,
    body: string,
    bookingId?: string,
    deepLink?: string
): Promise<boolean> {
    const hasApp = await hasAppNotifications(clientId);
    if (!hasApp) return false;

    const data: Record<string, string> = {};
    if (bookingId) data.bookingId = bookingId;
    if (deepLink) data.deepLink = deepLink;

    return sendPushNotification({
        clientId,
        type,
        title,
        body,
        data,
    });
}

/**
 * Helper: Send review request notification.
 * Returns true if sent via push (caller should skip SMS).
 */
export async function notifyReviewRequest(
    clientId: string,
    bookingId: string,
    reviewToken: string,
    serviceName: string
): Promise<boolean> {
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.liat-nails.art").replace(/\/$/, "");
    const deepLink = `${siteUrl}/review/${reviewToken}`;

    return notifyBookingEvent(
        clientId,
        "REVIEW_REQUEST",
        "מה דעתך? 💅",
        `נשמח לשמוע איך היה הטיפול - ${serviceName}`,
        bookingId,
        deepLink
    );
}
