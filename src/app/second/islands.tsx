"use client";

import { type ReactNode, useRef, useState } from "react";

const APARAT = "https://www.aparat.com/playtalk";

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

  return (
    <>
      <button
        type="button"
        aria-label={`پخش ویدیو: ${title}`}
        className={className}
        onClick={() => {
          setFailed(false);
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
                onClick={() => setFailed(false)}
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
            // biome-ignore lint/a11y/useMediaCaption: no caption track supplied for this source video
            <video
              ref={video}
              src={src}
              poster={poster}
              controls
              autoPlay
              playsInline
              onError={() => setFailed(true)}
              className="block aspect-video w-full bg-black"
            />
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
            className={`min-h-[46px] rounded-[14px] px-4 text-[15px] transition-colors ${
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
