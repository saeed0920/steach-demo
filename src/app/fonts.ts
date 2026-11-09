import localFont from "next/font/local";

// Estedad (Persian UI font) shared by every design route.
export const estedad = localFont({
  src: [
    {
      path: "../../public/assets/website/fonts/Estedad-Regular.woff2",
      weight: "400",
    },
    {
      path: "../../public/assets/website/fonts/Estedad-SemiBold.woff2",
      weight: "600",
    },
    {
      path: "../../public/assets/website/fonts/Estedad-Bold.woff2",
      weight: "700",
    },
    {
      path: "../../public/assets/website/fonts/Estedad-ExtraBold.woff2",
      weight: "800",
    },
    {
      path: "../../public/assets/website/fonts/Estedad-Black.woff2",
      weight: "900",
    },
  ],
});
