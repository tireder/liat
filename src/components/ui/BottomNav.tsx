"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CalendarIcon, BookIcon, ImageIcon, UserIcon } from "@/components/icons";
import styles from "./BottomNav.module.css";

const navItems = [
  { label: "בית", href: "/", icon: HomeIcon },
  { label: "תורים", href: "/book", icon: CalendarIcon },
  { label: "קורסים", href: "/courses", icon: BookIcon },
  { label: "גלריה", href: "/gallery", icon: ImageIcon },
  { label: "אזור אישי", href: "/my-bookings", icon: UserIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav}>
      <div className={styles.container}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <div className={styles.iconWrapper}>
                <Icon size={24} />
              </div>
              <span className={styles.label}>{item.label}</span>
              {isActive && <div className={styles.indicator} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
