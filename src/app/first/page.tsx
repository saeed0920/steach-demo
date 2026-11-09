import type { Metadata } from "next";
import localFont from "next/font/local";
import TownTour from "./town-tour";

const estedad = localFont({
  src: [
    {
      path: "../../../public/assets/website/fonts/Estedad-Regular.woff2",
      weight: "400",
    },
    {
      path: "../../../public/assets/website/fonts/Estedad-SemiBold.woff2",
      weight: "600",
    },
    {
      path: "../../../public/assets/website/fonts/Estedad-Bold.woff2",
      weight: "700",
    },
    {
      path: "../../../public/assets/website/fonts/Estedad-ExtraBold.woff2",
      weight: "800",
    },
    {
      path: "../../../public/assets/website/fonts/Estedad-Black.woff2",
      weight: "900",
    },
  ],
});

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
