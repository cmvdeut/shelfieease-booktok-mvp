"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event, type View } from "react-big-calendar";
import withDragAndDrop, { type EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { nl } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const locales = { nl };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

type Post = {
  id: string;
  platform: string;
  format: string;
  status: string;
  scheduledAt: string;
  caption: string;
  captionPreview?: string | null;
  mediaPath?: string | null;
  permalink?: string | null;
  error?: string | null;
  manualOnly: boolean;
  publishLogs?: { success: boolean; message: string; createdAt: string }[];
};

type Slot = {
  id: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  timezone: string;
  platforms: string[];
  enabled: boolean;
};

type MediaFile = {
  path: string;
  name: string;
  size: number;
  publicUrl: string;
};

const DAY_NAMES = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "#3b82f6",
  publishing: "#f59e0b",
  published: "#22c55e",
  failed: "#ef4444",
  skipped: "#94a3b8",
  draft: "#a78bfa",
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export default function SocialHubClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"calendar" | "queue" | "media" | "slots">("calendar");
  const [posts, setPosts] = useState<Post[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Post | null>(null);
  const [calendarView, setCalendarView] = useState<View>("week");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [busy, setBusy] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const refresh = useCallback(async () => {
    const [p, s, m] = await Promise.all([
      api<Post[]>("/api/social/posts"),
      api<Slot[]>("/api/social/slots"),
      api<MediaFile[]>("/api/social/media"),
    ]);
    setPosts(p);
    setSlots(s);
    setMedia(m);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
        setAuthed(true);
      } catch {
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/social/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setLoginError("Onjuist wachtwoord");
        return;
      }
      setAuthed(true);
      await refresh();
    } catch {
      setLoginError("Login mislukt");
    }
  };

  const filteredPosts = useMemo(() => {
    if (filterPlatform === "all") return posts;
    return posts.filter((p) => p.platform === filterPlatform);
  }, [posts, filterPlatform]);

  const calendarEvents: Event[] = useMemo(
    () =>
      filteredPosts.map((p) => ({
        id: p.id,
        title: `${p.platform} · ${p.format}${p.manualOnly ? " (handmatig)" : ""}`,
        start: new Date(p.scheduledAt),
        end: new Date(new Date(p.scheduledAt).getTime() + 30 * 60 * 1000),
        resource: p,
      })),
    [filteredPosts]
  );

  const eventStyleGetter = useCallback((event: Event) => {
    const post = event.resource as Post | undefined;
    const bg = post ? STATUS_COLORS[post.status] || "#64748b" : "#64748b";
    return { style: { backgroundColor: bg, border: "none", fontSize: "12px" } };
  }, []);

  const onEventDrop = async ({ event, start }: EventInteractionArgs<Event>) => {
    const id = String((event as Event & { id: string }).id);
    setBusy(id);
    try {
      await api(`/api/social/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt: (start as Date).toISOString() }),
      });
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  const publishNow = async (id: string) => {
    setBusy(id);
    try {
      await api(`/api/social/posts/${id}/publish`, { method: "POST" });
      await refresh();
      const updated = (await api<Post[]>("/api/social/posts")).find((p) => p.id === id);
      if (updated) setSelected(updated);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Publish mislukt");
    } finally {
      setBusy(null);
    }
  };

  const runWorkerOnce = async () => {
    setBusy("worker");
    try {
      const r = await api<{ processed: number; results: { id: string; message: string }[] }>(
        "/api/social/worker",
        { method: "POST" }
      );
      alert(`Worker: ${r.processed} post(s) verwerkt`);
      await refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Worker mislukt");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return <p className="p-8 text-neutral-500">Social Hub laden…</p>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm p-8">
        <h1 className="mb-4 text-2xl font-semibold">Social Hub</h1>
        <p className="mb-4 text-sm text-neutral-500">TikTok + Instagram planning (lokaal)</p>
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wachtwoord (SOCIAL_HUB_PASSWORD)"
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-600 dark:bg-neutral-900"
          />
          {loginError && <p className="text-sm text-red-600">{loginError}</p>}
          <button
            type="submit"
            className="w-full rounded bg-neutral-900 px-4 py-2 text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            Inloggen
          </button>
        </form>
        <p className="mt-4 text-xs text-neutral-400">
          Zonder wachtwoord in .env.local opent de hub direct na setup.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Social Hub</h1>
            <p className="text-xs text-neutral-500">Kalender · queue · media · slots</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="rounded border px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-800"
            >
              <option value="all">Alle platforms</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
            <button
              type="button"
              onClick={runWorkerOnce}
              disabled={busy === "worker"}
              className="rounded border px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Worker (due now)
            </button>
            <button
              type="button"
              onClick={() => refresh()}
              className="rounded border px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Vernieuwen
            </button>
          </div>
        </div>
        <nav className="mx-auto mt-3 flex max-w-7xl gap-1">
          {(["calendar", "queue", "media", "slots"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1 text-sm capitalize ${
                tab === t ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-600"
              }`}
            >
              {t === "calendar" ? "Kalender" : t === "queue" ? "Queue" : t === "media" ? "Media" : "Slots"}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[1fr_320px]">
        <section className="min-h-[480px] rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
          {tab === "calendar" && (
            <div className="h-[600px]">
              <DnDCalendar
                localizer={localizer}
                events={calendarEvents}
                view={calendarView}
                onView={setCalendarView}
                date={calendarDate}
                onNavigate={setCalendarDate}
                culture="nl"
                draggableAccessor={() => true}
                resizable={false}
                onEventDrop={onEventDrop}
                onSelectEvent={(e) => setSelected((e as Event).resource as Post)}
                eventPropGetter={eventStyleGetter}
                style={{ height: "100%" }}
              />
            </div>
          )}

          {tab === "queue" && (
            <ul className="divide-y dark:divide-neutral-800">
              {filteredPosts.map((p) => (
                <li
                  key={p.id}
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-2 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  onClick={() => setSelected(p)}
                >
                  <div>
                    <span className="font-medium capitalize">{p.platform}</span>
                    <span className="ml-2 text-xs text-neutral-500">{p.format}</span>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {format(new Date(p.scheduledAt), "dd MMM yyyy HH:mm", { locale: nl })}
                    </p>
                  </div>
                  <span
                    className="rounded px-2 py-0.5 text-xs text-white"
                    style={{ backgroundColor: STATUS_COLORS[p.status] || "#64748b" }}
                  >
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {tab === "media" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {media.map((f) => (
                <div
                  key={f.path}
                  className="rounded border p-3 dark:border-neutral-700"
                >
                  <p className="truncate font-mono text-sm">{f.name}</p>
                  <p className="text-xs text-neutral-500">
                    {(f.size / 1024 / 1024).toFixed(1)} MB · {f.name.includes("nl") ? "NL" : f.name.includes("en") ? "EN" : "—"}
                  </p>
                  <a
                    href={f.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-xs text-blue-600 underline"
                  >
                    Publieke URL
                  </a>
                </div>
              ))}
            </div>
          )}

          {tab === "slots" && (
            <div className="space-y-3">
              {slots.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded border px-3 py-2 dark:border-neutral-700"
                >
                  <span>
                    {DAY_NAMES[s.dayOfWeek]} {String(s.hour).padStart(2, "0")}:
                    {String(s.minute).padStart(2, "0")} — {s.platforms.join(", ")}
                  </span>
                  <span className={`text-xs ${s.enabled ? "text-green-600" : "text-neutral-400"}`}>
                    {s.enabled ? "actief" : "uit"}
                  </span>
                </div>
              ))}
              <p className="text-xs text-neutral-500">
                Standaardslots uit seed. Bewerken via API of prisma studio.
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          {selected ? (
            <div className="space-y-3 text-sm">
              <h2 className="font-semibold capitalize">
                {selected.platform} · {selected.format}
              </h2>
              <p className="text-xs text-neutral-500">
                {format(new Date(selected.scheduledAt), "EEEE d MMMM yyyy HH:mm", { locale: nl })}
              </p>
              <p className="whitespace-pre-wrap text-xs leading-relaxed">{selected.captionPreview || selected.caption}</p>
              {selected.mediaPath && (
                <p className="font-mono text-xs text-neutral-500">{selected.mediaPath}</p>
              )}
              {selected.error && <p className="text-xs text-red-600">{selected.error}</p>}
              {selected.permalink && (
                <a href={selected.permalink} className="text-xs text-blue-600 underline" target="_blank" rel="noreferrer">
                  Permalink
                </a>
              )}
              {selected.publishLogs && selected.publishLogs.length > 0 && (
                <div className="text-xs text-neutral-500">
                  Laatste log: {selected.publishLogs[0].message}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {selected.mediaPath && !selected.manualOnly && selected.format === "reel" && (
                  <button
                    type="button"
                    disabled={busy === selected.id}
                    onClick={() => publishNow(selected.id)}
                    className="rounded bg-green-700 px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    Publish now
                  </button>
                )}
                {selected.manualOnly && (
                  <span className="text-xs text-amber-600">Handmatig (carousel/story/geen video)</span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Selecteer een post in de kalender of queue.</p>
          )}
        </aside>
      </main>
    </div>
  );
}
