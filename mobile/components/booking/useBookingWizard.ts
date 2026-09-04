// useBookingWizard – reducer-backed state for the booking flow.
// Steps are computed once per init key so background data refreshes never
// reset the user's progress (B5). Reschedule locks artist + service (B6).
import { useCallback, useMemo, useReducer, useRef } from 'react';
import type { Artist, Booking, Service } from '../../lib/api';

export type WizardStep = 'artist' | 'service' | 'datetime' | 'notes' | 'confirm';

export const STEP_LABEL: Record<WizardStep, string> = {
    artist: 'אמנית',
    service: 'טיפול',
    datetime: 'תאריך ושעה',
    notes: 'הערות',
    confirm: 'אישור',
};

export interface WizardState {
    initialized: boolean;
    initKey: string | null;
    mode: 'new' | 'reschedule';
    rescheduleId: string | null;
    rescheduleBooking: Booking | null;
    steps: WizardStep[];
    stepIndex: number;
    artist: Artist | null;
    service: Service | null;
    date: string | null;
    time: string | null;
    notes: string;
    locked: { artist: boolean; service: boolean };
    preselectedServiceId: string | null;
}

type Action =
    | { type: 'init'; payload: Omit<WizardState, 'initialized'> }
    | { type: 'artist'; artist: Artist }
    | { type: 'service'; service: Service }
    | { type: 'date'; date: string }
    | { type: 'time'; time: string | null }
    | { type: 'notes'; notes: string }
    | { type: 'next' }
    | { type: 'back' }
    | { type: 'goto'; index: number }
    | { type: 'reset' };

const EMPTY: WizardState = {
    initialized: false,
    initKey: null,
    mode: 'new',
    rescheduleId: null,
    rescheduleBooking: null,
    steps: ['service', 'datetime', 'notes', 'confirm'],
    stepIndex: 0,
    artist: null,
    service: null,
    date: null,
    time: null,
    notes: '',
    locked: { artist: false, service: false },
    preselectedServiceId: null,
};

function reducer(state: WizardState, action: Action): WizardState {
    switch (action.type) {
        case 'init':
            return { ...action.payload, initialized: true };
        case 'artist': {
            const offers = action.artist.serviceIds.includes(state.service?.id || '');
            return {
                ...state,
                artist: action.artist,
                service: offers ? state.service : null,
                date: null,
                time: null,
                stepIndex: Math.min(state.stepIndex + 1, state.steps.length - 1),
            };
        }
        case 'service':
            return {
                ...state,
                service: action.service,
                time: null,
                stepIndex: Math.min(state.stepIndex + 1, state.steps.length - 1),
            };
        case 'date':
            return { ...state, date: action.date, time: null };
        case 'time':
            return { ...state, time: action.time };
        case 'notes':
            return { ...state, notes: action.notes.slice(0, 200) };
        case 'next':
            return { ...state, stepIndex: Math.min(state.stepIndex + 1, state.steps.length - 1) };
        case 'back':
            return { ...state, stepIndex: Math.max(state.stepIndex - 1, 0) };
        case 'goto':
            return { ...state, stepIndex: Math.max(0, Math.min(action.index, state.steps.length - 1)) };
        case 'reset':
            return { ...EMPTY };
        default:
            return state;
    }
}

export interface WizardInput {
    artists: Artist[];
    services: Service[];
    bookings: Booking[];
    rescheduleId?: string | null;
    serviceParam?: string | null;
}

export function buildInitialState(input: WizardInput): Omit<WizardState, 'initialized'> {
    const { artists, services, bookings, rescheduleId, serviceParam } = input;
    const initKey = `${rescheduleId || ''}|${serviceParam || ''}`;

    if (rescheduleId) {
        const booking = bookings.find((b) => b.id === rescheduleId) || null;
        const service = booking ? services.find((s) => s.id === booking.service_id) || null : null;
        const artist =
            (booking?.artist_id && artists.find((a) => a.id === booking.artist_id)) ||
            (artists.length === 1 ? artists[0] : null);
        return {
            ...EMPTY,
            initKey,
            mode: 'reschedule',
            rescheduleId,
            rescheduleBooking: booking,
            steps: ['datetime', 'notes', 'confirm'],
            stepIndex: 0,
            artist,
            service,
            notes: booking?.notes || '',
            locked: { artist: true, service: true },
        };
    }

    const singleArtist = artists.length === 1 ? artists[0] : null;
    const preselected = serviceParam ? services.find((s) => s.id === serviceParam) || null : null;
    const preselectedValid =
        !!preselected && (artists.length === 0 || (singleArtist ? singleArtist.serviceIds.includes(preselected.id) : true));

    const steps: WizardStep[] = [];
    if (artists.length > 1) steps.push('artist');
    // With several artists the client still confirms the service for the chosen artist.
    if (!(preselectedValid && artists.length <= 1)) steps.push('service');
    steps.push('datetime', 'notes', 'confirm');

    return {
        ...EMPTY,
        initKey,
        mode: 'new',
        steps,
        stepIndex: 0,
        artist: singleArtist,
        service: preselectedValid ? preselected : null,
        preselectedServiceId: preselected?.id || null,
        locked: { artist: false, service: false },
    };
}

export function useBookingWizard() {
    const [state, dispatch] = useReducer(reducer, EMPTY);
    const initKeyRef = useRef<string | null>(null);

    const init = useCallback((input: WizardInput) => {
        const next = buildInitialState(input);
        if (initKeyRef.current === next.initKey) return;
        initKeyRef.current = next.initKey;
        dispatch({ type: 'init', payload: next });
    }, []);

    const reset = useCallback(() => {
        initKeyRef.current = null;
        dispatch({ type: 'reset' });
    }, []);

    const actions = useMemo(
        () => ({
            init,
            reset,
            selectArtist: (artist: Artist) => dispatch({ type: 'artist', artist }),
            selectService: (service: Service) => dispatch({ type: 'service', service }),
            selectDate: (date: string) => dispatch({ type: 'date', date }),
            selectTime: (time: string | null) => dispatch({ type: 'time', time }),
            setNotes: (notes: string) => dispatch({ type: 'notes', notes }),
            next: () => dispatch({ type: 'next' }),
            back: () => dispatch({ type: 'back' }),
            goto: (index: number) => dispatch({ type: 'goto', index }),
        }),
        [init, reset]
    );

    const currentStep = state.steps[state.stepIndex] || 'confirm';
    const canContinue =
        currentStep === 'datetime' ? !!(state.date && state.time) : currentStep === 'service' ? !!state.service : true;

    return { state, currentStep, canContinue, ...actions };
}
