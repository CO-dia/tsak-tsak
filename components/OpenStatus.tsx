"use client";

import { useSyncExternalStore } from "react";

const OPENS = 8 * 60 + 30; // 8 h 30
const CLOSES = 16 * 60; // 16 h

function montrealMinutes() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Montreal",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

function getSnapshot() {
  const now = montrealMinutes();
  return now >= OPENS && now < CLOSES ? "open" : "closed";
}

/** « Ouvert maintenant » ou « Fermé », selon l’heure de Montréal (calculé dans le navigateur). */
export default function OpenStatus({ openLabel, closedLabel }: { openLabel: string; closedLabel: string }) {
  const status = useSyncExternalStore(subscribe, getSnapshot, () => null);
  if (!status) return <span className="open-status" aria-hidden="true" />;
  return (
    <span className={`open-status open-status--${status}`}>{status === "open" ? openLabel : closedLabel}</span>
  );
}
