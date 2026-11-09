import type { Metadata } from "next";
import Image from "next/image";
import { BASE_PATH } from "../base-path";
import { estedad } from "../fonts";
import {
  ActiveNav,
  HeroVideo,
  MobileMenu,
  TownTabs,
  VideoDialog,
} from "./islands";

export const metadata: Metadata = {
  title: "پلی‌تاک — شیشه‌ای، منظره",
  description:
    "کلاس زندهٔ زبان انگلیسی برای بچه‌های ۷ تا ۱۳ سال، با تمرین در دنیای ماینکرفت.",
};

const IMG = `${BASE_PATH}/assets/website/images`;
const INTRO = {
  src: `${BASE_PATH}/assets/website/videos/v1-landing-what-is-playtalk.mp4`,
  poster: `${IMG}/v1-landing-poster.webp`,
  title: "پلی‌تاک چیه؟",
};
const LINKS = {
  aparat: "https://www.aparat.com/playtalk",
  instagram: "https://www.instagram.com/playtalk.org_",
  bale: "https://ble.ir/PLAYTALK_ADMIN",
  rubika: "https://rubika.ir/play_talk",
  whatsapp: "https://wa.me/989924466793",
  tel: "tel:+982152756000",
};

const PENDING = "نیاز به تأیید تیم پلی‌تاک — ";
const FAQ = [
  {
    q: "آیا فرزندم باید از قبل انگلیسی بلد باشد؟",
    a: "نه. اگر از صفر شروع می‌کند، مستقیم از سطح اول شروع می‌کند؛ برای بقیه، سطح شروع با تعیین سطح مشخص می‌شود.",
  },
  {
    q: "آیا باید ماینکرفت بلد باشد؟",
    a: `${PENDING}پاسخ این سؤال هنوز مشخص نشده است.`,
    pending: true,
  },
  {
    q: "هر جلسه چقدر طول می‌کشد؟",
    a: "هر جلسه ۹۰ دقیقه است: ۴۵ دقیقه کلاس زندهٔ آنلاین با مدرس، بعد ۴۵ دقیقه تمرین در سرور اختصاصی ماینکرفت همراه یک گیمر انگلیسی‌زبان.",
  },
  {
    q: "سطح مناسب چطور مشخص می‌شود؟",
    a: "با یک بازی کوتاه آنلاین تعیین سطح. اگر لازم باشد، یک جلسهٔ ۱۵ دقیقه‌ای آنلاین با مدرس هم برگزار می‌شود.",
  },
  {
    q: "زمان کلاس‌ها چطور انتخاب می‌شود؟",
    a: "کلاس‌ها هفته‌ای ۲ جلسه است. روز و ساعت را خودتان از بین کلاس‌های موجودِ سطح فرزندتان انتخاب می‌کنید.",
  },
  {
    q: "چه دستگاه و اینترنتی لازم است؟",
    a: `${PENDING}حداقل دستگاه و سرعت اینترنت.`,
    pending: true,
  },
  {
    q: "هزینه و شرایط ثبت‌نام چیست؟",
    a: `${PENDING}شهریه، شرایط پرداخت و انصراف.`,
    pending: true,
  },
];
const TOWN = [
  {
    label: "ترم‌ها و مباحث",
    title: "۱۴ سطح؛ هر سطح یک ترم",
    pts: [
      "هر ترم ۱۲ جلسه است؛ هفته‌ای ۲ جلسه",
      "جزوهٔ اختصاصی پلی‌تاک بر پایهٔ کتاب‌های مرجع آموزش زبان کودکان",
    ],
  },
  {
    label: "تعیین سطح",
    title: "اول سطح، بعد کلاس",
    pts: [
      "یک بازی کوتاه آنلاین تا ببینیم چقدر انگلیسی بلد است",
      "اگر از صفر شروع می‌کند، مستقیم از سطح اول شروع می‌کند",
      "اگر لازم باشد، یک جلسهٔ ۱۵ دقیقه‌ای آنلاین با مدرس",
    ],
  },
  {
    label: "زمان‌بندی کلاس‌ها",
    title: "هر جلسه ۱٫۵ ساعت",
    pts: [
      "اول درس با مدرس، در کلاس زندهٔ آنلاین",
      "بعد ۴۵ دقیقه با گیمر در سرور اختصاصی ماینکرفت، کاملاً انگلیسی",
      "هفته‌ای ۲ جلسه؛ روز و ساعت را از بین کلاس‌های سطح انتخاب می‌کنید",
    ],
  },
  {
    label: "تمرین و ارزیابی",
    title: "تمرین با بازی، نه مشق شب",
    pts: [
      "تکلیف‌ها در ماینکرفت و با ساخت ویدیو انجام می‌شود",
      "ارزیابی با کوییز و بازی‌های آنلاین",
      "آزمون اسپیکینگ در پایان هر ترم",
    ],
  },
  {
    label: "امکانات مکمل",
    title: "فراتر از کلاس",
    pts: [
      "هر ترم یک پروژه: تدوین، کارگردانی و صداگذاری با هوش مصنوعی",
      "هفته‌ای ۲ تماس انگلیسی با پشتیبان آموزشی",
      "بازی‌های هفتگی با لیدربورد و جایزه، و مدیتیشن به انگلیسی",
    ],
    note: true,
  },
];
const LEVELS = [
  ["۱", "Concrete1", "#C9CED6", "Pre-A1", "سلام و الفبای ساده"],
  ["۲", "Concrete2", "#A8AFBA", "Pre-A1", "خواندن و نوشتن کلمات ساده"],
  ["۳", "Stone", "#8B8F95", "Pre-A1 / A1", "جمله‌های ساده با I have"],
  ["۴", "Coal", "#3A3D42", "A1", "جمله‌های کوتاه"],
  ["۵", "Copper", "#C26A3D", "A1", "صحبت در کلاس"],
  ["۶", "Iron", "#DADDE2", "A1+ / A2", "داستان ساده"],
  ["۷", "Redstone", "#C0281E", "A2", "توضیح کارها"],
  ["۸", "Obsidian", "#2B1B3F", "A2+", "نظر دادن"],
  ["۹", "Gold", "#F2C230", "B1", "بحث کوتاه"],
  ["۱۰", "Lapis", "#2A4FB0", "B1+", "خواندن متن"],
  ["۱۱", "Diamond", "#4FD8D2", "B2", "نگارش ساده"],
  ["۱۲", "Emerald", "#22B356", "B2+", "صحبت روان‌تر"],
  ["۱۳", "Glass", "#D6F1F6", "B2+ / C1", "نوشتن استدلالی و ارائه"],
  ["۱۴", "Netherite", "#4A3F3F", "C1", "سطح پیشرفته"],
];
const VIDEOS = [
  {
    kind: "نمونه کلاس",
    title: "تمرین‌های خلاقانهٔ پلی‌تاکی‌ها به زبان انگلیسی",
    img: `${IMG}/72341914-9100-l__7079.jpg`,
  },
  {
    kind: "تجربهٔ خانواده‌ها",
    title: "نظر والدین و زبان‌آموزان",
    img: `${IMG}/66678921-6350-l__2560.jpg`,
  },
  {
    kind: "مدیرعامل",
    title: "صحبت‌های مدیرعامل پلی‌تاک",
    img: `${IMG}/71054426-9411-l__4668.jpg`,
  },
];
const NAV = [
  ["#method", "روش آموزش"],
  ["#videos", "ویدیوها"],
  ["#levels", "۱۴ سطح"],
  ["#faq", "سوال‌ها"],
];

const Play = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17 5v14L6 12z" />
  </svg>
);
const Chevron = () => (
  <svg
    className="btn-icon"
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
);
// Button looks live in globals.css (.btn-*): 3D press, hover lift, shine sweep, icon nudge.
const btnGreen = "btn btn-primary min-h-14 text-lg";
const btnOutline = "btn btn-outline min-h-[50px]";
const card = "rounded-2xl border border-[#DCE3EF] bg-white";
const h2 = "text-[25px] leading-[1.6] font-black md:text-[32px]";
const wrap = "mx-auto w-full max-w-6xl px-4 md:px-8";

function Level({ l }: { l: string[] }) {
  return (
    <li className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#EEF1F7] py-3">
      <span
        aria-hidden="true"
        className="size-8 border border-[#0E1733]/25 shadow-[inset_-4px_-4px_0_rgba(0,0,0,.22),inset_4px_4px_0_rgba(255,255,255,.35)]"
        style={{ background: l[2] }}
      />
      <div className="flex min-w-0 flex-col leading-[1.6]">
        <span className="text-base font-extrabold">
          سطح {l[0]} ·{" "}
          <span lang="en" dir="ltr">
            {l[1]}
          </span>
        </span>
        <span className="text-[15px] text-[#3D4A66]">{l[4]}</span>
      </div>
      <span
        lang="en"
        dir="ltr"
        className="rounded-md bg-[#E6EDFB] px-2 py-0.5 text-[13px] font-bold whitespace-nowrap text-[#1B3A7A]"
      >
        {l[3]}
      </span>
    </li>
  );
}

export default function SecondDesign() {
  return (
    <div
      dir="rtl"
      lang="fa"
      className={`${estedad.className} bg-[#F7F8FC] text-[17px] leading-[1.9] text-[#0E1733]`}
    >
      <a href="#main" className="skip-link">
        پرش به محتوای اصلی
      </a>

      {/* Glass header, fixed over every section */}
      <div aria-hidden="true" className="scroll-progress" />
      <div aria-hidden="true" className="page-loader">
        <Image
          src={`${IMG}/logo-nav.webp`}
          alt=""
          width={96}
          height={68}
          priority
          className="h-[68px] w-auto"
        />
        <span className="pixel-loader">
          <i />
          <i />
          <i />
        </span>
      </div>
      <header className="site-header fixed inset-x-3 top-3 z-30 md:inset-x-6">
        <div
          className={`glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl py-1.5 ps-2 pe-1.5 shadow-[0_6px_20px_rgba(14,23,51,.14)]`}
        >
          <a href="#top" aria-label="پلی‌تاک، صفحهٔ اصلی" className="flex ps-1.5">
            <Image
              src={`${IMG}/logo-nav.webp`}
              alt=""
              width={54}
              height={38}
              priority
              className="h-[38px] w-auto"
            />
          </a>
          <ActiveNav items={NAV} />
          <div className="flex items-center gap-1">
            <a
              href="#login"
              className="btn btn-ghost min-h-11 px-3 text-[15px]"
            >
              ورود به شهر
            </a>
            <button
              type="button"
              popoverTarget="main-menu"
              className="mobile-menu btn btn-dark h-11 min-w-[76px] gap-1.5 rounded-xl px-3 text-[15px] lg:hidden"
            >
              منو
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
        {/* Native popover: Esc / outside click close it for free. */}
        <MobileMenu>
          {[
            ["#method", "روش آموزش"],
            ["#levels", "سطح‌ها"],
            ["#videos", "تجربه خانواده‌ها"],
            ["#faq", "سوالات متداول"],
            ["#contact", "تماس"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="flex min-h-[50px] items-center border-b border-[#E3E8F2] font-bold"
            >
              {label}
            </a>
          ))}
          <a
            href={LINKS.tel}
            className="flex min-h-[50px] items-center justify-between font-semibold text-[#1B3A7A]"
          >
            تلفن پشتیبانی <span dir="ltr">۰۲۱-۵۲۷۵۶۰۰۰</span>
          </a>
        </MobileMenu>
      </header>

      {/* HERO: live Minecraft landscape behind glass */}
      <section
        id="top"
        className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden px-3 pt-[260px] pb-5 md:justify-center md:px-8 md:pt-24"
      >
        <HeroVideo
          src={`${BASE_PATH}/assets/website/videos/playtalk-hero.mp4`}
          portraitSrc={`${BASE_PATH}/assets/website/videos/playtalk-hero-portrait.mp4`}
          still={
            <>
              {/* Art-directed first frame (LCP) — swapped for the branded end card under reduced motion. */}
              <picture className="motion-reduce:hidden">
                <source
                  media="(max-aspect-ratio: 4/5)"
                  srcSet={`${IMG}/playtalk-hero-first-portrait.webp`}
                />
                <img
                  src={`${IMG}/playtalk-hero-first.webp`}
                  alt=""
                  fetchPriority="high"
                  className="absolute inset-0 size-full object-cover"
                />
              </picture>
              <picture className="hidden motion-reduce:block">
                <source
                  media="(max-aspect-ratio: 4/5)"
                  srcSet={`${IMG}/playtalk-hero-poster-portrait.webp`}
                />
                <img
                  src={`${IMG}/playtalk-hero-poster.webp`}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              </picture>
            </>
          }
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0E1733]/0 via-[#0E1733]/10 to-[#0E1733]/55 md:bg-gradient-to-l md:from-[#0E1733]/45 md:via-[#0E1733]/10 md:to-transparent"
        />

        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-3.5 md:max-w-[480px]">
            <div className="glass stagger flex flex-col gap-3.5 rounded-[22px] px-[18px] py-[22px] shadow-[0_14px_36px_rgba(14,23,51,.2)] md:p-7">
              <h1 className="text-[29px] leading-[1.6] font-black md:text-[36px]">
                انگلیسی یاد بگیر؛ توی ماینکرفت زندگی‌اش کن.
              </h1>
              <p className="text-[17px] leading-[1.95] text-[#2A3550]">
                کلاس زندهٔ زبان برای بچه‌های ۷ تا ۱۳ سال؛ بعد از هر درس، تمرین
                همان آموخته‌ها در دنیای ماینکرفت.
              </p>
              <ul aria-label="در یک نگاه" className="flex flex-wrap gap-1.5">
                <li className="rounded-full border border-[#C9D3E6] bg-white px-3 py-1 text-sm font-bold">
                  ۷ تا ۱۳ سال
                </li>
                <li className="rounded-full border border-[#C9D3E6] bg-white px-3 py-1 text-sm font-bold">
                  کلاس زنده
                </li>
                <li className="rounded-full border border-[#C99A12] bg-[#FFD24A] px-3 py-1 text-sm font-bold">
                  تمرین در ماینکرفت
                </li>
              </ul>
              <div className="flex flex-col gap-1.5">
                <a href="#start" className={btnGreen}>
                  شروع تعیین سطح
                  <Chevron />
                </a>
                <span className="text-center text-sm leading-[1.7] text-[#3D4A66]">
                  قدم بعد: چند سؤال کوتاه و یک بازی تعیین سطح
                </span>
              </div>
              <a href="#method" className={btnOutline}>
                ببین کلاس‌ها چطور برگزار می‌شن
              </a>
            </div>

            <div className="glass-dark hero-in hero-in-2 overflow-hidden rounded-[18px] text-white">
              <VideoDialog
                {...INTRO}
                className="group flex w-full items-center gap-3 p-2 text-right transition-colors hover:bg-white/5"
              >
                <span className="skel relative h-[54px] w-24 shrink-0 overflow-hidden rounded-[10px]">
                  <Image
                    src={`${IMG}/63522398-9824-l__9675.jpg`}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </span>
                <span className="flex flex-1 flex-col leading-[1.6]">
                  <span className="text-sm text-[#E6ECF8]">ویدیوی معرفی</span>
                  <span className="text-base font-extrabold">پلی‌تاک چیه؟</span>
                </span>
                <span
                  aria-hidden="true"
                  className="play-pulse flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0E1733] transition-transform group-hover:scale-110"
                >
                  <Play />
                </span>
              </VideoDialog>
            </div>
          </div>
        </div>
      </section>

      <main id="main">
        {/* On this page (mobile; desktop has it in the header) */}
        <nav
          aria-label="در این صفحه"
          className={`${wrap} flex flex-col gap-2 pt-5 pb-1 lg:hidden`}
        >
          <span className="text-sm font-bold text-[#3D4A66]">در این صفحه</span>
          <div className="flex flex-wrap gap-2">
            {NAV.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="chip flex min-h-11 items-center rounded-full border border-[#C9D3E6] bg-white px-3.5 text-[15px] font-semibold"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* SESSION */}
        <section
          id="method"
          aria-labelledby="h-method"
          className={`${wrap} grid gap-5 pt-9 pb-10 md:grid-cols-2 md:gap-10 md:py-20`}
        >
          <div className="reveal flex flex-col gap-[18px]">
            <h2 id="h-method" className={h2}>
              هر جلسه: یاد بگیر، بعد بساز
            </h2>
            <p className="text-[#3D4A66]">
              هر جلسه ۹۰ دقیقه است و دو بخش دارد. واژه‌ها و جمله‌های نیمهٔ اول، در
              نیمهٔ دوم توی بازی به کار می‌روند.
            </p>
            <div
              role="img"
              aria-label="یک جلسهٔ ۹۰ دقیقه‌ای: ۴۵ دقیقه کلاس با مدرس، بعد ۴۵ دقیقه تمرین در ماینکرفت"
              className="flex flex-col gap-1.5"
            >
              <div className="flex h-9 overflow-hidden rounded-[10px] text-sm leading-none font-bold text-white">
                <span className="bar-grow flex flex-1 items-center justify-center bg-[#1B3A7A]">
                  ۴۵ دقیقه کلاس
                </span>
                <span className="w-[3px] bg-[#F7F8FC]" />
                <span className="bar-grow bar-grow-2 flex flex-1 items-center justify-center bg-[#287A32]">
                  ۴۵ دقیقه بازی
                </span>
              </div>
              <div className="flex justify-between text-sm text-[#3D4A66]">
                <span>شروع</span>
                <span>دقیقهٔ ۴۵</span>
                <span>دقیقهٔ ۹۰</span>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {[
                ["۱۲", "جلسه در هر ترم"],
                ["۲", "جلسه در هفته"],
                ["۱۴", "سطح آموزشی"],
              ].map(([n, t]) => (
                <div
                  key={t}
                  className={`${card} flex flex-col-reverse px-1 py-3 leading-normal`}
                >
                  <dt className="text-sm text-[#3D4A66]">{t}</dt>
                  <dd className="text-[26px] font-black text-[#1B3A7A]">{n}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col gap-2.5">
            <ol className="flex flex-col gap-2.5">
              <li className={`${card} reveal flex gap-3.5 p-4`}>
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E6EDFB] text-[#1B3A7A]"
                >
                  <svg
                    width="22"
                    height="22"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="12" rx="2" />
                    <path d="M8 20h8M12 16v4" />
                  </svg>
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg leading-[1.6] font-extrabold">
                    بخش ۱ · یادگیری با مدرس
                  </h3>
                  <p className="text-base text-[#3D4A66]">
                    کلاس زندهٔ آنلاین با جزوهٔ اختصاصی پلی‌تاک.
                  </p>
                </div>
              </li>
              <li className={`${card} reveal flex gap-3.5 p-4`}>
                <span
                  aria-hidden="true"
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E3F2E4] text-[#287A32]"
                >
                  <svg
                    width="22"
                    height="22"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
                    <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
                  </svg>
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg leading-[1.6] font-extrabold">
                    بخش ۲ · تمرین در ماینکرفت
                  </h3>
                  <p className="text-base text-[#3D4A66]">
                    در سرور اختصاصی ماینکرفت، کاملاً به انگلیسی و همراه یک گیمر
                    انگلیسی‌زبان.
                  </p>
                </div>
              </li>
            </ol>
            <div className={`${card} reveal flex flex-col gap-2 px-4 py-3.5`}>
              <h3 className="text-[15px] leading-[1.7] font-bold text-[#3D4A66]">
                جزوهٔ پلی‌تاک از این کتاب‌های مرجع تهیه شده:
              </h3>
              <ul
                lang="en"
                dir="ltr"
                className="flex flex-wrap justify-end gap-1.5"
              >
                {[
                  "Superminds",
                  "Kid's Box",
                  "Academy Stars",
                  "Family and Friends",
                  "Oxford Phonics World",
                ].map((b) => (
                  <li
                    key={b}
                    className="rounded-lg bg-[#F1F4FA] px-2.5 py-0.5 text-[15px] leading-[1.8] font-semibold text-[#1B3A7A]"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* VIDEOS on a landscape band */}
        <section
          id="videos"
          aria-labelledby="h-videos"
          className="relative isolate overflow-hidden py-10 md:py-20"
        >
          <Image
            src={`${IMG}/minecraft-bg.webp`}
            alt=""
            fill
            sizes="100vw"
            className="band-media -z-20 object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[#0E1733]/65"
          />
          <div className={`${wrap} flex flex-col gap-3.5`}>
            <div className="reveal flex flex-col gap-1">
              <h2 id="h-videos" className={`${h2} text-white`}>
                پلی‌تاک را از نزدیک ببینید
              </h2>
              <p className="text-[15px] text-[#E6ECF8]">
                ویدیوها فقط با زدن دکمهٔ پخش باز می‌شوند.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-[1.4fr_1fr] md:gap-5">
              <article className="glass reveal overflow-hidden rounded-[18px]">
                <div className="skel group relative aspect-video overflow-hidden">
                  <Image
                    src={`${IMG}/63522398-9824-l__9675.jpg`}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <VideoDialog
                    {...INTRO}
                    className="play-pulse absolute inset-0 m-auto flex size-[60px] items-center justify-center rounded-full border-2 border-white bg-[#0E1733] text-white shadow-[0_4px_14px_rgba(0,0,0,.35)] transition-transform hover:scale-110 active:scale-95"
                  >
                    <Play size={22} />
                  </VideoDialog>
                </div>
                <div className="px-4 pt-3 pb-3.5">
                  <span className="text-sm font-bold text-[#1B3A7A]">
                    معرفی
                  </span>
                  <h3 className="text-[17px] leading-[1.7] font-extrabold">
                    پلی‌تاک چیه؟ کلاس زبان + دنیای ماینکرفت
                  </h3>
                </div>
              </article>
              <ul className="flex flex-col gap-2">
                {VIDEOS.map((v) => (
                  <li key={v.title} className="reveal">
                    <a
                      href={LINKS.aparat}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${v.title} — دیدن در آپارات (پنجرهٔ جدید)`}
                      className="glass lift group flex w-full items-center gap-3 rounded-[14px] p-2"
                    >
                      <span className="skel relative h-14 w-[100px] shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={v.img}
                          alt=""
                          fill
                          sizes="100px"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </span>
                      <span className="flex flex-1 flex-col leading-[1.6]">
                        <span className="text-sm font-bold text-[#1B3A7A]">
                          {v.kind}
                        </span>
                        <span className="text-base font-extrabold">
                          {v.title}
                        </span>
                        <span className="text-[13px] text-[#3D4A66]">
                          در آپارات ↗
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* LEVELS: progressive disclosure via native <details> */}
        <section
          id="levels"
          aria-labelledby="h-levels"
          className={`${wrap} flex flex-col gap-4 py-10 md:py-20`}
        >
          <div className="reveal flex max-w-2xl flex-col gap-1.5">
            <h2 id="h-levels" className={h2}>
              مسیر ۱۴ سطحی
            </h2>
            <p className="text-[#3D4A66]">
              هر سطح یک ترم است و اسم یکی از مواد ماینکرفت را دارد. لازم نیست از
              اول شروع کنید: سطح شروع را تعیین سطح مشخص می‌کند.
            </p>
          </div>
          <div className="reveal rounded-[18px] border border-[#DCE3EF] bg-white px-3.5 py-1">
            <ol className="md:grid md:grid-cols-2 md:gap-x-8">
              {LEVELS.slice(0, 6).map((l) => (
                <Level key={l[1]} l={l} />
              ))}
            </ol>
            <details className="group">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-center gap-1.5 font-bold text-[#1B3A7A] [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">نمایش هر ۱۴ سطح</span>
                <span className="hidden group-open:inline">نمایش کمتر</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="transition group-open:rotate-180"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <ol start={7} className="md:grid md:grid-cols-2 md:gap-x-8">
                {LEVELS.slice(6).map((l) => (
                  <Level key={l[1]} l={l} />
                ))}
              </ol>
            </details>
          </div>
        </section>

        {/* TOWN tabs on landscape */}
        <section
          aria-labelledby="h-town"
          className="relative isolate overflow-hidden py-10 md:py-20"
        >
          <Image
            src={`${IMG}/hero-bg.webp`}
            alt=""
            fill
            sizes="100vw"
            className="band-media -z-10 object-cover object-[80%_center]"
          />
          <div className={`${wrap} flex flex-col gap-3.5`}>
            <div className="glass reveal flex flex-col gap-1 rounded-2xl px-4 py-3.5 md:max-w-xl">
              <span
                lang="en"
                dir="ltr"
                aria-hidden="true"
                className="self-end font-['Press_Start_2P',monospace] text-[9px] leading-[1.6] text-[#1F6A28]"
              >
                PLAYTALK TOWN
              </span>
              <h2 id="h-town" className="text-[23px] leading-[1.6] font-black">
                شهر کوچیک پلی‌تاک
              </h2>
              <p className="text-[15px] text-[#2A3550]">
                یک ساختمان را انتخاب کن تا درباره‌اش بخوانی.
              </p>
            </div>
            <TownTabs town={TOWN} />
          </div>
        </section>

        {/* FAQ: exclusive native accordion */}
        <section
          id="faq"
          aria-labelledby="h-faq"
          className={`${wrap} flex max-w-3xl flex-col gap-3.5 py-10 md:py-20`}
        >
          <h2 id="h-faq" className={`${h2} reveal`}>
            سوال‌های والدین
          </h2>
          <div className="reveal overflow-hidden rounded-[18px] border border-[#DCE3EF] bg-white">
            {FAQ.map((f, i) => (
              <details
                key={f.q}
                name="faq"
                open={i === 0}
                className="group border-b border-[#EEF1F7] last:border-b-0"
              >
                <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base leading-[1.7] font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#EEF3FD] text-xl leading-none text-[#1B3A7A] transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  {f.pending ? (
                    <p className="rounded-[10px] border border-dashed border-[#C99A12] bg-[#FFF6D6] px-3 py-2.5 text-[15px] leading-[1.8] text-[#5C4400]">
                      {f.a}
                    </p>
                  ) : (
                    <p className="text-base leading-[1.95] text-[#3D4A66]">
                      {f.a}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>
          <p className="text-[15px] text-[#3D4A66]">
            جواب سؤالتان اینجا نیست؟{" "}
            <a
              href="#contact"
              className="font-bold text-[#1B3A7A] underline-offset-4 hover:underline"
            >
              با تیم پلی‌تاک صحبت کنید
            </a>
          </p>
        </section>

        {/* FINAL CTA */}
        <section
          id="start"
          aria-labelledby="h-start"
          className="relative isolate overflow-hidden px-4 pt-16 pb-11 md:py-24"
        >
          <Image
            src={`${IMG}/minecraft-bg.webp`}
            alt=""
            fill
            sizes="100vw"
            className="band-media -z-10 object-cover object-[20%_center]"
          />
          <div className="glass reveal relative mx-auto flex max-w-xl flex-col gap-3.5 rounded-[22px] px-5 py-6 md:p-8">
            <Image
              src={`${IMG}/cta-character.webp`}
              alt=""
              width={92}
              height={113}
              className="float-char -mt-16 self-start md:absolute md:-top-[104px] md:end-6 md:mt-0 md:w-[120px]"
            />
            <h2
              id="h-start"
              className="text-2xl leading-[1.65] font-black md:text-[28px]"
            >
              اولین قدم، پیدا کردن سطح مناسب فرزند شماست.
            </h2>
            <ol className="flex flex-col gap-2">
              {[
                ["۱", "چند سؤال کوتاه", "#1B3A7A"],
                ["۲", "یک بازی تعیین سطح", "#1B3A7A"],
                ["۳", "انتخاب کلاسی که با سطح و برنامهٔ او جور است", "#287A32"],
              ].map(([n, t, c]) => (
                <li key={n} className="flex items-center gap-2.5 text-base">
                  <span
                    aria-hidden="true"
                    className="flex size-[30px] shrink-0 items-center justify-center rounded-lg text-[15px] font-extrabold text-white"
                    style={{ background: c }}
                  >
                    {n}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <a href="#register" className={btnGreen}>
              شروع تعیین سطح
            </a>
            <a href="#contact" className={btnOutline}>
              صحبت با تیم پلی‌تاک
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-[#DCE3EF] bg-white">
        <div
          className={`${wrap} grid gap-6 pt-8 pb-7 md:grid-cols-3 md:gap-10 md:py-14`}
        >
          <div className="flex items-center gap-3 md:flex-col md:items-start">
            <Image
              src={`${IMG}/logo-nav.webp`}
              alt="پلی‌تاک"
              width={62}
              height={44}
              className="h-11 w-auto"
            />
            <p className="text-[15px] leading-[1.8] text-[#3D4A66]">
              کلاس زندهٔ زبان برای بچه‌های ۷ تا ۱۳ سال، با تمرین در ماینکرفت.
            </p>
          </div>
          <nav aria-label="ثبت‌نام و آموزش" className="flex flex-col">
            <h2 className="mb-1 text-[15px] font-extrabold">ثبت‌نام و آموزش</h2>
            {[
              ["#start", "شروع تعیین سطح"],
              ["#levels", "سطح‌ها و محتوای آموزشی"],
              ["#login", "ورود به شهر"],
            ].map(([href, t]) => (
              <a
                key={href}
                href={href}
                className="flex min-h-11 items-center text-[#1B3A7A] hover:underline"
              >
                {t}
              </a>
            ))}
          </nav>
          <div className="flex flex-col">
            <h2 className="mb-1 text-[15px] font-extrabold">پشتیبانی و تماس</h2>
            {[
              [LINKS.tel, "تلفن", "۰۲۱-۵۲۷۵۶۰۰۰"],
              [LINKS.whatsapp, "واتس‌اپ", "+۹۸ ۹۹۲ ۴۴۶ ۶۷۹۳"],
              [LINKS.instagram, "اینستاگرام", "@playtalk.org_"],
            ].map(([href, t, v]) => (
              <a
                key={t}
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex min-h-12 items-center justify-between border-b border-[#EEF1F7] text-[#1B3A7A]"
              >
                {t} <span dir="ltr">{v}</span>
              </a>
            ))}
            <div className="mt-2.5 flex gap-2">
              {[
                [LINKS.bale, "بله"],
                [LINKS.rubika, "روبیکا"],
                [LINKS.aparat, "آپارات"],
              ].map(([href, t]) => (
                <a
                  key={t}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-soft min-h-12 flex-1 rounded-xl text-[15px]"
                >
                  {t}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`${wrap} flex items-center justify-between border-t border-[#EEF1F7] pt-3.5 pb-4 text-sm text-[#3D4A66]`}
        >
          <span>
            © ۱۴۰۵ پلی‌تاک · <span dir="ltr">Steach</span>
          </span>
          <span className="flex gap-1">
            <a href="#privacy" className="flex min-h-11 items-center px-1.5">
              حریم خصوصی
            </a>
            <a href="#terms" className="flex min-h-11 items-center px-1.5">
              قوانین
            </a>
          </span>
        </div>
      </footer>
      <a
        href="#top"
        className="to-top btn btn-dark fixed bottom-4 end-4 z-20 size-12 rounded-full"
      >
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
          <path d="M6 15l6-6 6 6" />
        </svg>
        <span className="sr-only">بازگشت به بالای صفحه</span>
      </a>
    </div>
  );
}
