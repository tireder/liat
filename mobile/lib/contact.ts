// Phone / WhatsApp / navigation helpers built from settings — nothing hardcoded.
import { Linking, Platform } from 'react-native';

export function digitsOnly(value: string | null | undefined): string {
    return (value || '').replace(/\D/g, '');
}

/** "+972501234567" */
export function toInternationalPhone(value: string | null | undefined): string {
    const digits = digitsOnly(value);
    if (!digits) return '';
    if (digits.startsWith('972')) return `+${digits}`;
    if (digits.startsWith('0')) return `+972${digits.slice(1)}`;
    return `+972${digits}`;
}

/** "972501234567" for wa.me links */
export function toWhatsAppNumber(value: string | null | undefined): string {
    return toInternationalPhone(value).replace('+', '');
}

export async function openTel(phone: string | null | undefined): Promise<boolean> {
    const intl = toInternationalPhone(phone);
    if (!intl) return false;
    try {
        await Linking.openURL(`tel:${intl}`);
        return true;
    } catch {
        return false;
    }
}

export async function openWhatsApp(phone: string | null | undefined, text?: string): Promise<boolean> {
    const number = toWhatsAppNumber(phone);
    if (!number) return false;
    const url = `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    try {
        await Linking.openURL(url);
        return true;
    } catch {
        return false;
    }
}

export async function openUrl(url: string | null | undefined): Promise<boolean> {
    if (!url) return false;
    try {
        await Linking.openURL(url);
        return true;
    } catch {
        return false;
    }
}

/** Waze first, then Google Maps / Apple Maps. */
export async function openMaps(address: string | null | undefined): Promise<boolean> {
    const q = (address || '').trim();
    if (!q) return false;
    const encoded = encodeURIComponent(q);
    const candidates = [
        `waze://?q=${encoded}&navigate=yes`,
        Platform.OS === 'ios' ? `maps://?q=${encoded}` : `geo:0,0?q=${encoded}`,
        `https://waze.com/ul?q=${encoded}&navigate=yes`,
        `https://maps.google.com/?q=${encoded}`,
    ];
    for (const url of candidates) {
        try {
            const can = await Linking.canOpenURL(url);
            if (can) {
                await Linking.openURL(url);
                return true;
            }
        } catch {
            // try the next candidate
        }
    }
    return false;
}

export function openAppSettings(): Promise<void> {
    return Linking.openSettings();
}
