import Link from "next/link";
import { estedad } from "./fonts";

const DESIGNS = [
  {
    href: "/first",
    title: "۱ · شهر زنده",
    note: "تور سه‌بعدی ماینکرفتی مراحل ثبت‌نام",
  },
  {
    href: "/second",
    title: "۲ · شیشه‌ای — منظره",
    note: "لندینگ کامل با کارت‌های شیشه‌ای روی منظره",
  },
];

export default function Designs() {
  return (
    <main
      dir="rtl"
      lang="fa"
      className={`${estedad.className} mx-auto flex min-h-dvh max-w-xl flex-col gap-4 p-6 text-[#0E1733]`}
    >
      <h1 className="text-2xl font-black">طرح‌های پلی‌تاک</h1>
      <ul className="flex flex-col gap-3">
        {DESIGNS.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="flex flex-col rounded-2xl border border-[#DCE3EF] bg-white p-4 transition hover:border-[#1B3A7A]"
            >
              <span className="text-lg font-extrabold">{d.title}</span>
              <span className="text-[#3D4A66]">{d.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
