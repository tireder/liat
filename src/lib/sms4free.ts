// SMS4Free API Client for sending SMS messages
// https://sms4free.co.il

const SEND_URL = "https://api.sms4free.co.il/ApiSMS/v2/SendSMS";
const BALANCE_URL = "https://api.sms4free.co.il/ApiSMS/AvailableSMS";

function normalizeRecipients(recipients: string | string[]): string {
    if (Array.isArray(recipients)) return recipients.join(";");
    return recipients;
}

export interface SendSmsParams {
    sender: string;
    recipients: string | string[];
    msg: string;
}

export interface SmsResponse {
    status: number;
    message: string;
}

export async function sendSms({ sender, recipients, msg }: SendSmsParams): Promise<SmsResponse> {
    const key = process.env.SMS4FREE_KEY;
    const user = process.env.SMS4FREE_USER;
    const pass = process.env.SMS4FREE_PASS;

    if (!key || !user || !pass) {
        throw new Error("SMS4Free credentials not configured");
    }

    const payload = {
        key,
        user,
        pass,
        sender,
        recipient: normalizeRecipients(recipients),
        msg,
    };

    const res = await fetch(SEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    let data: SmsResponse;
    try {
        data = await res.json();
    } catch {
        const text = await res.text();
        throw new Error(`Non-JSON response: ${text}`);
    }

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    }

    const status = Number(data.status);

    if (status > 0) return data;

    // Map common failures to clear errors
    const errorMap: Record<string, string> = {
        "0": "General error",
        "-1": "Invalid key/user/pass",
        "-2": "Invalid sender",
        "-3": "No recipients",
        "-4": "Insufficient balance",
        "-5": "Message not allowed",
        "-6": "Sender number not verified",
    };

    throw new Error(errorMap[String(status)] || `Send failed: ${JSON.stringify(data)}`);
}

export async function getAvailableSms(): Promise<{ available: number }> {
    const key = process.env.SMS4FREE_KEY;
    const user = process.env.SMS4FREE_USER;
    const pass = process.env.SMS4FREE_PASS;

    if (!key || !user || !pass) {
        throw new Error("SMS4Free credentials not configured");
    }

    const payload = { key, user, pass };

    const res = await fetch(BALANCE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    let data;
    try {
        data = await res.json();
    } catch {
        const text = await res.text();
        throw new Error(`Non-JSON response: ${text}`);
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
    return data;
}
