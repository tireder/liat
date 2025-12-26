import React from "react";

interface IconProps {
    size?: number;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
}

export const NailPolishIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C10.5 2 9 3 9 5V8H15V5C15 3 13.5 2 12 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8H15V10C15 10 16 11 16 13V18C16 20 14 22 12 22C10 22 8 20 8 18V13C8 11 9 10 9 10V8Z" fill={color} opacity="0.2" />
        <path d="M9 8H15V10C15 10 16 11 16 13V18C16 20 14 22 12 22C10 22 8 20 8 18V13C8 11 9 10 9 10V8Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M3 10H21" stroke={color} strokeWidth="1.5" />
        <path d="M8 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 2V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill={color} />
    </svg>
);

export const BookIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5" />
        <path d="M12 7V12L15 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14.09 8.26L21 9.27L16 14.14L17.18 21.02L12 17.77L6.82 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z" />
    </svg>
);

export const HeartIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20.84 4.61C20.3292 4.09924 19.7228 3.69397 19.0554 3.41708C18.3879 3.14019 17.6725 2.99756 16.95 2.99756C16.2275 2.99756 15.5121 3.14019 14.8446 3.41708C14.1772 3.69397 13.5708 4.09924 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99805 7.05 2.99805C5.59096 2.99805 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54804 7.04097 1.54804 8.5C1.54804 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.3508 11.8792 21.756 11.2728 22.0329 10.6053C22.3098 9.93789 22.4524 9.22248 22.4524 8.5C22.4524 7.77751 22.3098 7.0621 22.0329 6.39464C21.756 5.72718 21.3508 5.12075 20.84 4.61Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" />
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const AwardIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="6" stroke={color} strokeWidth="1.5" />
        <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 15L19.5 17L21.5 17.5L19.5 18L19 20L18.5 18L16.5 17.5L18.5 17L19 15Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 3L5.5 5L7.5 5.5L5.5 6L5 8L4.5 6L2.5 5.5L4.5 5L5 3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const DiamondIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3H18L21 8L12 21L3 8L6 3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 8H21" stroke={color} strokeWidth="1.5" />
        <path d="M12 21L9 8L12 3L15 8L12 21Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PaletteIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.76 22 13.38 21.38 13.38 20.62C13.38 20.28 13.24 19.96 13.02 19.72C12.8 19.46 12.66 19.14 12.66 18.78C12.66 18.02 13.28 17.4 14.04 17.4H16C18.76 17.4 21 15.16 21 12.4C21 6.66 17.04 2 12 2Z" stroke={color} strokeWidth="1.5" />
        <circle cx="6.5" cy="11.5" r="1.5" fill={color} />
        <circle cx="9.5" cy="7.5" r="1.5" fill={color} />
        <circle cx="14.5" cy="7.5" r="1.5" fill={color} />
        <circle cx="17.5" cy="11.5" r="1.5" fill={color} />
    </svg>
);

export const FootIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="12" cy="16" rx="6" ry="5" stroke={color} strokeWidth="1.5" />
        <circle cx="7" cy="6" r="2" stroke={color} strokeWidth="1.5" />
        <circle cx="11" cy="4" r="2" stroke={color} strokeWidth="1.5" />
        <circle cx="15" cy="4" r="2" stroke={color} strokeWidth="1.5" />
        <circle cx="18" cy="7" r="1.5" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const WrenchIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M14.7 6.3C14.5168 6.48693 14.4141 6.73825 14.4141 7C14.4141 7.26175 14.5168 7.51307 14.7 7.7L16.3 9.3C16.4869 9.48322 16.7382 9.58585 17 9.58585C17.2618 9.58585 17.5131 9.48322 17.7 9.3L21.47 5.53C21.9728 6.64119 22.1251 7.87669 21.9065 9.07453C21.6878 10.2724 21.1087 11.3756 20.2461 12.2382C19.3834 13.1008 18.2802 13.6799 17.0824 13.8986C15.8845 14.1173 14.649 13.9649 13.5378 13.4622L6.21996 20.78C5.82213 21.1778 5.28552 21.4013 4.72496 21.4013C4.16441 21.4013 3.6278 21.1778 3.22996 20.78C2.83213 20.3822 2.60864 19.8456 2.60864 19.285C2.60864 18.7245 2.83213 18.1878 3.22996 17.79L10.5478 10.4722C10.045 9.36103 9.89269 8.12553 10.1114 6.92769C10.33 5.72985 10.9091 4.62664 11.7718 3.76397C12.6344 2.9013 13.7376 2.32223 14.9355 2.10356C16.1333 1.88489 17.3688 2.03719 18.48 2.54L14.71 6.31L14.7 6.3Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1469 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77383 17.3147 6.72534 15.2662 5.19 12.85C3.49998 10.2412 2.44824 7.27099 2.12 4.18C2.09501 3.90347 2.12788 3.62476 2.2165 3.36162C2.30513 3.09849 2.44757 2.85669 2.63477 2.65162C2.82196 2.44655 3.04981 2.28271 3.30379 2.17052C3.55778 2.05833 3.83234 2.00026 4.11 2H7.11C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04208 3.23945 9.11 3.72C9.23662 4.68007 9.47145 5.62273 9.81 6.53C9.94455 6.88792 9.97366 7.27691 9.89391 7.65088C9.81415 8.02485 9.62886 8.36811 9.36 8.64L8.09 9.91C9.51356 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9752 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const MessageIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.5" />
        <circle cx="18" cy="6" r="1" fill={color} />
    </svg>
);

export const FacebookIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TikTokIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V3H18C18 5.20914 19.7909 7 22 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 12C15 15.3137 12.3137 18 9 18C5.68629 18 3 15.3137 3 12C3 8.68629 5.68629 6 9 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.5" />
        <path d="M21 21L16.5 16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L18 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor", style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 19L5 12L12 5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CertificateIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="14" rx="2" stroke={color} strokeWidth="1.5" />
        <path d="M7 8H17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7 12H13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="17" r="4" stroke={color} strokeWidth="1.5" />
        <path d="M17 15V17L18.5 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const GiftIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="8" width="18" height="4" stroke={color} strokeWidth="1.5" />
        <rect x="5" y="12" width="14" height="9" stroke={color} strokeWidth="1.5" />
        <path d="M12 8V21" stroke={color} strokeWidth="1.5" />
        <path d="M12 8C12 8 12 5 9.5 5C7 5 7 8 9.5 8C12 8 12 8 12 8Z" stroke={color} strokeWidth="1.5" />
        <path d="M12 8C12 8 12 5 14.5 5C17 5 17 8 14.5 8C12 8 12 8 12 8Z" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" />
        <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const MapIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M1 6V22L8 18L16 22L23 18V2L16 6L8 2L1 6Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 2V18" stroke={color} strokeWidth="1.5" />
        <path d="M16 6V22" stroke={color} strokeWidth="1.5" />
    </svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12H15V22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
        <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 12H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const EditIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H5H21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 12H19" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const WazeIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke={color} strokeWidth="1.5" />
        <circle cx="9" cy="10" r="1.5" fill={color} />
        <circle cx="15" cy="10" r="1.5" fill={color} />
        <path d="M8.5 14C8.5 14 10 16 12 16C14 16 15.5 14 15.5 14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size = 24, className, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5" />
        <circle cx="8.5" cy="8.5" r="1.5" fill={color} />
        <path d="M21 15L16 10L5 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
