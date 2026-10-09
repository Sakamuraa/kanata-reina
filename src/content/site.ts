/**
 * Identity strings, sourced from the real channel.
 *
 * Provenance, so nothing here has to be trusted on faith:
 *   - name, bio ................. YouTube channel description + X profile bio
 *   - avatar .................... yt3.googleusercontent.com (channel avatar)
 *   - join date ................. X profile, "Joined October 2022"
 *   - credits ................... the creator's own X bio
 *   - hashtags .................. the creator's own list
 *   - series .................... counted from the feed titles
 *
 * The content lists are NOT here. They come from /api/content at request time
 * and keep only a bundled snapshot in src/lib/useContent.ts, so there is one
 * place to look for broadcast data instead of two that can drift apart.
 */

export const site = {
  name: "Kanata Reina",
  /** Name as it appears on the channel, verbatim. */
  channelTitle: "Kanata Reina Ch.",
  /**
   * Her own description, kept close to what she publishes.
   *
   * The channel description reads "Virtual Youtuber Indonesia / LOVE WITCH /
   * Kanata Reina". The second line is a tag she uses for herself rather than a
   * sentence, so it is left as the tag it is instead of being expanded into
   * something she did not write. Her X bio is the other half: a family act,
   * commissions, and the art hashtag.
   */
  bio: "Virtual YouTuber Indonesia. Isekai, love witch.",
  /**
   * Production origin. The site is served from its own subdomain, so the origin
   * and the site URL are the same thing. Kept in sync with index.html,
   * robots.txt, and sitemap.xml.
   */
  url: "https://kanatareina.vtube-info.xyz",
  locale: "id_ID",
  avatar: "/og-image.png",
  /**
   * Alt text for the channel avatar.
   *
   * Deliberately does not describe the picture. The artwork is hers and any
   * description here would be invented rather than read off it, which serves a
   * screen reader worse than naming what the image is for.
   */
  avatarAlt: "Avatar kanal YouTube Kanata Reina",
  /** Smaller crop used for the nav mark, where the square version is too heavy. */
  avatarSmall: "/media/avatar-x.webp",
  joined: "Bergabung di X sejak Oktober 2022",
  /**
   * People she names herself, from her own X bio.
   *
   * She writes them as ママ and パパ -- mother and father -- which is how the
   * account presents: a family of characters rather than a solo act. Recorded as
   * "Mama" and "Papa" so the page keeps the relationship she chose, and the
   * Japanese stays in the bio on /tentang where it is her wording.
   */
  credits: [
    { role: "Mama", name: "@arthronoAicent" },
    { role: "Papa", name: "@aerixderune" },
  ],
} as const;

export const channels = {
  youtube: {
    label: "YouTube",
    handle: "@KanataReinaCh",
    url: "https://www.youtube.com/@KanataReinaCh",
    note: "Cover dan live",
  },
  x: {
    label: "X",
    handle: "@Kanata_Reina",
    url: "https://x.com/Kanata_Reina",
    note: "Jadwal live dan harian",
  },
  facebook: {
    label: "Facebook",
    handle: "KanataReina",
    url: "https://www.facebook.com/KanataReina",
    note: "Konten dan pengumuman",
  },
  instagram: {
    label: "Instagram",
    handle: "@kanata_reina",
    url: "https://www.instagram.com/kanata_reina",
    note: "Foto dan story",
  },
  tiktok: {
    label: "TikTok",
    handle: "@kanatareina",
    url: "https://www.tiktok.com/@kanatareina",
    note: "Clip pendek",
  },
} as const;

/**
 * Route table.
 *
 * Owned here rather than in App.tsx so the nav and the router cannot disagree
 * about which paths exist. App imports the type; nothing else needs the list.
 */
export const ROUTES = [
  "/",
  "/tentang",
  "/konten",
  "/konten/streams",
  "/konten/video",
  "/konten/clips",
  "/tweets",
  "/fanart",
  "/channel",
] as const;

export type Route = (typeof ROUTES)[number];

/** The creator's own hashtags, in the order the channel description lists them. */
export const hashtags = [
  { tag: "#kanatareina", use: "General" },
  { tag: "#ReinaGaming", use: "Gaming" },
  { tag: "#ReinaFreetalk", use: "Freetalk" },
  { tag: "#ReinaFanart", use: "Fan Art" },
  { tag: "#ReinaRandom", use: "Random" },
  { tag: "#ReinaKaraoke", use: "Karaoke" },
] as const;

/**
 * Series names exactly as they appear between the brackets in the feed titles.
 * The "kind" column is a plain reading of what the title is about, not a claim
 * from the creator.
 */
export const series = [
  { name: "Pajama Night", kind: "Obrolan" },
  { name: "REIVIEW SET UP", kind: "Review" },
  { name: "ONCAM ASMR", kind: "ASMR" },
] as const;

/**
 * Colophon. A credit line naming who built the page. Kept as a footnote, not a
 * showcase section.
 */
export const colophon = {
  /** Credit line. Replaces a former tool list, which described the stack rather than the person. */
  credit: "Developed by Sakamura",
} as const;

/**
 * Nav links.
 *
 * Every href is a full route, never a bare "#anchor". That is the fix for the
 * footer bug: on /konten, "#tentang" and "#channel" resolved against a page that
 * has neither section, so both looked clickable and did nothing. A path always
 * resolves, and the nav and the router now read the same table.
 *
 * `satisfies` ties every href to the Route union, so a typo becomes a type error
 * rather than a link that quietly goes nowhere.
 */
export const navigation = [
  { label: "Tentang", href: "/tentang" },
  { label: "Konten", href: "/konten" },
  { label: "Tweets", href: "/tweets" },
  { label: "Fan Art", href: "/fanart" },
  { label: "Channel", href: "/channel" },
] as const satisfies ReadonlyArray<{ label: string; href: Route }>;