// Runtime configuration (kept separate from design tokens)
import Constants from 'expo-constants';

export const API_BASE_URL = 'https://liat-nails.art/api';
export const SITE_ORIGIN = 'https://liat-nails.art';

export const APP_VERSION: string = Constants.expoConfig?.version ?? '1.0.0';
export const APP_NAME: string = Constants.expoConfig?.name ?? 'ליאת';
