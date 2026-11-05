"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const hideTimer = setTimeout(() => setLeaving(true), 2200);
    const doneTimer = setTimeout(() => onDone(), 2500);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "var(--talisman-yellow)",
        border: "1px solid var(--vermilion)",
        borderRadius: "4px",
        padding: "10px 18px",
        fontFamily: "var(--font-noto-sans-kr), sans-serif",
        fontSize: "0.875rem",
        color: "var(--ink-muk)",
        whiteSpace: "nowrap",
        zIndex: 100,
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
        animation: leaving
          ? "fade-out-down 300ms ease forwards"
          : "fade-in-up 200ms ease forwards",
      }}
    >
      {message}
    </div>
  );
}
