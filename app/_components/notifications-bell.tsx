"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  linkUrl: string | null;
};

export function NotificationsBell() {
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [ringing, setRinging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prevUnread = useRef<number | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      setItems(data.notifications);
      setUnread((curr) => {
        if (!initialLoad.current && data.unread > (prevUnread.current ?? 0)) {
          setRinging(true);
          setTimeout(() => setRinging(false), 800);
        }
        prevUnread.current = data.unread;
        initialLoad.current = false;
        return data.unread;
      });
    }
    load();
    const i = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(i);
    };
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleClick(n: Notification) {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "POST" });
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
    }
    if (n.linkUrl) {
      setOpen(false);
      router.push(n.linkUrl);
      router.refresh();
    }
  }

  async function markAll() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`bell${unread > 0 ? " bell--active" : ""}${ringing ? " bell--ring" : ""}`}
        aria-label="Notifikace"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && <span className="bell__badge">{unread}</span>}
      </button>

      {open && (
        <div className="bell-popover">
          <div className="bell-popover__header">
            <strong>Notifikace</strong>
            {unread > 0 && (
              <button onClick={markAll} className="nav-link" style={{ padding: "2px 6px", fontSize: 12 }}>
                Označit vše
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
              Žádné notifikace.
            </p>
          ) : (
            <ul>
              {items.map((n) => (
                <li
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`bell-item${!n.read ? " bell-item--unread" : ""}`}
                >
                  {n.message}
                  <div className="bell-item__time">
                    {new Date(n.createdAt).toLocaleString("cs-CZ")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
