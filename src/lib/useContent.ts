import { useEffect, useState } from "react";

export type ContentItem = {
  videoId: string;
  url: string;
  title: string;
  thumbnail: string;
  live: boolean;
  viewers: number | null;
  /** "5 jam lalu", as the channel's own grid writes it. */
  age: string | null;
  /**
   * Absolute publish instant behind `age`.
   *
   * The API path sends this so the label can be re-derived from it rather than
   * read verbatim. The string alone is a snapshot of one moment -- an edge cache
   * happily serves the same payload for an hour, and a card that prints the
   * cached string keeps claiming "6 jam lalu" long after the stream is nine hours
   * old. Measuring from an instant cannot go stale that way.
   */
  publishedAt?: string | null;
  /** Runtime of a finished video, e.g. "2.03.50". Null on a broadcast. */
  duration: string | null;
  /** Publishing channel, on the clips tab only. */
  channel?: string;
  /** Scheduled but not started. Separate from live: one is now, one is later. */
  upcoming?: boolean;
  /** Scheduled start as unix seconds, for the countdown. Null when unknown. */
  scheduledStart?: number | null;
};

type ApiPayload = {
  fetchedAt: string;
  liveCount: number;
  sources: Record<"streams" | "videos" | "clips", boolean>;
  streams: ContentItem[];
  videos: ContentItem[];
  clips: ContentItem[];
  /** Scheduled broadcast, or null. */
  upcoming?: ContentItem | null;
};

type State = {
  streams: ContentItem[];
  videos: ContentItem[];
  clips: ContentItem[];
  /** Scheduled but not started, when there is one. */
  upcoming: ContentItem | null;
  /** True when at least one broadcast is confirmed live. */
  live: boolean;
  /** "api" once a response lands, "snapshot" while on the bundled copy. */
  source: "api" | "snapshot" | "loading";
  error: string | null;
};

/** When the snapshot's ages were measured, so the client can keep them honest. */
const SNAPSHOT_AT = "2026-10-09T16:16:37.298Z";

/**
 * Bundled copies of the three lists, taken 2026-10-08.
 *
 * The fallback for a static host with no serverless runtime, and for the window
 * before the fetch resolves. Ages are the channel's own labels from that moment,
 * stored as seconds so `formatAge` can advance them: a snapshot that keeps
 * saying "1 jam lalu" a week later would be lying, and this is the only part of
 * the page that can go stale with no server to refresh it.
 */
const SNAPSHOT_STREAMS: ContentItem[] = [
  { videoId: "IcE2hD9029Q", url: "https://www.youtube.com/watch?v=IcE2hD9029Q", title: "【Pajama Night】miawwwwww", thumbnail: "", live: true, viewers: null, age: null, duration: null },
  { videoId: "GoaipuPBR78", url: "https://www.youtube.com/watch?v=GoaipuPBR78", title: "📸ONCAM ASMR - Rainy night call 📞❤️", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "bG5EB49swso", url: "https://www.youtube.com/watch?v=bG5EB49swso", title: "REIVIEW SET UP | mana nih set up kaliaannn Part 2", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "tR880g7C6Io", url: "https://www.youtube.com/watch?v=tR880g7C6Io", title: "New Season New Me | Honor of Kings", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "JrB7bjctRdA", url: "https://www.youtube.com/watch?v=JrB7bjctRdA", title: "【Pajama Night】bentaran ajahh karna macih atit", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "BSfd7A0nKEI", url: "https://www.youtube.com/watch?v=BSfd7A0nKEI", title: "REIVIEW SET UP - mana nih set up kaliaannn", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "gqQAgb2Q5tE", url: "https://www.youtube.com/watch?v=gqQAgb2Q5tE", title: "sini Reina sembuhkan sakit hati kamu 💖💗🥰💞", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "kJheu4E6V18", url: "https://www.youtube.com/watch?v=kJheu4E6V18", title: "disuruh stream, katanya kangen padahal baru stream tadi", thumbnail: "", live: false, viewers: null, age: null, duration: null },
];

const SNAPSHOT_VIDEOS: ContentItem[] = [
  { videoId: "gdk1QFH4uhM", url: "https://www.youtube.com/watch?v=gdk1QFH4uhM", title: "【COVER】Naykilla - SO ASU | Cover By Kanata Reina", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "xPFepd1EPjU", url: "https://www.youtube.com/watch?v=xPFepd1EPjU", title: "【COVER】Cherry Pop (チェリーポップ) - DECO*27 ft. Hatsune Miku | Cover By Kanata Reina", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "Ry19U_5oid4", url: "https://www.youtube.com/watch?v=Ry19U_5oid4", title: "【COVER】Alamak - Rizky Febian & Adrian Khalif | Cover By Kanata Reina", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "0CgZQG_36_c", url: "https://www.youtube.com/watch?v=0CgZQG_36_c", title: "【COVER】Luna Haruna - Kimiiro Signal | Cover By Kanata Reina", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "gYYIp7eKb-A", url: "https://www.youtube.com/watch?v=gYYIp7eKb-A", title: "【COVER】PASILYO - SUNKISSED LOLA | INDONESIAN VERSION - HANYA KAMU | COVER BY KANATA REINA", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "YNPxbXoLJjo", url: "https://www.youtube.com/watch?v=YNPxbXoLJjo", title: "Rating kehokian Reina dari 1-10 🥰🥰🥰", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "GH97SGrllJg", url: "https://www.youtube.com/watch?v=GH97SGrllJg", title: "【COVER】 KATAOMOI『カタオモイ』- AIMER  | COVER BY KANATA REINA", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "vTwyimREj7g", url: "https://www.youtube.com/watch?v=vTwyimREj7g", title: "Kalau mau jadi Yuki tinggal ganti wig 😎 #vtuber #vtuberindonesia #alya #vtuberclips", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "EXDIAdczLZY", url: "https://www.youtube.com/watch?v=EXDIAdczLZY", title: "【COVER】 IDOL / アイドル - YOASOBI (TV SIZE VER.) 『OSHI NO KO OPENING』 | COVER BY REINA & AMV BY DRYYYNNN", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "1PWfnJuKaHs", url: "https://www.youtube.com/watch?v=1PWfnJuKaHs", title: "Oh! Asmara - Kobo Kanaeru【Cover by. Kanata Reina】| #AsmaraUntukKobo #OhAsmara | Vtuber Cover Song", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "bDTsQuDGIrI", url: "https://www.youtube.com/watch?v=bDTsQuDGIrI", title: "Sesepuh vtuber evelyn epel memberikan tips suara bagus ke reina | #clips #vtuberclip #vtuberid", thumbnail: "", live: false, viewers: null, age: null, duration: null },
  { videoId: "m0JxvIVwH9I", url: "https://www.youtube.com/watch?v=m0JxvIVwH9I", title: "KETIKA SEORANG VTUBER MENGATAKAN ARA-ARA SAAT GACHA, GACHANYA PASTI WANGY #clips #vtuberid #vtuber", thumbnail: "", live: false, viewers: null, age: null, duration: null },
];

const SNAPSHOT_CLIPS: ContentItem[] = [
  { videoId: "scCcAJYvN9s", url: "https://www.youtube.com/watch?v=scCcAJYvN9s", title: "Kak Reina Shock Dengan Dramok Keyboard Pemda | [ Kanata Reina ] @KanataReinaCh", thumbnail: "", live: false, viewers: null, age: null, duration: null, channel: "Zaky Koshka Ch." },
  { videoId: "0wqvL-FT__0", url: "https://www.youtube.com/watch?v=0wqvL-FT__0", title: "Gemes Banget Frierennya [Kanata Reina Ch.]", thumbnail: "", live: false, viewers: null, age: null, duration: null, channel: "Fuutaba Clips" },
  { videoId: "jDq-EisvULk", url: "https://www.youtube.com/watch?v=jDq-EisvULk", title: "Akhirnya Aku Menemukan My Kisah ku Guys [Kanata Reina Ch.]", thumbnail: "", live: false, viewers: null, age: null, duration: null, channel: "Fuutaba Clips" },
];

/** Ages as measured at capture time, in seconds. */
const SNAPSHOT_AGES: Record<string, number> = {
  GoaipuPBR78: 82800,
  bG5EB49swso: 172800,
  tR880g7C6Io: 172800,
  JrB7bjctRdA: 604800,
  BSfd7A0nKEI: 691200,
  gqQAgb2Q5tE: 777600,
  kJheu4E6V18: 864000,
  gdk1QFH4uhM: 10368000,
  xPFepd1EPjU: 23328000,
  Ry19U_5oid4: 23328000,
  "0CgZQG_36_c": 28512000,
  "gYYIp7eKb-A": 31536000,
  YNPxbXoLJjo: 31536000,
  GH97SGrllJg: 31536000,
  vTwyimREj7g: 63072000,
  EXDIAdczLZY: 94608000,
  "1PWfnJuKaHs": 94608000,
  bDTsQuDGIrI: 94608000,
  m0JxvIVwH9I: 94608000,
  scCcAJYvN9s: 15552000,
  "0wqvL-FT__0": 31536000,
  "jDq-EisvULk": 31536000,
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
/**
 * A year, at 365 days rather than 365.25.
 *
 * The same figure api/content.ts uses for `tahun`, so a label the API is able to
 * produce is one this can render. The labels are coarse either way -- "1 tahun
 * lalu" on YouTube covers anything from 12 to 24 months -- so the extra precision
 * would be precision the source does not have.
 */
const YEAR = 365 * DAY;

/**
 * Re-render a duration as the age label the card shows.
 *
 * Boundaries match YouTube's own grids closely enough to read the same: they drop
 * to days around a day, to weeks around a week, to months around a month, and to
 * years around a year. A value under a minute reads as "beberapa detik", which is
 * what YouTube says for that window rather than the number zero.
 *
 * The year tier exists because two of the endpoints can return "tahun" and this
 * could not say it: an eleven-year-old clip came out as "133 bulan lalu", which is
 * a true number and a meaningless one. Every bundled snapshot also holds entries
 * older than a year, so the same label appeared on those without any API involved.
 */
export function formatAge(ms: number): string {
  if (ms < MINUTE) return "beberapa detik lalu";
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)} menit lalu`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)} jam lalu`;
  if (ms < WEEK) return `${Math.floor(ms / DAY)} hari lalu`;
  if (ms < MONTH) return `${Math.floor(ms / WEEK)} minggu lalu`;
  if (ms < YEAR) return `${Math.floor(ms / MONTH)} bulan lalu`;
  return `${Math.floor(ms / YEAR)} tahun lalu`;
}

/**
 * The age to render for one item, from whichever source supplied it.
 *
 * The API path is measured, not quoted. `publishedAt` is a wall-clock instant, so
 * the label is re-derived from it every render and stays correct however long the
 * payload sat in a cache. The `age` string is kept only as a fallback for a
 * response that predates the field.
 *
 * The snapshot path carries the measured duration instead, so its label advances
 * the same way -- a copy that keeps saying "1 jam lalu" a week later would be
 * lying, and caching is the only part of this page that can go stale with no
 * server to refresh it.
 */
export function ageLabel(item: ContentItem): string | null {
  if (item.publishedAt) {
    const elapsed = Date.now() - new Date(item.publishedAt).getTime();
    if (Number.isFinite(elapsed) && elapsed >= 0) return formatAge(elapsed);
  }

  if (item.age) return item.age;

  const captured = SNAPSHOT_AGES[item.videoId];
  if (captured === undefined) return null;

  const elapsed = Date.now() - new Date(SNAPSHOT_AT).getTime();
  // A clock behind the capture would produce a negative age, which is worse than
  // showing nothing.
  if (!Number.isFinite(elapsed) || elapsed < 0) return null;

  return formatAge(captured * SECOND + elapsed);
}

const INITIAL: State = {
  streams: [],
  videos: [],
  clips: [],
  // Null until the endpoint answers, and deliberately not a bundled copy. Every
  // other list falls back to the snapshot because a slightly old upload is still
  // true; a scheduled stream is a claim about a future that can be cancelled.
  upcoming: null,
  live: false,
  source: "loading",
  error: null,
};

/**
 * All three content lists.
 *
 * `/api/content` supplies the fresh lists and the one thing a bundled snapshot
 * cannot know: whether a stream is running right now. Until it answers the cards
 * come from the snapshot, so no section is ever empty. If the endpoint is missing
 * or errors, the snapshot stays and the visitor sees a correct, slightly older
 * page with no error.
 */
/**
 * How often to re-read the feed.
 *
 * Short enough that a stream starting is noticed while someone is looking at the
 * page, long enough not to hammer a serverless function. The endpoint's own edge
 * cache is what this sits behind.
 */
const POLL_MS = 60_000;

export function useContent(): State {
  const [state, setState] = useState<State>(INITIAL);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failed = false;

    /*
     * Re-reads on a timer rather than once.
     *
     * A stream starts and ends while the page is open. Fetched once on mount, the
     * page would keep calling a finished broadcast live, or miss one that began
     * after it loaded, until the visitor reloaded by hand. The same reasoning the
     * endpoint caches for: a stale answer is worse here than a slightly late one,
     * because "live" is a claim about right now.
     *
     * Polling stops while the tab is hidden and resumes when it comes back, so a
     * tab left open in the background costs nothing.
     */
    async function load() {
      try {
        const res = await fetch("/api/content", {
          signal: controller.signal,
          // The edge holds this for minutes; without a bypass a poll would read
          // the same cached copy it just read.
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`api returned ${res.status}`);

        const payload = (await res.json()) as ApiPayload;
        if (!Array.isArray(payload.streams) || payload.streams.length === 0) {
          throw new Error("api returned no streams");
        }

        failed = false;
        setState({
          streams: payload.streams,
          videos: Array.isArray(payload.videos) ? payload.videos : [],
          clips: Array.isArray(payload.clips) ? payload.clips : [],
          // The endpoint decides whether anything is scheduled, so its answer
          // replaces any bundled copy outright: a stale upcoming card is a claim
          // about the future and must not age in place.
          upcoming: payload.upcoming ?? null,
          live: payload.streams.some((item) => item.live),
          source: "api",
          error: null,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        failed = true;
        setState({
          streams: SNAPSHOT_STREAMS,
          videos: SNAPSHOT_VIDEOS,
          clips: SNAPSHOT_CLIPS,
          // No snapshot copy on this path -- see the note on INITIAL.
          upcoming: null,
          live: false,
          source: "snapshot",
          error: error instanceof Error ? error.message : String(error),
        });
      }

      // Give up rather than retry a broken endpoint forever.
      if (!failed && !controller.signal.aborted) timer = setTimeout(load, POLL_MS);
    }

    void load();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (timer) clearTimeout(timer);
        void load();
      } else if (timer) {
        clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      controller.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return state;
}