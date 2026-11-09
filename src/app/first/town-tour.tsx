"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createMusic } from "./music";
import type { TownScene } from "./scene";

const MUSIC_KEY = "playtalk-music";

const STEPS = [
  {
    short: "حساب",
    title: "ساخت حساب",
    body: "اول یک حساب پلی‌تاک می‌سازید. فقط چند اطلاعات ساده لازم است.",
    account: true,
  },
  {
    short: "بازی",
    title: "بازی کوتاه تعیین سطح",
    body: "یک بازی کوتاه آنلاین تا ببینیم چقدر انگلیسی بلد است. اگر از صفر شروع می‌کند، مستقیم از سطح اول شروع می‌کند.",
  },
  {
    short: "مدرس",
    title: "گفت‌وگو با مدرس، اگر لازم باشد",
    body: "گاهی یک جلسهٔ ۱۵ دقیقه‌ای آنلاین با مدرس هم برگزار می‌شود تا سطح دقیق‌تر مشخص شود.",
  },
  {
    short: "سطح",
    title: "سطح مناسب فرزندتان",
    body: "از بین ۱۴ سطح پلی‌تاک، سطحی که با نتیجهٔ تعیین سطح جور است برای شروع پیشنهاد می‌شود.",
  },
  {
    short: "کلاس",
    title: "انتخاب کلاس",
    body: "هفته‌ای ۲ جلسهٔ ۹۰ دقیقه‌ای. روز و ساعت را خودتان از بین کلاس‌های موجودِ آن سطح انتخاب می‌کنید.",
  },
];
const FA = "۰۱۲۳۴۵۶۷۸۹";
const LAST = STEPS.length;

export default function TownTour() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<TownScene | null>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  stepRef.current = step;
  const [paused, setPaused] = useState(false);
  const [noWebGL, setNoWebGL] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [hint, setHint] = useState(true);
  const musicRef = useRef<ReturnType<typeof createMusic> | null>(null);

  const toggleMusic = useCallback((next: boolean) => {
    musicRef.current ??= createMusic();
    if (next) musicRef.current.start();
    else musicRef.current.stop();
    localStorage.setItem(MUSIC_KEY, next ? "1" : "0");
    setMusicOn(next);
  }, []);

  useEffect(() => {
    let disposed = false;
    import("./scene").then(({ createTownScene }) => {
      if (disposed || !canvasRef.current) return;
      try {
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
        sceneRef.current = createTownScene(canvasRef.current, reduced, {
          onArrive: () => musicRef.current?.chime(),
          onInteract: () => setHint(false),
        });
        sceneRef.current.goTo(stepRef.current); // user may click before three.js loads
      } catch {
        setNoWebGL(true);
      }
    });
    return () => {
      disposed = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => sceneRef.current?.goTo(step), [step]);

  // Hide the controls hint after a while even without interaction.
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 9000);
    return () => clearTimeout(t);
  }, []);

  // Music is opt-in (autoplay policy); remembered, but resumed only on the next user gesture.
  useEffect(() => {
    if (localStorage.getItem(MUSIC_KEY) !== "1") return;
    const resume = () => toggleMusic(true);
    addEventListener("pointerdown", resume, { once: true });
    addEventListener("keydown", resume, { once: true });
    return () => {
      removeEventListener("pointerdown", resume);
      removeEventListener("keydown", resume);
    };
  }, [toggleMusic]);
  useEffect(() => () => musicRef.current?.dispose(), []);

  useEffect(() => sceneRef.current?.setPaused(paused), [paused]);

  // RTL: ArrowLeft moves forward, ArrowRight back.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey
      )
        return;
      if (e.key === "ArrowLeft") setStep((s) => Math.min(LAST, s + 1));
      if (e.key === "ArrowRight") setStep((s) => Math.max(0, s - 1));
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const cur = STEPS[Math.max(1, step) - 1];

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-gradient-to-b from-[#7DB8F5] via-[#B9DCFB] to-[#DDEFFD]">
      <canvas
        ref={canvasRef}
        aria-label="نقشهٔ شهر: برای چرخاندن بکشید، برای زوم اسکرول کنید"
        className={`absolute inset-0 size-full cursor-grab touch-none select-none active:cursor-grabbing ${noWebGL ? "hidden" : ""}`}
      />
      {!noWebGL && (
        <p
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-[76px] z-10 mx-auto w-fit rounded-full bg-[#0E1733]/70 px-3.5 py-1 text-[13px] font-semibold text-white backdrop-blur-sm transition-opacity duration-700 md:top-24 ${hint ? "opacity-100" : "opacity-0"}`}
        >
          <span className="md:hidden">
            بکشید تا دور بزنید · دو انگشت برای زوم
          </span>
          <span className="hidden md:inline">
            کشیدن: چرخش · راست‌کلیک: جابه‌جایی · اسکرول: زوم ·{" "}
            <span dir="ltr">WASD</span> حرکت · <span dir="ltr">R</span> بازگشت
          </span>
        </p>
      )}

      <header className="absolute inset-x-3 top-3 z-10 flex items-center justify-between rounded-2xl bg-white py-1.5 ps-2 pe-1.5 shadow-[0_4px_14px_rgba(14,23,51,.16)] md:inset-x-6 md:top-5 md:max-w-sm md:ms-auto">
        <a href="/first" aria-label="پلی‌تاک، صفحهٔ اصلی" className="flex">
          {/* biome-ignore lint/performance/noImgElement: tiny static logo */}
          <img
            src="/assets/website/images/logo-nav.webp"
            alt=""
            className="h-9 w-auto"
          />
        </a>
        <div className="flex items-center gap-1">
          <a
            href="#login"
            className="flex min-h-11 items-center px-2.5 text-[15px] font-bold text-[#1B3A7A]"
          >
            ورود به شهر
          </a>
          <button
            type="button"
            onClick={() => toggleMusic(!musicOn)}
            aria-pressed={musicOn}
            aria-label={musicOn ? "قطع موسیقی" : "پخش موسیقی"}
            className="flex size-11 items-center justify-center rounded-[10px] border border-[#DCE3EF] text-[#0E1733]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
              {musicOn ? (
                <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
              ) : (
                <path d="M17 9l5 6M22 9l-5 6" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? "ادامهٔ حرکت شهر" : "توقف حرکت شهر"}
            className="flex size-11 items-center justify-center rounded-[10px] border border-[#DCE3EF] text-[#0E1733]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d={paused ? "M7 5v14l12-7z" : "M7 5h4v14H7zM13 5h4v14h-4z"}
              />
            </svg>
          </button>
        </div>
      </header>

      <section
        aria-label="مراحل ثبت‌نام"
        className="absolute inset-x-3 bottom-3 z-10 flex flex-col gap-3 rounded-[20px] bg-white px-4 pt-[18px] pb-4 shadow-[0_12px_32px_rgba(14,23,51,.22)] md:inset-x-auto md:bottom-6 md:start-6 md:w-[400px]"
      >
        {step === 0 ? (
          <div key="intro" className="tour-in flex flex-col gap-2.5">
            <h1 className="text-[27px] leading-[1.6] font-black">
              انگلیسی یاد بگیر؛ توی ماینکرفت زندگی‌اش کن.
            </h1>
            <p className="text-base leading-[1.9] text-[#3D4A66]">
              کلاس زندهٔ زبان برای بچه‌های ۷ تا ۱۳ سال؛ بعد از هر درس، تمرین همان
              آموخته‌ها در دنیای ماینکرفت.
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-[14px] bg-[#287A32] text-lg font-extrabold text-white shadow-[0_4px_0_#1B5523] active:translate-y-0.5 active:shadow-[0_2px_0_#1B5523]"
            >
              شروع تعیین سطح
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ol className="grid grid-cols-5 gap-1">
              {STEPS.map((s, i) => {
                const n = i + 1;
                const state = n === step ? "on" : n < step ? "done" : "off";
                return (
                  <li key={s.short}>
                    <button
                      type="button"
                      onClick={() => setStep(n)}
                      aria-current={state === "on" ? "step" : undefined}
                      aria-label={`قدم ${FA[n]}: ${s.title}`}
                      className="flex min-h-[52px] w-full flex-col items-center gap-0.5 py-1"
                    >
                      <span
                        className={`flex size-8 items-center justify-center border-2 text-[15px] font-extrabold transition-colors duration-500 ${
                          state === "on"
                            ? "border-[#1B5523] bg-[#287A32] text-white"
                            : state === "done"
                              ? "border-[#287A32] bg-[#E3F2E4] text-[#1F6A28]"
                              : "border-[#C9D3E6] bg-white text-[#3D4A66]"
                        }`}
                      >
                        {state === "done" ? "✓" : FA[n]}
                      </span>
                      <span className="text-[13px] leading-[1.4] font-bold">
                        {s.short}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div
              key={step}
              aria-live="polite"
              className="tour-in flex min-h-[150px] flex-col gap-1.5"
            >
              <span className="text-sm font-extrabold text-[#287A32]">
                قدم {FA[step]} از ۵
              </span>
              <h2 className="text-[22px] leading-[1.6] font-black">
                {cur.title}
              </h2>
              <p className="text-base leading-[1.9] text-[#3D4A66]">
                {cur.body}
              </p>
              {cur.account && (
                <ul
                  aria-label="اطلاعات لازم برای ساخت حساب"
                  className="mt-1 flex flex-wrap gap-1.5"
                >
                  {["نام و نام خانوادگی", "شماره موبایل", "رمز عبور"].map(
                    (t) => (
                      <li
                        key={t}
                        className="rounded-lg border border-[#DCE3EF] bg-[#F1F4FA] px-2.5 py-0.5 text-sm font-semibold"
                      >
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="min-h-[52px] rounded-[14px] border-[1.5px] border-[#C9D3E6] px-4 text-base font-bold text-[#1B3A7A]"
              >
                {step === 1 ? "بازگشت" : "قبلی"}
              </button>
              {step < LAST ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="min-h-[52px] flex-1 rounded-[14px] bg-[#1B3A7A] text-[17px] font-extrabold text-white"
                >
                  قدم بعد
                </button>
              ) : (
                <a
                  href="#register"
                  className="flex min-h-[52px] flex-1 items-center justify-center rounded-[14px] bg-[#287A32] text-[17px] font-extrabold text-white shadow-[0_4px_0_#1B5523]"
                >
                  ساخت حساب و شروع
                </a>
              )}
            </div>
            <a
              href="#register"
              className="flex min-h-11 items-center justify-center text-[15px] font-semibold text-[#1B3A7A]"
            >
              رد شدن و رفتن مستقیم به ثبت‌نام
            </a>
          </div>
        )}
      </section>
    </div>
  );
}
