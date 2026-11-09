"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

const APARAT = "https://www.aparat.com/playtalk";

export function MobileMenu({ children }: { children: ReactNode }) {
  return (
    <nav
      id="main-menu"
      popover="auto"
      aria-label="منوی اصلی"
      className="glass menu-pop menu-solid inset-x-3 top-[76px] mx-auto m-0 w-auto rounded-2xl px-4 pt-1.5 pb-3.5 text-[#0E1733]"
      onClick={(e) => {
        if (e.target instanceof Element && e.target.closest("a"))
          e.currentTarget.hidePopover();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") e.currentTarget.hidePopover();
      }}
    >
      {children}
    </nav>
  );
}

/** Trigger + native <dialog> video player. Video loads only after the user asks for it. */
export function VideoDialog({
  src,
  poster,
  title,
  className,
  children,
}: {
  src: string;
  poster: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <>
      <button
        type="button"
        aria-label={`پخش ویدیو: ${title}`}
        className={className}
        onClick={() => {
          setFailed(false);
          setLoading(true);
          setOpen(true);
          dialog.current?.showModal();
        }}
      >
        {children}
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse shortcut; Esc and the close button cover keyboard */}
      <dialog
        ref={dialog}
        aria-label={title}
        onClose={() => {
          video.current?.pause();
          setOpen(false);
        }}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(92vw,960px)] overflow-hidden rounded-[22px] bg-[#0E1733] p-0 text-white shadow-2xl backdrop:bg-[#0E1733]/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <h2 className="text-base font-extrabold">{title}</h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="flex min-h-11 items-center rounded-xl bg-white px-4 text-sm font-bold text-[#0E1733]"
          >
            بستن
          </button>
        </div>
        {failed ? (
          <div role="alert" className="flex flex-col gap-3 px-4 pb-5">
            <strong>ویدیو الان در دسترس نیست</strong>
            <p className="text-[15px] leading-[1.8] text-[#E6ECF8]">
              ممکن است اینترنت قطع شده باشد. دوباره امتحان کنید یا ویدیو را در
              کانال آپارات پلی‌تاک ببینید.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setFailed(false);
                }}
                className="min-h-11 flex-1 rounded-xl bg-white font-bold text-[#0E1733]"
              >
                تلاش دوباره
              </button>
              <a
                href={APARAT}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/40"
              >
                کانال آپارات
              </a>
            </div>
          </div>
        ) : (
          open && (
            <div className="relative">
              {/* biome-ignore lint/a11y/useMediaCaption: no caption track supplied for this source video */}
              <video
                ref={video}
                src={src}
                poster={poster}
                controls
                autoPlay
                playsInline
                onError={() => setFailed(true)}
                onWaiting={() => setLoading(true)}
                onPlaying={() => setLoading(false)}
                onCanPlay={() => setLoading(false)}
                className="block aspect-video w-full bg-black"
              />
              {loading && (
                <output className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0E1733]/55 backdrop-blur-[2px]">
                  <span aria-hidden="true" className="pixel-loader">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="text-[15px] font-semibold">
                    در حال بارگذاری ویدیو…
                  </span>
                </output>
              )}
            </div>
          )
        )}
      </dialog>
    </>
  );
}

type Building = { label: string; title: string; pts: string[]; note?: boolean };

/** ARIA tabs with roving focus. RTL: ArrowLeft = next. */
export function TownTabs({ town }: { town: Building[] }) {
  const [cur, setCur] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = town.length;
  const pick = (i: number) => {
    setCur(i);
    tabs.current[i]?.focus();
  };
  const t = town[cur];
  const FA = "۰۱۲۳۴۵۶۷۸۹";

  return (
    <>
      <div
        role="tablist"
        aria-label="ساختمان‌های شهر پلی‌تاک"
        className="relative flex flex-wrap gap-1.5"
        onKeyDown={(e) => {
          const next =
            e.key === "ArrowLeft"
              ? (cur + 1) % n
              : e.key === "ArrowRight"
                ? (cur - 1 + n) % n
                : e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? n - 1
                    : null;
          if (next === null) return;
          e.preventDefault();
          pick(next);
        }}
      >
        {town.map((b, i) => (
          <button
            key={b.label}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`town-tab-${i}`}
            aria-selected={cur === i}
            aria-controls="town-panel"
            tabIndex={cur === i ? 0 : -1}
            onClick={() => setCur(i)}
            className={`min-h-[46px] rounded-[14px] px-4 text-[15px] transition-[background-color,color,transform,box-shadow] duration-200 active:scale-95 ${
              cur === i
                ? "border-2 border-[#0E1733] bg-[#0E1733] font-extrabold text-white"
                : "glass font-semibold"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id="town-panel"
        aria-labelledby={`town-tab-${cur}`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: WAI-ARIA tabs pattern — panel without focusable content is focusable
        tabIndex={0}
        className="glass relative flex flex-col gap-2.5 rounded-[20px] px-[18px] py-5 shadow-[0_12px_32px_rgba(14,23,51,.18)] md:max-w-xl"
      >
        <div key={cur} className="tour-in flex flex-col gap-2.5">
          <span className="text-sm font-extrabold text-[#1F6A28]">
            ساختمان {FA[cur + 1]} از ۵
          </span>
          <h3 className="text-xl leading-[1.6] font-extrabold">{t.title}</h3>
          <ul className="flex flex-col gap-2.5">
            {t.pts.map((p) => (
              <li
                key={p}
                className="flex gap-2.5 text-base leading-[1.85] text-[#1F2B47]"
              >
                <span
                  aria-hidden="true"
                  className="mt-3 size-2 shrink-0 bg-[#287A32]"
                />
                {p}
              </li>
            ))}
          </ul>
          {t.note && (
            <p className="text-sm text-[#3D4A66]">طبق برنامهٔ فعلی پلی‌تاک.</p>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * Hero background loop. The first frame is a priority image (fast LCP); the video fades in
 * over it once it is actually playing. Skipped for reduced motion / Save-Data and paused
 * while off-screen to save battery.
 */
export function HeroVideo({
  src,
  portraitSrc,
  still,
}: {
  src: string;
  /** 9:16 centre cut with the brand placed above the phone card. */
  portraitSrc: string;
  still: ReactNode;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const saveData = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection?.saveData;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || saveData)
      return;
    const portrait = matchMedia("(max-aspect-ratio: 4/5)");
    const pick = () => {
      const next = portrait.matches ? portraitSrc : src;
      if (v.getAttribute("src") === next) return;
      setPlaying(false);
      v.src = next;
      if (!pausedRef.current) v.play().catch(() => {});
    };
    pick();
    portrait.addEventListener("change", pick);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !pausedRef.current) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => {
      io.disconnect();
      portrait.removeEventListener("change", pick);
    };
  }, [src, portraitSrc]);

  return (
    <>
      <div aria-hidden="true" className="hero-media absolute inset-0 -z-20">
        {still}
        <video
          ref={video}
          tabIndex={-1}
          muted
          loop
          playsInline
          preload="none"
          onPlaying={() => setPlaying(true)}
          onError={() => setPlaying(false)}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] ${playing ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      {playing && (
        <button
          type="button"
          aria-label={paused ? "ادامهٔ ویدیوی پس‌زمینه" : "توقف ویدیوی پس‌زمینه"}
          aria-pressed={paused}
          className="absolute top-24 end-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/60 bg-[#0E1733]/75 text-white motion-reduce:hidden"
          onClick={() => {
            const next = !paused;
            pausedRef.current = next;
            setPaused(next);
            if (next) video.current?.pause();
            else video.current?.play().catch(() => {});
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={paused ? "M7 5v14l12-7z" : "M7 5h4v14H7zM13 5h4v14h-4z"} />
          </svg>
        </button>
      )}
    </>
  );
}

/** Desktop header links with scroll-spy: the section in view gets aria-current + underline. */
export function ActiveNav({ items }: { items: string[][] }) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const seen = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        setActive(items.find(([href]) => seen.get(href.slice(1)))?.[0] ?? "");
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const [href] of items) {
      const el = document.getElementById(href.slice(1));
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="در این صفحه" className="hidden items-center gap-1 lg:flex">
      {items.map(([href, label]) => (
        <a
          key={href}
          href={href}
          aria-current={active === href ? "location" : undefined}
          className="nav-link relative rounded-xl px-3 py-2 text-[15px] font-bold transition-colors hover:bg-[#0E1733]/5 aria-[current]:text-[#287A32]"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
