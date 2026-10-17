import { FACEBOOK_URL } from "@/lib/content";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/instagram";

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
      <path d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" />
    </svg>
  );
}

/** Icônes des réseaux sociaux (Instagram, Facebook), à sa place sur fond clair ou foncé. */
export default function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`social-links ${className}`}>
      <li>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label={`Instagram @${INSTAGRAM_HANDLE}`}>
          <InstagramIcon />
        </a>
      </li>
      <li>
        <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" aria-label="Facebook">
          <FacebookIcon />
        </a>
      </li>
    </ul>
  );
}
