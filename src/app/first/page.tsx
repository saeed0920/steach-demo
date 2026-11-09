import type { Metadata } from "next";
import { estedad } from "../fonts";
import TownTour from "./town-tour";

export const metadata: Metadata = {
  title: "پلی‌تاک — شهر زنده",
  description:
    "کلاس زندهٔ زبان انگلیسی برای بچه‌های ۷ تا ۱۳ سال، با تمرین در دنیای ماینکرفت.",
};

export default function FirstDesign() {
  return (
    <main
      dir="rtl"
      lang="fa"
      className={`${estedad.className} text-[17px] leading-[1.9] text-[#0E1733]`}
    >
      <TownTour />
    </main>
  );
}
