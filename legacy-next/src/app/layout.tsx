import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "بابک زنگنه محبی | طراح گرافیک، تدوینگر و معمار بصری",
  description: "پورتفولیو شخصی بابک زنگنه محبی - متخصص طراحی گرافیک تخصصی، تدوین سینماتیک ویدیو، موشن‌گرافی، مدل‌سازی سه‌بعدی و تهیه محتوای چندرسانه‌ای با ابزارهای روز دنیا.",
  authors: [{ name: "بابک زنگنه محبی" }],
  keywords: [
    "بابک زنگنه محبی",
    "طراح گرافیک",
    "تدوینگر ویدیو",
    "موشن گرافیک",
    "طراحی هویت بصری",
    "تیزر تبلیغاتی",
    "مدلسازی سه بعدی",
    "تهیه کننده محتوا",
    "پورتفولیو گرافیک",
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full antialiased dark"
    >
      <body className="min-h-full bg-[#070709] text-[#f3f4f6] font-sans selection:bg-[#ff6b35] selection:text-black overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

