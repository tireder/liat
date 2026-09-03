// Text size preference – persisted font scale applied by <AppText>.
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

export type TextSizeLevel = 'small' | 'medium' | 'large';

const TEXT_SIZE_KEY = 'liat_text_size';

export const TEXT_SCALE: Record<TextSizeLevel, number> = {
    small: 0.9,
    medium: 1.0,
    large: 1.2,
};

export const TEXT_SIZE_LABEL: Record<TextSizeLevel, string> = {
    small: 'קטן',
    medium: 'רגיל',
    large: 'גדול',
};

interface TextSizeContextType {
    textSize: TextSizeLevel;
    scale: number;
    setTextSize: (size: TextSizeLevel) => Promise<void>;
}

const TextSizeContext = createContext<TextSizeContextType>({
    textSize: 'medium',
    scale: 1.0,
    setTextSize: async () => {},
});

export function TextSizeProvider({ children }: { children: ReactNode }) {
    const [textSize, setTextSizeState] = useState<TextSizeLevel>('medium');

    useEffect(() => {
        SecureStore.getItemAsync(TEXT_SIZE_KEY)
            .then((saved) => {
                if (saved === 'small' || saved === 'medium' || saved === 'large') setTextSizeState(saved);
            })
            .catch(() => undefined);
    }, []);

    const setTextSize = useCallback(async (size: TextSizeLevel) => {
        setTextSizeState(size);
        try {
            await SecureStore.setItemAsync(TEXT_SIZE_KEY, size);
        } catch {
            // preference is best-effort
        }
    }, []);

    return (
        <TextSizeContext.Provider value={{ textSize, scale: TEXT_SCALE[textSize], setTextSize }}>
            {children}
        </TextSizeContext.Provider>
    );
}

export function useTextSize() {
    return useContext(TextSizeContext);
}
