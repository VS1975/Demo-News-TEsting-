import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Demo News",
    template: "%s | Demo News",
  },
  description: "A training demo for an automated news publishing pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header>
          <div className="container nav">
            <a className="brand" href="/">Demo News</a>
            <nav>
              <a href="/news">Latest News</a>
              <a href="/sitemap.xml">Sitemap</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
